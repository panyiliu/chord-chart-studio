import { buildCloudBackupJsonTextFromState } from './backblazeB2Backup';

const LS_LATEST_BACKUP_KEY = 'chordStudio.backup.latest';

// Auto-backup settings (stored separately so scheduler can read them quickly).
const LS_AUTO_ENABLED_KEY = 'chordStudio.backup.autoEnabled';
const LS_AUTO_INTERVAL_MINUTES_KEY = 'chordStudio.backup.intervalMinutes';

const BACKUP_SCHEMA_VERSION = 1;

function safeGetItem(key) {
	try {
		return window?.localStorage?.getItem(key) ?? null;
	} catch {
		return null;
	}
}

function safeSetItem(key, value) {
	try {
		window?.localStorage?.setItem(key, value);
	} catch {
		// ignore write errors
	}
}

function safeRemoveItem(key) {
	try {
		window?.localStorage?.removeItem(key);
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

export function getLatestBackupSnapshot() {
	if (typeof window === 'undefined') return null;
	const raw = safeGetItem(LS_LATEST_BACKUP_KEY);
	return safeParseJson(raw);
}

export function getBackupAutoEnabled() {
	const raw = safeGetItem(LS_AUTO_ENABLED_KEY);
	return raw === '1' || raw === 'true' || raw === 'yes';
}

export function setBackupAutoEnabled(enabled) {
	safeSetItem(LS_AUTO_ENABLED_KEY, enabled ? '1' : '0');
}

export function getBackupAutoIntervalMinutes() {
	const raw = safeGetItem(LS_AUTO_INTERVAL_MINUTES_KEY);
	const n = raw == null ? NaN : Number(raw);
	if (!Number.isFinite(n)) return 30;
	return Math.max(1, Math.min(1440, Math.floor(n)));
}

export function setBackupAutoIntervalMinutes(minutes) {
	const n = Number(minutes);
	const next = Number.isFinite(n) ? n : 30;
	safeSetItem(
		LS_AUTO_INTERVAL_MINUTES_KEY,
		String(Math.max(1, Math.min(1440, Math.floor(next))))
	);
}

export function backupNow() {
	if (typeof window === 'undefined') {
		throw new Error('Window is undefined.');
	}

	const rawState = safeGetItem('state');
	if (!rawState) {
		throw new Error('NO_STATE');
	}
	const parsedState = safeParseJson(rawState);
	if (!parsedState) {
		throw new Error('INVALID_STATE');
	}

	// Single-file strategy (keep only one version):
	// always overwrite the same key with the latest snapshot.
	const snapshot = {
		schemaVersion: BACKUP_SCHEMA_VERSION,
		savedAt: new Date().toISOString(),
		state: parsedState,
	};

	safeSetItem(LS_LATEST_BACKUP_KEY, JSON.stringify(snapshot));
	return snapshot;
}

export function restoreLatestBackup() {
	if (typeof window === 'undefined') {
		throw new Error('Window is undefined.');
	}
	const snapshot = getLatestBackupSnapshot();
	if (!snapshot?.state) {
		throw new Error('NO_BACKUP');
	}
	safeSetItem('state', JSON.stringify(snapshot.state));
}

export function hasPersistedState() {
	return safeGetItem('state') != null;
}

export function downloadBackupSnapshot(snapshot) {
	if (typeof window === 'undefined') return;
	if (!snapshot) return;

	const savedAt = snapshot?.savedAt ? String(snapshot.savedAt) : '';
	const fileTime = savedAt
		? savedAt.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
		: 'unknown';
	const fileName = `chord-chart-studio-backup_${fileTime}.json`;

	const json = buildCloudBackupJsonTextFromState(snapshot?.state || {});
	const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
	const url = window.URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	a.remove();

	window.URL.revokeObjectURL(url);
}

export function clearLatestBackup() {
	safeRemoveItem(LS_LATEST_BACKUP_KEY);
}

export function getLatestBackupSavedAt() {
	return getLatestBackupSnapshot()?.savedAt ?? null;
}

