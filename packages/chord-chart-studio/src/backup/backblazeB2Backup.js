import { v4 as uuidv4 } from 'uuid';

const LS_B2_ENABLED_KEY = 'chordStudio.backup.platform.backblaze.enabled';
const LS_B2_ACCOUNT_ID_KEY = 'chordStudio.backup.platform.backblaze.accountId';
const LS_B2_APPLICATION_KEY_KEY =
	'chordStudio.backup.platform.backblaze.applicationKey';
const LS_B2_BUCKET_NAME_KEY = 'chordStudio.backup.platform.backblaze.bucketName';
const LS_B2_OBJECT_KEY_KEY =
	'chordStudio.backup.platform.backblaze.objectKey';
const LS_B2_ENDPOINT_URL_KEY =
	'chordStudio.backup.platform.backblaze.endpointUrl';
const LS_B2_REGION_NAME_KEY =
	'chordStudio.backup.platform.backblaze.regionName';
const LS_B2_PROXY_BASE_URL_KEY =
	'chordStudio.backup.platform.backblaze.proxyBaseUrl';

const LS_LAST_CLOUD_COUNT_KEY = 'chordStudio.backup.lastCloudVersionCount';

const DEFAULT_OBJECT_KEY = 'chord-chart-studio/backups/latest.json';
const DEFAULT_ENDPOINT_URL = 'https://s3.us-east-005.backblazeb2.com';
const DEFAULT_REGION_NAME = 'us-east-005';
const DEFAULT_PROXY_BASE_URL_LOCAL = 'http://localhost:8787';

function isLocalHostName(hostname) {
	return (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '::1'
	);
}

function getRecommendedProxyBaseUrl() {
	if (typeof window === 'undefined') {
		return DEFAULT_PROXY_BASE_URL_LOCAL;
	}
	const host = String(window.location?.hostname || '').toLowerCase();
	// Local dev: keep explicit node proxy port.
	if (isLocalHostName(host)) {
		return DEFAULT_PROXY_BASE_URL_LOCAL;
	}
	// Server deploy: prefer same-origin reverse proxy to avoid user config.
	return '';
}

function normalizeProxyBaseUrl(raw) {
	const s = String(raw || '').trim();
	if (!s) {
		return getRecommendedProxyBaseUrl();
	}
	if (typeof window === 'undefined') {
		return s;
	}
	// If user opens app from non-local host, old localhost setting is invalid.
	const host = String(window.location?.hostname || '').toLowerCase();
	if (
		!isLocalHostName(host) &&
		/^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(s)
	) {
		return '';
	}
	return s;
}

/** Thrown when fetch to the local backup proxy fails (proxy not running, wrong URL, blocked). */
export const BACKUP_PROXY_UNREACHABLE = 'BACKUP_PROXY_UNREACHABLE';

function safeGetItem(key) {
	if (typeof window === 'undefined') return null;
	try {
		return window?.localStorage?.getItem(key) ?? null;
	} catch {
		return null;
	}
}

function safeSetItem(key, value) {
	if (typeof window === 'undefined') return;
	try {
		window?.localStorage?.setItem(key, value);
	} catch {
		// ignore
	}
}

function safeParseJson(raw) {
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function sanitizeStateForCloudBackup(stateObj) {
	if (!stateObj || typeof stateObj !== 'object') {
		return stateObj;
	}
	const filesAll = stateObj?.db?.files?.allFiles || {};
	const catalog = stateObj?.db?.catalog || {};
	return {
		backupKind: 'library-core-only',
		schemaVersion: 2,
		savedAt: new Date().toISOString(),
		db: {
			files: {
				allFiles: JSON.parse(JSON.stringify(filesAll)),
			},
			catalog: JSON.parse(
				JSON.stringify({
					genres: Array.isArray(catalog?.genres) ? catalog.genres : [],
					tags: Array.isArray(catalog?.tags) ? catalog.tags : [],
					authors: Array.isArray(catalog?.authors) ? catalog.authors : [],
					authorsFromCatalogOnly: !!catalog?.authorsFromCatalogOnly,
				})
			),
		},
	};
}

export function buildCloudBackupJsonTextFromState(stateObj) {
	const safeState = sanitizeStateForCloudBackup(stateObj);
	return JSON.stringify(safeState, null, 2);
}

export function getBackblazeConfig() {
	return {
		enabled: safeGetItem(LS_B2_ENABLED_KEY) === '1',
		accountId: safeGetItem(LS_B2_ACCOUNT_ID_KEY) ?? '',
		applicationKey: safeGetItem(LS_B2_APPLICATION_KEY_KEY) ?? '',
		bucketName: safeGetItem(LS_B2_BUCKET_NAME_KEY) ?? '',
		objectKey: safeGetItem(LS_B2_OBJECT_KEY_KEY) ?? DEFAULT_OBJECT_KEY,
		endpointUrl:
			safeGetItem(LS_B2_ENDPOINT_URL_KEY) ?? DEFAULT_ENDPOINT_URL,
		regionName: safeGetItem(LS_B2_REGION_NAME_KEY) ?? DEFAULT_REGION_NAME,
		proxyBaseUrl: normalizeProxyBaseUrl(
			safeGetItem(LS_B2_PROXY_BASE_URL_KEY)
		),
	};
}

export function setBackblazeConfig(next) {
	safeSetItem(LS_B2_ENABLED_KEY, next?.enabled ? '1' : '0');
	safeSetItem(LS_B2_ACCOUNT_ID_KEY, next?.accountId || '');
	safeSetItem(LS_B2_APPLICATION_KEY_KEY, next?.applicationKey || '');
	safeSetItem(LS_B2_BUCKET_NAME_KEY, next?.bucketName || '');
	safeSetItem(
		LS_B2_OBJECT_KEY_KEY,
		next?.objectKey || DEFAULT_OBJECT_KEY
	);
	safeSetItem(
		LS_B2_ENDPOINT_URL_KEY,
		next?.endpointUrl || DEFAULT_ENDPOINT_URL
	);
	safeSetItem(
		LS_B2_REGION_NAME_KEY,
		next?.regionName || DEFAULT_REGION_NAME
	);
	safeSetItem(
		LS_B2_PROXY_BASE_URL_KEY,
		normalizeProxyBaseUrl(next?.proxyBaseUrl)
	);
}

export function isBackblazeConfigComplete(cfg) {
	return (
		!!cfg?.accountId &&
		!!cfg?.applicationKey &&
		!!cfg?.bucketName &&
		!!cfg?.objectKey &&
		!!cfg?.endpointUrl &&
		!!cfg?.regionName
	);
}

function trimRightSlash(s) {
	return String(s || '').replace(/\/+$/, '');
}

function toProxyPayload(cfg) {
	return {
		accountId: cfg.accountId,
		applicationKey: cfg.applicationKey,
		bucketName: cfg.bucketName,
		objectKey: cfg.objectKey,
		endpointUrl: cfg.endpointUrl,
		regionName: cfg.regionName,
	};
}

async function postProxy(cfg, path, body = {}) {
	const base = trimRightSlash(normalizeProxyBaseUrl(cfg?.proxyBaseUrl));
	let res;
	try {
		res = await fetch(`${base}${path}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...toProxyPayload(cfg), ...body }),
		});
	} catch (e) {
		const err = new Error(BACKUP_PROXY_UNREACHABLE);
		err.code = BACKUP_PROXY_UNREACHABLE;
		err.cause = e;
		throw err;
	}
	let data = null;
	try {
		data = await res.json();
	} catch {
		// ignore
	}
	if (!res.ok || !data?.success) {
		throw new Error(data?.message || `Proxy request failed: ${res.status}`);
	}
	return data;
}

/**
 * Roughly classify backup proxy errors for clearer UI copy (test / backup / restore).
 * @param {unknown} err
 * @returns {'proxy' | 'incomplete' | 'credentials' | 'bucket' | 'unknown'}
 */
export function classifyBackupConnectionError(err) {
	if (err?.code === BACKUP_PROXY_UNREACHABLE) {
		return 'proxy';
	}
	const m = String(err?.message || err || '');
	if (/Missing required Backblaze config/i.test(m)) {
		return 'incomplete';
	}
	if (
		/InvalidAccessKeyId|does not exist in our records|InvalidSecretAccessKey|SignatureDoesNotMatch|invalid signature|AccessDenied|not authorized|could not be satisfied|Forbidden|Unauthorized|security token/i.test(
			m
		)
	) {
		return 'credentials';
	}
	if (/NoSuchBucket|The specified bucket|NotFound|No such bucket|status:\s*404/i.test(m)) {
		return 'bucket';
	}
	return 'unknown';
}

export async function testBackblazeConnection(cfg) {
	await postProxy(cfg, '/api/backup/test');
	return true;
}

export async function getBackblazeBackupVersionCount(cfg) {
	const data = await postProxy(cfg, '/api/backup/count');
	const count = Number(data?.count || 0);
	safeSetItem(LS_LAST_CLOUD_COUNT_KEY, String(count));
	return count;
}

export async function backupStateToBackblazeLatest(cfg, jsonText) {
	if (!jsonText) {
		throw new Error('NO_JSON_TEXT');
	}
	await postProxy(cfg, '/api/backup/upload', { jsonText });
	return true;
}

export async function downloadBackblazeLatestJson(cfg) {
	const data = await postProxy(cfg, '/api/backup/download');
	const jsonText = String(data?.jsonText || '');
	return safeParseJson(jsonText);
}

export function mergeBackupStateIntoLocalState(backupState) {
	if (!backupState?.db) {
		throw new Error('INVALID_BACKUP_STATE');
	}

	const curRaw = safeGetItem('state');
	const curState = safeParseJson(curRaw);
	if (!curState?.db) {
		throw new Error('NO_CURRENT_STATE');
	}

	const curDb = curState.db;
	const backupDb = backupState.db;

	// Merge catalog (genres/tags/authors by id).
	const mergeById = (a, b) => {
		const map = new Map();
		(a || []).forEach((x) => map.set(x.id, x));
		(b || []).forEach((x) => {
			if (!x?.id) return;
			// Prefer backup name if local missing.
			const existing = map.get(x.id);
			map.set(x.id, existing?.name ? existing : x);
		});
		return Array.from(map.values());
	};

	const nextCatalog = {
		...curDb.catalog,
		genres: mergeById(curDb.catalog?.genres, backupDb.catalog?.genres),
		tags: mergeById(curDb.catalog?.tags, backupDb.catalog?.tags),
		authors: mergeById(curDb.catalog?.authors, backupDb.catalog?.authors),
	};

	// Merge files with id conflict avoidance.
	const curFiles = curDb.files?.allFiles || {};
	const backupFiles = backupDb.files?.allFiles || {};

	const nextAllFiles = { ...curFiles };
	Object.keys(backupFiles).forEach((fid) => {
		const entry = backupFiles[fid];
		if (!entry) return;

		const exists = !!nextAllFiles[fid];
		if (!exists) {
			nextAllFiles[fid] = entry;
			return;
		}

		let newId = uuidv4();
		while (nextAllFiles[newId]) {
			newId = uuidv4();
		}

		nextAllFiles[newId] = { ...entry, id: newId };
	});

	const nextState = {
		...curState,
		db: {
			...curDb,
			catalog: nextCatalog,
			files: {
				...curDb.files,
				allFiles: nextAllFiles,
			},
		},
	};

	safeSetItem('state', JSON.stringify(nextState));
	return nextState;
}

export function replaceLibraryStateIntoLocalState(backupState) {
	if (!backupState?.db) {
		throw new Error('INVALID_BACKUP_STATE');
	}
	const curRaw = safeGetItem('state');
	const curState = safeParseJson(curRaw);
	if (!curState?.db) {
		throw new Error('NO_CURRENT_STATE');
	}
	const nextState = JSON.parse(JSON.stringify(curState));
	nextState.db = nextState.db || {};
	nextState.db.catalog = backupState.db.catalog || {
		genres: [],
		tags: [],
		authors: [],
		authorsFromCatalogOnly: false,
	};
	nextState.db.files = nextState.db.files || {};
	nextState.db.files.allFiles = backupState.db.files?.allFiles || {};
	safeSetItem('state', JSON.stringify(nextState));
	return nextState;
}

