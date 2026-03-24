import './BackupSettingsPanel.scss';

import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';

import Button from '../ui/_components/Button';
import Modal from '../ui/_components/Modal';
import Icon from '../ui/_components/Icon';

import { useI18n } from '../ui/i18n/I18nProvider';
import { backupNow } from './backupStorage';
import {
	getBackblazeBackupVersionCount,
	buildCloudBackupJsonTextFromState,
	getBackblazeConfig,
	isBackblazeConfigComplete,
	mergeBackupStateIntoLocalState,
	replaceLibraryStateIntoLocalState,
	backupStateToBackblazeLatest,
	downloadBackblazeLatestJson,
	sanitizeStateForCloudBackup,
	setBackblazeConfig,
	testBackblazeConnection,
	classifyBackupConnectionError,
} from './backblazeB2Backup';

const CLOUD_PROFILES_LS_KEY = 'chordStudio.backup.cloudProfiles.v1';

function makeProfileId() {
	if (typeof window !== 'undefined' && window?.crypto?.randomUUID) {
		return window.crypto.randomUUID();
	}
	return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeReadProfilesFromStorage() {
	try {
		const raw = window?.localStorage?.getItem(CLOUD_PROFILES_LS_KEY) || '';
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function safeWriteProfilesToStorage(profiles) {
	try {
		window?.localStorage?.setItem(
			CLOUD_PROFILES_LS_KEY,
			JSON.stringify(profiles || [])
		);
	} catch {
		// ignore
	}
}

function RestoreChoiceModal(props) {
	const { close, restoreTitle, restoreLead, onAppend, onOverwrite } = props;
	const { t } = useI18n();

	return (
		<Modal closeModal={close}>
			<section className={'mod-ModalConfirmContainer mod-ModalSettingsWide'}>
				<header className="aiSettingsModal-header">
					<h2 className="mod-ModalSettingsTitle aiSettingsModal-title">
						{restoreTitle}
					</h2>
				</header>

				<p className="aiSettingsModal-lead">
					{restoreLead} {t('请选择：')}
				</p>

				<div className="mod-ModalConfirmButtons aiSettingsModal-actions">
					<Button
						type="secondary"
						buttonName="restoreAppend"
						onClick={onAppend}
					>
						{t('追加到当前曲库')}
					</Button>
					<Button
						type="primary"
						buttonName="restoreOverwrite"
						onClick={onOverwrite}
					>
						{t('覆盖当前曲库')}
					</Button>
				</div>
			</section>
		</Modal>
	);
}

function BackupSettingsPanel() {
	const { t } = useI18n();
	const [profiles, setProfiles] = useState(() => {
		const fromLs = safeReadProfilesFromStorage();
		if (fromLs.length > 0) return fromLs;
		return [
			{
				id: makeProfileId(),
				name: 'Backblaze B2',
				cfg: getBackblazeConfig(),
			},
		];
	});
	const [selectedProfileId, setSelectedProfileId] = useState(
		() => profiles[0]?.id
	);
	const selectedProfile =
		profiles.find((x) => x.id === selectedProfileId) || profiles[0];
	const cfg = selectedProfile?.cfg || getBackblazeConfig();
	const canUse = useMemo(() => isBackblazeConfigComplete(cfg), [cfg]);

	const [isWorking, setIsWorking] = useState(false);
	const [errorText, setErrorText] = useState('');
	const [statusText, setStatusText] = useState('');

	const [cloudVersionCount, setCloudVersionCount] = useState(null);
	const [restoreChoiceOpen, setRestoreChoiceOpen] = useState(false);
	const [pendingRestoreState, setPendingRestoreState] = useState(null);
	const [pendingRestoreSource, setPendingRestoreSource] = useState('cloud');

	const localJsonInputId = 'backupSettings-localJsonInput';
	const localZipInputId = 'backupSettings-localZipInput';

	function persistProfiles(nextProfiles, nextSelectedId) {
		setProfiles(nextProfiles);
		safeWriteProfilesToStorage(nextProfiles);
		const targetId = nextSelectedId || nextProfiles[0]?.id || null;
		setSelectedProfileId(targetId);
		const active = nextProfiles.find((x) => x.id === targetId);
		if (active?.cfg) {
			setBackblazeConfig(active.cfg);
		}
	}

	function createNewProfile() {
		const next = {
			id: makeProfileId(),
			name: `${t('云服务器')} ${profiles.length + 1}`,
			cfg: getBackblazeConfig(),
		};
		persistProfiles([...profiles, next], next.id);
		setStatusText(t('已新增云服务器配置。'));
		setErrorText('');
	}

	function removeCurrentProfile() {
		if (profiles.length <= 1) {
			setErrorText(t('至少保留一个云服务器配置。'));
			return;
		}
		const nextProfiles = profiles.filter((x) => x.id !== selectedProfileId);
		persistProfiles(nextProfiles, nextProfiles[0]?.id);
		setStatusText(t('已删除当前云服务器配置。'));
		setErrorText('');
	}

	function renameCurrentProfile(name) {
		const nextProfiles = profiles.map((x) =>
			x.id === selectedProfileId ? { ...x, name } : x
		);
		persistProfiles(nextProfiles, selectedProfileId);
	}

	function setField(key, value) {
		const nextProfiles = profiles.map((x) =>
			x.id === selectedProfileId ? { ...x, cfg: { ...cfg, [key]: value } } : x
		);
		persistProfiles(nextProfiles, selectedProfileId);
		setErrorText('');
		setStatusText('');
	}

	function LabelWithHelp({ label, help }) {
		const helpTrim = String(help || '').trim();
		const labelTrim = String(label || '').trim();
		const redundant =
			helpTrim &&
			(labelTrim === helpTrim ||
				helpTrim.replace(/。$/, '') === labelTrim.replace(/。$/, ''));
		if (!helpTrim || redundant) {
			return <span className="backupSettingsLabelPlain">{label}</span>;
		}
		return (
			<span className="backupSettingsLabelWithHelp">
				{label}
				<span className="backupSettingsHelpWrap">
					<button
						type="button"
						className="backupSettingsHelpBtn"
						aria-label={label + t('说明')}
						title={help}
					>
						?
					</button>
					<span className="backupSettingsHelpBubble">{help}</span>
				</span>
			</span>
		);
	}

	function describeClassifiedBackupError(err, t, contextKey) {
		const cat = classifyBackupConnectionError(err);
		const raw = String(err?.message || err || '');
		const ctx = t(contextKey);
		if (cat === 'proxy') {
			return t(
				'{{ctx}}无法连接到本地 Node 备份代理。请另开终端在项目根目录运行「yarn workspace backup-proxy dev」，并核对设置中的「Node 代理地址」与端口（默认 http://localhost:8787）。',
				{ ctx }
			);
		}
		if (cat === 'incomplete') {
			return t(
				'{{ctx}}配置不完整：请填写账号 ID、应用密钥、Bucket、备份对象键、S3 Endpoint、Region 与 Node 代理地址。',
				{ ctx }
			);
		}
		if (cat === 'credentials') {
			return t(
				'{{ctx}}鉴权失败：账号 ID 或应用密钥可能错误，或当前密钥无权访问该 Bucket。请在 Backblaze 控制台核对密钥与权限。',
				{ ctx }
			);
		}
		if (cat === 'bucket') {
			return t(
				'{{ctx}}Bucket 或端点不匹配：请核对 Bucket 名称、S3 Endpoint URL 与 Region 是否与控制台一致。',
				{ ctx }
			);
		}
		return ctx + raw;
	}

	function renderApiTemplateHelp(kind) {
		if (kind === 'post') {
			return `POST ${String(cfg.proxyBaseUrl || '').replace(/\/$/, '')}/api/backup/upload
Content-Type: application/json

{
  "accountId": "${cfg.accountId || '<accountId>'}",
  "applicationKey": "<applicationKey>",
  "bucketName": "${cfg.bucketName || '<bucketName>'}",
  "endpointUrl": "${cfg.endpointUrl || 'https://s3.us-east-005.backblazeb2.com'}",
  "regionName": "${cfg.regionName || 'us-east-005'}",
  "objectKey": "${cfg.objectKey || 'chord-chart-studio/backups/latest.json'}",
  "jsonText": "{...应用状态JSON...}"
}`;
		}
		return `POST ${String(cfg.proxyBaseUrl || '').replace(/\/$/, '')}/api/backup/download
Content-Type: application/json

{
  "accountId": "${cfg.accountId || '<accountId>'}",
  "applicationKey": "<applicationKey>",
  "bucketName": "${cfg.bucketName || '<bucketName>'}",
  "endpointUrl": "${cfg.endpointUrl || 'https://s3.us-east-005.backblazeb2.com'}",
  "regionName": "${cfg.regionName || 'us-east-005'}",
  "objectKey": "${cfg.objectKey || 'chord-chart-studio/backups/latest.json'}"
}`;
	}

	async function handleTestConnection() {
		if (!canUse) {
			setErrorText(t('请先填写完整的 Backblaze 配置。'));
			return;
		}
		setIsWorking(true);
		setErrorText('');
		setStatusText(t('测试连接中…'));
		try {
			await testBackblazeConnection(cfg);
			setStatusText(t('测试连接成功。'));
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			setErrorText(
				describeClassifiedBackupError(e, t, '测试连接：')
			);
			setStatusText('');
		} finally {
			setIsWorking(false);
		}
	}

	async function handleBackupNowCloud() {
		if (!canUse) {
			setErrorText(t('请先填写完整的 Backblaze 配置。'));
			return;
		}
		setIsWorking(true);
		setErrorText('');
		setStatusText(t('正在上传备份到云端…'));
		try {
			const snapshot = backupNow();
			const jsonText = buildCloudBackupJsonTextFromState(snapshot?.state);
			await backupStateToBackblazeLatest(cfg, jsonText);
			setStatusText(t('云端备份完成（已覆盖旧备份文件）。'));
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			setErrorText(
				describeClassifiedBackupError(e, t, '云端备份：')
			);
			setStatusText('');
		} finally {
			setIsWorking(false);
		}
	}

	function downloadTextFile(fileName, content) {
		const blob = new Blob([String(content || '')], {
			type: 'application/json;charset=utf-8',
		});
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.URL.revokeObjectURL(url);
	}

	function slugifyFileName(input) {
		const raw = String(input || '').trim();
		const safe = raw
			.replace(/[\\/:*?"<>|]/g, '-')
			.replace(/\s+/g, ' ')
			.trim();
		return safe || 'untitled';
	}

	function getAllSongsFromBackupState(backupState) {
		const files = backupState?.db?.files?.allFiles || {};
		return Object.values(files).filter(Boolean);
	}

	function buildLocalRestoreStateFromFilesAndCatalog(allFiles, catalog) {
		return {
			db: {
				files: { allFiles },
				catalog: {
					genres: Array.isArray(catalog?.genres) ? catalog.genres : [],
					tags: Array.isArray(catalog?.tags) ? catalog.tags : [],
					authors: Array.isArray(catalog?.authors) ? catalog.authors : [],
					authorsFromCatalogOnly: !!catalog?.authorsFromCatalogOnly,
				},
			},
		};
	}

	function normalizeImportedBackupState(parsed) {
		if (parsed?.db?.files?.allFiles) {
			return sanitizeStateForCloudBackup(parsed);
		}
		if (parsed?.state?.db?.files?.allFiles) {
			return sanitizeStateForCloudBackup(parsed.state);
		}
		throw new Error('INVALID_BACKUP_JSON_FORMAT');
	}

	function formatErrorMessage(error) {
		const raw = String(error?.message || error || '');
		if (raw.includes('INVALID_BACKUP_JSON_FORMAT')) {
			return t('备份 JSON 格式无效。');
		}
		return raw;
	}

	function openRestoreChoice(backupState, source) {
		setPendingRestoreState(backupState);
		setPendingRestoreSource(source || 'cloud');
		setRestoreChoiceOpen(true);
	}

	function getCurrentLocalState() {
		try {
			const raw = window?.localStorage?.getItem('state') || '';
			return JSON.parse(raw);
		} catch {
			return null;
		}
	}

	async function handleClearAllSongsForRestoreTest() {
		const ok = window.confirm(t('确定要删除全部曲谱吗？此操作不可撤销。'));
		if (!ok) return;
		setIsWorking(true);
		setErrorText('');
		setStatusText('');
		try {
			const curState = getCurrentLocalState();
			if (!curState?.db) {
				throw new Error('NO_CURRENT_STATE');
			}
			const nextState = JSON.parse(JSON.stringify(curState));
			nextState.db = nextState.db || {};
			nextState.db.files = nextState.db.files || {};
			nextState.db.files.allFiles = {};
			window.localStorage.setItem('state', JSON.stringify(nextState));
			setStatusText(t('已清空全部曲谱，可立即测试恢复。'));
			window.location.reload();
		} catch (e) {
			setErrorText(t('清空曲谱失败：') + String(e?.message || e));
		} finally {
			setIsWorking(false);
		}
	}

	async function handleExportCloudEquivalentJson() {
		setErrorText('');
		setStatusText('');
		try {
			const snapshot = backupNow();
			const jsonText = buildCloudBackupJsonTextFromState(snapshot?.state);
			const stamp = new Date()
				.toISOString()
				.replace(/[:.]/g, '-')
				.replace('T', '_')
				.slice(0, 19);
			downloadTextFile(`cloud-backup-equivalent_${stamp}.json`, jsonText);
			setStatusText(t('已导出与云端一致的备份 JSON。'));
		} catch (e) {
			setErrorText(t('导出失败：') + String(e?.message || e));
		}
	}

	async function handleExportAllSongsAsZip() {
		setErrorText('');
		setStatusText(t('正在打包全部歌曲…'));
		try {
			const snapshot = backupNow();
			const backupState = sanitizeStateForCloudBackup(snapshot?.state);
			const songs = getAllSongsFromBackupState(backupState);
			const zip = new JSZip();
			const folder = zip.folder('songs');
			const usedNames = new Map();
			songs.forEach((song) => {
				const rawBase = slugifyFileName(song?.title || 'untitled');
				const count = (usedNames.get(rawBase) || 0) + 1;
				usedNames.set(rawBase, count);
				const base =
					count === 1 ? rawBase : `${rawBase} (${String(count)})`;
				const fileName = `${base}.txt`;
				const text = String(
					song?.content ?? song?.chordMark ?? song?.text ?? ''
				);
				folder.file(fileName, text);
			});
			const blob = await zip.generateAsync({ type: 'blob' });
			const stamp = new Date()
				.toISOString()
				.replace(/[:.]/g, '-')
				.replace('T', '_')
				.slice(0, 19);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `all-songs_${stamp}.zip`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
			setStatusText(t('已导出全部歌曲 ZIP（TXT）。'));
		} catch (e) {
			setErrorText(t('导出失败：') + String(e?.message || e));
			setStatusText('');
		}
	}

	async function handleRestoreFromCloud() {
		if (!canUse) {
			setErrorText(t('请先填写完整的 Backblaze 配置。'));
			return;
		}
		setIsWorking(true);
		setErrorText('');
		setStatusText(t('正在检查云端备份数量…'));
		try {
			const count = await getBackblazeBackupVersionCount(cfg);
			setCloudVersionCount(count);
			if (!count) {
				setErrorText(t('云端没有可用备份。'));
				setStatusText('');
				return;
			}
			const cloudState = await downloadBackblazeLatestJson(cfg);
			const normalized = normalizeImportedBackupState(cloudState);
			setStatusText('');
			openRestoreChoice(normalized, 'cloud');
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			setErrorText(
				describeClassifiedBackupError(e, t, '读取云端备份：')
			);
			setStatusText('');
		} finally {
			setIsWorking(false);
		}
	}

	async function handleLocalJsonFileSelected(event) {
		const file = event?.target?.files?.[0];
		event.target.value = '';
		if (!file) return;
		setIsWorking(true);
		setErrorText('');
		setStatusText(t('正在读取本地 JSON…'));
		try {
			const text = await file.text();
			const parsed = JSON.parse(String(text || '{}'));
			const normalized = normalizeImportedBackupState(parsed);
			setStatusText('');
			openRestoreChoice(normalized, 'local-json');
		} catch (e) {
			setErrorText(t('本地 JSON 恢复失败：') + formatErrorMessage(e));
			setStatusText('');
		} finally {
			setIsWorking(false);
		}
	}

	function makeSongId() {
		if (typeof window !== 'undefined' && window?.crypto?.randomUUID) {
			return window.crypto.randomUUID();
		}
		return `song_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
	}

	function titleFromTxtPath(pathName) {
		const normalized = String(pathName || '').replace(/\\/g, '/');
		const base = normalized.split('/').pop() || 'untitled.txt';
		return base.replace(/\.txt$/i, '') || 'untitled';
	}

	async function handleLocalZipFileSelected(event) {
		const file = event?.target?.files?.[0];
		event.target.value = '';
		if (!file) return;
		setIsWorking(true);
		setErrorText('');
		setStatusText(t('正在解析 ZIP…'));
		try {
			const zip = await JSZip.loadAsync(file);
			const allFiles = {};
			let catalog = {
				genres: [],
				tags: [],
				authors: [],
				authorsFromCatalogOnly: false,
			};
			const tasks = [];
			zip.forEach((relativePath, entry) => {
				if (entry?.dir) return;
				if (/catalog\.json$/i.test(relativePath)) {
					tasks.push(
						entry.async('string').then((txt) => {
							try {
								catalog = {
									...catalog,
									...(JSON.parse(txt) || {}),
								};
							} catch {
								// ignore malformed catalog.json, keep defaults
							}
						})
					);
					return;
				}
				if (/\.txt$/i.test(relativePath)) {
					tasks.push(
						entry.async('string').then((txt) => {
							const id = makeSongId();
							allFiles[id] = {
								id,
								title: titleFromTxtPath(relativePath),
								content: String(txt || ''),
								author: '',
								genreId: '',
								tagIds: [],
							};
						})
					);
				}
			});
			await Promise.all(tasks);
			const zipState = buildLocalRestoreStateFromFilesAndCatalog(
				allFiles,
				catalog
			);
			const normalized = normalizeImportedBackupState(zipState);
			setStatusText('');
			openRestoreChoice(normalized, 'local-zip');
		} catch (e) {
			setErrorText(t('本地 ZIP 恢复失败：') + formatErrorMessage(e));
			setStatusText('');
		} finally {
			setIsWorking(false);
		}
	}

	async function doRestoreAppend() {
		setIsWorking(true);
		setRestoreChoiceOpen(false);
		setErrorText('');
		try {
			const backupState =
				pendingRestoreState ||
				normalizeImportedBackupState(
					await downloadBackblazeLatestJson(cfg)
				);
			mergeBackupStateIntoLocalState(backupState);
			window.location.reload();
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			setErrorText(
				describeClassifiedBackupError(e, t, '追加恢复：')
			);
		} finally {
			setPendingRestoreState(null);
			setIsWorking(false);
		}
	}

	async function doRestoreOverwrite() {
		setIsWorking(true);
		setRestoreChoiceOpen(false);
		setErrorText('');
		try {
			const backupState =
				pendingRestoreState ||
				normalizeImportedBackupState(
					await downloadBackblazeLatestJson(cfg)
				);
			replaceLibraryStateIntoLocalState(backupState);
			window.location.reload();
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			setErrorText(
				describeClassifiedBackupError(e, t, '覆盖恢复：')
			);
		} finally {
			setPendingRestoreState(null);
			setIsWorking(false);
		}
	}

	return (
		<section className={'backupSettingsPanel'}>
			<div className={'backupSettingsSection'}>
				<div className={'backupSettingsRow'}>
					<div className={'backupSettingsToggle'}>
						<span>
							{t('备份平台')}: Backblaze B2
						</span>
					</div>
				</div>
				<div className={'backupSettingsServerRow'}>
					<label className={'backupSettingsServerSelectLabel'}>
						{t('云服务器')}
						<select
							value={selectedProfileId}
							onChange={(e) =>
								persistProfiles(profiles, e.target.value)
							}
							disabled={isWorking}
						>
							{profiles.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name || t('未命名服务器')}
								</option>
							))}
						</select>
					</label>
					<Button
						type={'secondary'}
						buttonName={'addCloudServer'}
						onClick={createNewProfile}
						isDisabled={isWorking}
					>
						<Icon iconName={'add'} />
					</Button>
					<Button
						type={'secondary'}
						buttonName={'removeCloudServer'}
						onClick={removeCurrentProfile}
						isDisabled={isWorking || profiles.length <= 1}
					>
						<Icon iconName={'delete_outline'} />
					</Button>
				</div>
				<details className="backupSettingsAdvancedFold">
					<summary>{t('高级配置（默认收起）')}</summary>
					<label className={'backupSettingsServerName'}>
						{t('服务器名称')}
						<input
							type={'text'}
							value={selectedProfile?.name || ''}
							onChange={(e) => renameCurrentProfile(e.target.value)}
							disabled={isWorking}
						/>
					</label>
					<div className={'backupSettingsForm'}>
						<label>
							<LabelWithHelp
								label={t('账号 ID')}
								help={t('Backblaze Account ID，用于代理服务鉴权。')}
							/>
							<input
								type={'text'}
								value={cfg.accountId}
								onChange={(e) => setField('accountId', e.target.value)}
								disabled={isWorking}
							/>
						</label>
						<label>
							<LabelWithHelp
								label={t('应用密钥')}
								help={t('Backblaze Application Key，仅本地保存。')}
							/>
							<input
								type={'password'}
								value={cfg.applicationKey}
								onChange={(e) =>
									setField('applicationKey', e.target.value)
								}
								disabled={isWorking}
							/>
						</label>
						<label>
							<LabelWithHelp
								label={t('Bucket 名称')}
								help={t('你在 Backblaze B2 中创建的桶名。')}
							/>
							<input
								type={'text'}
								value={cfg.bucketName}
								onChange={(e) => setField('bucketName', e.target.value)}
								disabled={isWorking}
							/>
						</label>
						<label>
							<span className="backupSettingsLabelPlain">
								{t('S3 Endpoint URL')}
							</span>
							<input
								type={'text'}
								value={cfg.endpointUrl}
								onChange={(e) => setField('endpointUrl', e.target.value)}
								disabled={isWorking}
								placeholder={t(
									'例如 https://s3.us-east-005.backblazeb2.com'
								)}
							/>
						</label>
						<label>
							<span className="backupSettingsLabelPlain">
								{t('区域（Region）')}
							</span>
							<input
								type={'text'}
								value={cfg.regionName}
								onChange={(e) => setField('regionName', e.target.value)}
								disabled={isWorking}
								placeholder={t('例如 us-east-005')}
							/>
						</label>
						<label>
							<span className="backupSettingsLabelPlain">
								{t('Node 代理地址')}
							</span>
							<input
								type={'text'}
								value={cfg.proxyBaseUrl}
								onChange={(e) => setField('proxyBaseUrl', e.target.value)}
								disabled={isWorking}
								placeholder={t('例如 http://localhost:8787')}
							/>
						</label>
						<label>
							<span className="backupSettingsLabelPlain">
								{t('备份对象键（Object Key）')}
							</span>
							<input
								type={'text'}
								value={cfg.objectKey}
								onChange={(e) => setField('objectKey', e.target.value)}
								disabled={isWorking}
								placeholder={t(
									'例如 chord-chart-studio/backups/latest.json'
								)}
							/>
						</label>
					</div>
					<details className="backupSettingsApiHelp">
						<summary>{t('调用模板说明（?）')}</summary>
						<div className="backupSettingsApiHelpBlock">
							<div className="backupSettingsApiHelpTitle">
								{t('POST 上传模板')}
							</div>
							<pre>{renderApiTemplateHelp('post')}</pre>
						</div>
						<div className="backupSettingsApiHelpBlock">
							<div className="backupSettingsApiHelpTitle">
								{t('GET/下载（当前实现为 POST 请求）模板')}
							</div>
							<pre>{renderApiTemplateHelp('get')}</pre>
						</div>
					</details>
				</details>
			</div>

			<div className={'backupSettingsActions'}>
				<div className={'backupSettingsActionGroup'}>
					<div className={'backupSettingsActionGroupTitle'}>
						{t('云端操作')}
					</div>
					<Button
						type={'secondary'}
						buttonName={'testB2'}
						onClick={handleTestConnection}
						isDisabled={!canUse || isWorking}
					>
						<Icon iconName={'wifi_tethering'} />
						{t('测试连接')}
					</Button>
					<Button
						type={'primary'}
						buttonName={'backupCloud'}
						onClick={handleBackupNowCloud}
						isDisabled={!canUse || isWorking}
					>
						<Icon iconName={'cloud_upload'} />
						{t('备份')}
					</Button>
					<Button
						type={'secondary'}
						buttonName={'restoreCloud'}
						onClick={handleRestoreFromCloud}
						isDisabled={!canUse || isWorking}
					>
						<Icon iconName={'cloud_download'} />
						{t('云端恢复（JSON）')}
					</Button>
				</div>
				<div className={'backupSettingsActionGroup'}>
					<div className={'backupSettingsActionGroupTitle'}>
						{t('本地恢复')}
					</div>
					<Button
						type={'secondary'}
						buttonName={'restoreLocalJson'}
						onClick={() => {
							const input = document.getElementById(localJsonInputId);
							if (input) input.click();
						}}
						isDisabled={isWorking}
					>
						<Icon iconName={'description'} />
						{t('本地恢复（JSON）')}
					</Button>
					<Button
						type={'secondary'}
						buttonName={'restoreLocalZip'}
						onClick={() => {
							const input = document.getElementById(localZipInputId);
							if (input) input.click();
						}}
						isDisabled={isWorking}
					>
						<Icon iconName={'folder_zip'} />
						{t('本地恢复（ZIP）')}
					</Button>
				</div>
				<div className={'backupSettingsActionGroup'}>
					<div className={'backupSettingsActionGroupTitle'}>
						{t('导出工具')}
					</div>
					<Button
						type={'secondary'}
						buttonName={'exportCloudEquivalent'}
						onClick={handleExportCloudEquivalentJson}
						isDisabled={isWorking}
					>
						<Icon iconName={'download'} />
						{t('导出（与云端一致）')}
					</Button>
					<Button
						type={'secondary'}
						buttonName={'exportAllSongsZip'}
						onClick={handleExportAllSongsAsZip}
						isDisabled={isWorking}
					>
						<Icon iconName={'archive'} />
						{t('一键导出全部（ZIP）')}
					</Button>
				</div>
				<div
					className={
						'backupSettingsActionGroup backupSettingsActionGroup--danger'
					}
				>
					<div className={'backupSettingsActionGroupTitle'}>
						{t('测试辅助')}
					</div>
					<div className={'backupSettingsDangerAction'}>
						<Button
							type={'secondary'}
							buttonName={'clearAllSongsForRestoreTest'}
							onClick={handleClearAllSongsForRestoreTest}
							isDisabled={isWorking}
						>
							<Icon iconName={'warning'} />
							{t('一键删除所有曲谱（测试恢复）')}
						</Button>
					</div>
				</div>
			</div>

			{statusText ? (
				<p className={'backupSettingsMeta'}>{statusText}</p>
			) : null}
			{errorText ? <p className={'backupSettingsError'}>{errorText}</p> : null}

			<input
				id={localJsonInputId}
				type="file"
				accept=".json,application/json"
				onChange={handleLocalJsonFileSelected}
				style={{ display: 'none' }}
			/>
			<input
				id={localZipInputId}
				type="file"
				accept=".zip,application/zip"
				onChange={handleLocalZipFileSelected}
				style={{ display: 'none' }}
			/>

			{restoreChoiceOpen && pendingRestoreState ? (
				<RestoreChoiceModal
					close={() => {
						setRestoreChoiceOpen(false);
						setPendingRestoreState(null);
					}}
					restoreTitle={
						pendingRestoreSource === 'cloud'
							? t('从云端恢复')
							: pendingRestoreSource === 'local-zip'
								? t('从本地 ZIP 恢复')
								: t('从本地 JSON 恢复')
					}
					restoreLead={
						pendingRestoreSource === 'cloud'
							? `${t('云端共发现')} ${String(cloudVersionCount || 1)} ${t('个备份版本。')}`
							: `${t('检测到')} ${String(
									getAllSongsFromBackupState(pendingRestoreState).length
								)} ${t('首歌曲。')}`
					}
					onAppend={doRestoreAppend}
					onOverwrite={doRestoreOverwrite}
				/>
			) : null}
		</section>
	);
}

export default React.memo(BackupSettingsPanel);

