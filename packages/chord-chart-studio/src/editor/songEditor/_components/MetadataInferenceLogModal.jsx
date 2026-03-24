import './MetadataInferenceLogModal.scss';

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

import { useEffectiveUiTheme } from '../../../ui/theme/useEffectiveUiTheme';
import Icon from '../../../ui/_components/Icon';
import { useI18n } from '../../../ui/i18n/I18nProvider';

const MAX_LOG_RAW_CHARS = 40000;

function shortFileIdForLog(id) {
	const s = String(id || '').trim();
	if (!s) {
		return '';
	}
	return s.length > 12 ? `${s.slice(0, 10)}…` : s;
}

function formatMetadataInferenceLogEntries(entries) {
	return entries
		.map((entry) => {
			const t = entry.at
				? new Date(entry.at).toLocaleTimeString(undefined, {
						hour12: false,
					})
				: '';
			const fid = shortFileIdForLog(entry.targetFileId);
			const head = `[${t}]${fid ? ` [曲目 ${fid}]` : ''} `;
			switch (entry.type) {
				case 'phase':
					return `${head}${entry.message}`;
				case 'request':
					return `${head}REQUEST\n${JSON.stringify(
						{
							url: entry.url,
							headers: entry.headers,
							requestBody: entry.requestBody,
						},
						null,
						2
					)}`;
				case 'response': {
					const raw = entry.responseRaw || '';
					const truncated =
						raw.length > MAX_LOG_RAW_CHARS
							? `${raw.slice(0, MAX_LOG_RAW_CHARS)}\n\n…(已截断，原长度 ${raw.length})`
							: raw;
					const parsedStr =
						entry.responseParsed !== undefined
							? JSON.stringify(entry.responseParsed, null, 2)
							: 'null';
					return `${head}RESPONSE ${entry.status} ${entry.statusText} ok=${entry.ok}\nparsed:\n${parsedStr}\n\nraw:\n${truncated}`;
				}
				case 'assistant':
					return `${head}${entry.message}\n${entry.preview || ''}`;
				case 'json':
					return `${head}${entry.message}\n${JSON.stringify(
						entry.parsedJson,
						null,
						2
					)}`;
				case 'patch':
					return `${head}${entry.message}\n${JSON.stringify(
						entry.patch,
						null,
						2
					)}`;
				case 'error':
					return `${head}ERROR\n${entry.message}`;
				case 'parse':
					return `${head}PARSE\n${entry.message}\nassistantPreview:\n${entry.assistantPreview}`;
				case 'validate':
					return `${head}VALIDATE\n${entry.message}\n${JSON.stringify(
						entry.parsedJson,
						null,
						2
					)}`;
				case 'success':
					return `${head}SUCCESS\n${entry.message}`;
				default:
					return `${head}${JSON.stringify(entry, null, 2)}`;
			}
		})
		.join('\n\n────────────────\n\n');
}

function MetadataInferenceLogModal(props) {
	const { entries, debugLogEnabled, onDebugLogChange, onClearLogs } = props;
	const bottomRef = useRef(null);
	const uiTheme = useEffectiveUiTheme();
	const { t } = useI18n();
	const themeClass = uiTheme === 'dark' ? 'theme-dark' : 'theme-light';

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: 'end' });
	}, [entries]);

	const text = entries.length
		? formatMetadataInferenceLogEntries(entries)
		: t('暂无日志');

	const node = (
		<section className={`mod-MetadataInferenceLogModal ${themeClass}`}>
			<div
				className={'mod-MetadataInferenceLogModal-overlay'}
				role={'presentation'}
				aria-hidden={'true'}
			/>
			<div className={'mod-MetadataInferenceLogModal-panel'}>
				<div className={'mod-MetadataInferenceLogModal-head'}>
					<span className={'mod-MetadataInferenceLogModal-title'}>
						{t('曲库元数据 · 调试日志')}
					</span>
					<div className={'mod-MetadataInferenceLogModal-actions'}>
						<button
							type={'button'}
							className={'mod-MetadataInferenceLogModal-clearBtn'}
							onClick={onClearLogs}
							disabled={!entries.length}
							title={t('清空当前日志条目')}
						>
							{t('清空')}
						</button>
						<button
							type={'button'}
							className={'mod-MetadataInferenceLogModal-closeBtn'}
							onClick={() => onDebugLogChange(false)}
							title={t('关闭调试弹窗（日志保留）')}
						>
							<Icon iconName={'close'} />
							<span>{t('关闭')}</span>
						</button>
					</div>
				</div>
				<p className={'mod-MetadataInferenceLogModal-hint'}>
					{t(
						'日志会保留以便后续分析。你可以点击「清空」或「关闭」；若还需要继续 AI 识别，可直接在背景操作。'
					)}
				</p>
				<pre className={'mod-MetadataInferenceLogModal-pre'}>
					{text}
				</pre>
				<div ref={bottomRef} />
			</div>
		</section>
	);

	return createPortal(node, document.body);
}

MetadataInferenceLogModal.propTypes = {
	entries: PropTypes.arrayOf(PropTypes.object).isRequired,
	debugLogEnabled: PropTypes.bool.isRequired,
	onDebugLogChange: PropTypes.func.isRequired,
	onClearLogs: PropTypes.func.isRequired,
};

export default MetadataInferenceLogModal;
