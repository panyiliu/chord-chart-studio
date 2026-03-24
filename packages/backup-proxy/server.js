/* eslint-env node */
const express = require('express');
const cors = require('cors');
const {
	S3Client,
	ListObjectsV2Command,
	ListObjectVersionsCommand,
	DeleteObjectCommand,
	PutObjectCommand,
	GetObjectCommand,
	HeadBucketCommand,
} = require('@aws-sdk/client-s3');

const PORT = Number(process.env.BACKUP_PROXY_PORT || 8787);
const CORS_ORIGIN = process.env.BACKUP_PROXY_CORS_ORIGIN || '*';

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '8mb' }));

function badRequest(res, message) {
	return res.status(400).json({ success: false, message });
}

function makeClient(cfg) {
	const endpoint = cfg.endpointUrl || 'https://s3.us-east-005.backblazeb2.com';
	const region = cfg.regionName || 'us-east-005';
	return new S3Client({
		region,
		endpoint,
		credentials: {
			accessKeyId: cfg.accountId,
			secretAccessKey: cfg.applicationKey,
		},
		forcePathStyle: true,
	});
}

function readConfig(body = {}) {
	return {
		accountId: String(body.accountId || '').trim(),
		applicationKey: String(body.applicationKey || '').trim(),
		bucketName: String(body.bucketName || '').trim(),
		objectKey: String(body.objectKey || '').trim(),
		endpointUrl: String(body.endpointUrl || '').trim(),
		regionName: String(body.regionName || '').trim(),
	};
}

function ensureConfig(cfg) {
	return !!(
		cfg.accountId &&
		cfg.applicationKey &&
		cfg.bucketName &&
		cfg.objectKey
	);
}

async function streamToString(stream) {
	return await new Promise((resolve, reject) => {
		const chunks = [];
		stream.on('data', (c) => chunks.push(Buffer.from(c)));
		stream.on('error', reject);
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
	});
}

async function listVersionsForKey(client, bucketName, objectKey) {
	const out = [];
	let KeyMarker;
	let VersionIdMarker;

	for (let i = 0; i < 20; i++) {
		const res = await client.send(
			new ListObjectVersionsCommand({
				Bucket: bucketName,
				Prefix: objectKey,
				KeyMarker,
				VersionIdMarker,
				MaxKeys: 1000,
			})
		);
		const versions = (res.Versions || []).filter((v) => v.Key === objectKey);
		out.push(...versions);
		if (!res.IsTruncated) break;
		KeyMarker = res.NextKeyMarker;
		VersionIdMarker = res.NextVersionIdMarker;
	}

	return out;
}

app.get('/health', (_req, res) => {
	res.json({ success: true, service: 'backup-proxy', port: PORT });
});

app.post('/api/backup/test', async (req, res) => {
	try {
		const cfg = readConfig(req.body);
		if (!ensureConfig(cfg)) {
			return badRequest(res, 'Missing required Backblaze config');
		}

		const client = makeClient(cfg);
		await client.send(new HeadBucketCommand({ Bucket: cfg.bucketName }));

		const list = await client.send(
			new ListObjectsV2Command({
				Bucket: cfg.bucketName,
				MaxKeys: 5,
			})
		);

		return res.json({
			success: true,
			message: 'Connection ok',
			bucketName: cfg.bucketName,
			objectCountHint: Number(list.KeyCount || 0),
		});
	} catch (e) {
		return res.status(500).json({
			success: false,
			message: String(e && e.message ? e.message : e),
		});
	}
});

app.post('/api/backup/count', async (req, res) => {
	try {
		const cfg = readConfig(req.body);
		if (!ensureConfig(cfg)) {
			return badRequest(res, 'Missing required Backblaze config');
		}
		const client = makeClient(cfg);
		const versions = await listVersionsForKey(
			client,
			cfg.bucketName,
			cfg.objectKey
		);
		return res.json({
			success: true,
			count: versions.length,
		});
	} catch (e) {
		return res.status(500).json({
			success: false,
			message: String(e && e.message ? e.message : e),
		});
	}
});

app.post('/api/backup/upload', async (req, res) => {
	try {
		const cfg = readConfig(req.body);
		const jsonTextRaw = String(req.body?.jsonText || '');
		if (!ensureConfig(cfg)) {
			return badRequest(res, 'Missing required Backblaze config');
		}
		if (!jsonTextRaw) {
			return badRequest(res, 'jsonText is required');
		}
		let parsed;
		try {
			parsed = JSON.parse(jsonTextRaw);
		} catch {
			return badRequest(res, 'jsonText must be valid JSON');
		}
		// Canonicalize to avoid accidental trailing junk and improve readability.
		const jsonText = JSON.stringify(parsed, null, 2);
		const client = makeClient(cfg);

		await client.send(
			new PutObjectCommand({
				Bucket: cfg.bucketName,
				Key: cfg.objectKey,
				Body: jsonText,
				ContentType: 'application/json',
			})
		);

		// Keep only one version: keep latest by LastModified, delete older ones.
		const versions = await listVersionsForKey(
			client,
			cfg.bucketName,
			cfg.objectKey
		);
		const sorted = [...versions].sort((a, b) => {
			const ta = new Date(a.LastModified || 0).getTime();
			const tb = new Date(b.LastModified || 0).getTime();
			return tb - ta;
		});
		const keep = sorted[0];
		const toDelete = sorted.slice(1);

		for (const v of toDelete) {
			// eslint-disable-next-line no-await-in-loop
			await client.send(
				new DeleteObjectCommand({
					Bucket: cfg.bucketName,
					Key: cfg.objectKey,
					VersionId: v.VersionId,
				})
			);
		}

		return res.json({
			success: true,
			message: 'Backup uploaded',
			keptVersionId: keep?.VersionId || null,
			deletedVersions: toDelete.length,
		});
	} catch (e) {
		return res.status(500).json({
			success: false,
			message: String(e && e.message ? e.message : e),
		});
	}
});

app.post('/api/backup/download', async (req, res) => {
	try {
		const cfg = readConfig(req.body);
		if (!ensureConfig(cfg)) {
			return badRequest(res, 'Missing required Backblaze config');
		}
		const client = makeClient(cfg);
		const out = await client.send(
			new GetObjectCommand({
				Bucket: cfg.bucketName,
				Key: cfg.objectKey,
			})
		);

		const jsonText = await streamToString(out.Body);
		const versions = await listVersionsForKey(
			client,
			cfg.bucketName,
			cfg.objectKey
		);
		return res.json({
			success: true,
			versionCount: versions.length,
			jsonText,
		});
	} catch (e) {
		return res.status(500).json({
			success: false,
			message: String(e && e.message ? e.message : e),
		});
	}
});

app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`[backup-proxy] listening on http://localhost:${PORT}`);
});

