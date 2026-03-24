import './EditorLayout.scss';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { ScrollSync, ScrollSyncNode } from 'scroll-sync-react';

import EditorPreview from '../../../songRenderers/editorPreview/_components/EditorPreview';
import ProseMirrorEditorView from '../prosemirror/ProsemirrorEditorView';
import Icon from '../../../ui/_components/Icon';
import { useI18n } from '../../../ui/i18n/I18nProvider';
import { convertRawChordSheet } from '../rawChordToChordMark/convertRawChordSheet';
import MetadataInferenceLogModal from './MetadataInferenceLogModal';
import RawChordConvertHelpModal from './RawChordConvertHelpModal';

const METADATA_LOG_LS_KEY = 'chordStudio.metadataInferenceLogEnabled';
const METADATA_INFERENCE_EXCERPT_LINES = 60;
const MAX_METADATA_LOG_ENTRIES = 500;

function readMetadataLogEnabledFromStorage() {
	try {
		return window.localStorage.getItem(METADATA_LOG_LS_KEY) === '1';
	} catch {
		return false;
	}
}

function EditorLayout(props) {
	const { selectedFile, updateFile, theme, inferFileMetadataFromAi } = props;
	const { t } = useI18n();
	const editorRef = useRef(null);
	const sourceScrollRef = useRef(null);
	/** 正在识别元数据的曲目 id（可多首并行，互不阻塞） */
	const [metadataInferringIds, setMetadataInferringIds] = useState(
		() => new Set()
	);
	const [metadataLogEnabled, setMetadataLogEnabled] = useState(
		readMetadataLogEnabledFromStorage
	);
	const [metadataLogModalOpen, setMetadataLogModalOpen] = useState(false);
	const [metadataLogEntries, setMetadataLogEntries] = useState([]);
	const [rawChordHelpOpen, setRawChordHelpOpen] = useState(false);
	const [isConvertingRawChord, setIsConvertingRawChord] = useState(false);

	const persistMetadataLogEnabled = useCallback((enabled) => {
		setMetadataLogEnabled(enabled);
		try {
			if (enabled) {
				window.localStorage.setItem(METADATA_LOG_LS_KEY, '1');
			} else {
				window.localStorage.removeItem(METADATA_LOG_LS_KEY);
			}
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		if (!metadataLogEnabled) {
			setMetadataLogModalOpen(false);
		}
	}, [metadataLogEnabled]);

	const handleMetadataDebugLogChange = useCallback(
		(checked) => {
			persistMetadataLogEnabled(checked);
			if (checked) {
				// 开启调试时立即展示弹窗，避免“点击无反应”的感知。
				setMetadataLogModalOpen(true);
			} else {
				setMetadataLogModalOpen(false);
			}
		},
		[
			persistMetadataLogEnabled,
			metadataLogEntries.length,
			metadataInferringIds.size,
		]
	);

	const handleClearMetadataLogEntries = useCallback(() => {
		setMetadataLogEntries([]);
	}, []);

	const previewClassNames = [
		'songEditor-preview',
		'cmTheme-' + theme,
		'cmTheme-fadeRepeats',
	];

	const handleConvertRawDraft = useCallback(() => {
		if (isConvertingRawChord) {
			return;
		}
		setIsConvertingRawChord(true);
		const raw =
			editorRef.current?.getPlainText?.() ?? selectedFile?.content ?? '';
		try {
			const converted = convertRawChordSheet(raw);
			if (
				typeof editorRef.current?.replacePlainTextWithUndo ===
				'function'
			) {
				editorRef.current.replacePlainTextWithUndo(converted);
			} else {
				editorRef.current?.replacePlainText?.(converted);
			}
		} finally {
			requestAnimationFrame(() => {
				editorRef.current?.scrollToTop?.();
				setIsConvertingRawChord(false);
			});
		}
	}, [selectedFile?.content, isConvertingRawChord]);

	const handleAiInferMetadata = useCallback(async () => {
		const fileId = selectedFile?.id;
		if (!fileId) {
			return;
		}
		const raw =
			editorRef.current?.getPlainText?.() ?? selectedFile?.content ?? '';
		const excerpt = raw
			.split('\n')
			.slice(0, METADATA_INFERENCE_EXCERPT_LINES)
			.join('\n');
		const onLog = (entry) =>
			setMetadataLogEntries((prev) => {
				const next = [
					...prev,
					{
						...entry,
						targetFileId: fileId,
						at: entry.at ?? Date.now(),
					},
				];
				if (next.length <= MAX_METADATA_LOG_ENTRIES) {
					return next;
				}
				return next.slice(next.length - MAX_METADATA_LOG_ENTRIES);
			});
		if (metadataLogEnabled) {
			setMetadataLogModalOpen(true);
		}
		setMetadataInferringIds((prev) => new Set(prev).add(fileId));
		try {
			await inferFileMetadataFromAi(excerpt, { fileId, onLog });
		} catch (e) {
			if (!metadataLogEnabled) {
				window.alert(e instanceof Error ? e.message : String(e));
			}
		} finally {
			setMetadataInferringIds((prev) => {
				const next = new Set(prev);
				next.delete(fileId);
				return next;
			});
		}
	}, [
		inferFileMetadataFromAi,
		metadataLogEnabled,
		selectedFile?.content,
		selectedFile?.id,
	]);

	const canUseMetadataAi = Boolean(selectedFile?.id);
	const metadataBusyForCurrent =
		Boolean(selectedFile?.id) && metadataInferringIds.has(selectedFile.id);
	const handleBackToTop = useCallback(() => {
		const el = sourceScrollRef.current;
		if (el) {
			el.scrollTo({ top: 0, behavior: 'smooth' });
		}
		editorRef.current?.scrollToTop?.();
	}, []);

	return (
		<>
			<div className={'songEditor-headers'}>
				<div className={'songEditor-sourceHeader'}>
					<div className={'songEditor-sourceHeader-text'}>
						<Icon iconName={'arrow_drop_down'} />
						ChordMark source (
						<a
							href={
								'https://chordmark.netlify.app/docs/getting-started'
							}
							target={'_blank'}
							rel={'noreferrer'}
							className={'link1'}
						>
							tutorial
						</a>
						)
						<Icon iconName={'arrow_drop_down'} />
					</div>
					<div
						className={'songEditor-sourceHeader-actions'}
						role={'toolbar'}
						aria-label={t('ChordMark 源码：整理、说明、元数据与调试')}
					>
						<div className={'songEditor-actionRail'}>
							<div className={'songEditor-actionCore'}>
								<div className={'songEditor-convertWrap'}>
									<button
										type={'button'}
										className={'songEditor-toolbarBtn songEditor-toolbarBtn--convert'}
										onClick={handleConvertRawDraft}
										disabled={isConvertingRawChord}
										aria-busy={isConvertingRawChord}
										title={t(
											'Convert to ChordMark：将左侧原始和弦稿解析为标准 ChordMark 结构并写回编辑区。处理规则可在「设置 → ChordMark整理」维护。'
										)}
									>
										<Icon iconName={'auto_fix_high'} />
										{isConvertingRawChord ? t('处理中…') : t('Convert to ChordMark')}
									</button>
								</div>
								<button
									type={'button'}
									className={'songEditor-toolbarBtn'}
									onClick={handleAiInferMetadata}
									disabled={!canUseMetadataAi || metadataBusyForCurrent}
									aria-busy={metadataBusyForCurrent}
									title={t(
										'将前 {{n}} 行送交 AI 推断标题、作者、类型与标签，并写入发起识别时的曲目；切换界面或其它歌曲识别中不影响本次回写（引擎与提示词在「设置」）',
										{ n: METADATA_INFERENCE_EXCERPT_LINES }
									)}
								>
									<Icon iconName={'psychology'} />
									{metadataBusyForCurrent ? t('识别中…') : t('AI 识别元数据')}
								</button>
							</div>
							<div className={'songEditor-actionAux'}>
								<button
									type={'button'}
									className={'songEditor-toolbarBtn songEditor-toolbarBtn--iconOnly'}
									onClick={handleBackToTop}
									aria-label={t('回到顶部')}
									title={t('回到顶部')}
								>
									<Icon iconName={'north'} />
								</button>
								<button
									type={'button'}
									className={`songEditor-toolbarBtn songEditor-toolbarBtn--iconOnly${
										metadataLogEnabled ? ' songEditor-toolbarBtn--active' : ''
									}`}
									role={'switch'}
									aria-checked={metadataLogEnabled}
									aria-label={t('调试日志')}
									title={t('调试日志')}
									onClick={() => handleMetadataDebugLogChange(!metadataLogEnabled)}
								>
									<Icon iconName={'article'} />
								</button>
								<button
									type={'button'}
									className={'songEditor-toolbarBtn songEditor-toolbarBtn--iconOnly'}
									onClick={() => setRawChordHelpOpen(true)}
									aria-label={t('查看「整理为 ChordMark」内置规则与顺序说明')}
									title={t('查看 Convert 规则说明')}
								>
									<Icon iconName={'info'} />
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className={'songEditor-previewHeader'}>
					<Icon iconName={'arrow_drop_down'} />
					Result preview
					<Icon iconName={'arrow_drop_down'} />
				</div>
			</div>
			<ScrollSync>
				<div className={'songEditor'}>
					<ScrollSyncNode group={'a'}>
						<div className={'songEditor-source'} ref={sourceScrollRef}>
							<ProseMirrorEditorView
								ref={editorRef}
								editorContent={selectedFile.content}
								updateFile={updateFile}
								selectedFileId={selectedFile.id}
							/>
						</div>
					</ScrollSyncNode>
					<ScrollSyncNode group={'a'}>
						<div className={previewClassNames.join(' ')}>
							<EditorPreview selectedFile={selectedFile} />
						</div>
					</ScrollSyncNode>
				</div>
			</ScrollSync>
			{metadataLogModalOpen && metadataLogEnabled ? (
				<MetadataInferenceLogModal
					entries={metadataLogEntries}
					debugLogEnabled={metadataLogEnabled}
					onDebugLogChange={handleMetadataDebugLogChange}
					onClearLogs={handleClearMetadataLogEntries}
				/>
			) : null}
			{rawChordHelpOpen ? (
				<RawChordConvertHelpModal
					onClose={() => setRawChordHelpOpen(false)}
				/>
			) : null}
		</>
	);
}

EditorLayout.propTypes = {
	selectedFile: PropTypes.object,
	theme: PropTypes.string.isRequired,
	updateFile: PropTypes.func.isRequired,
	inferFileMetadataFromAi: PropTypes.func.isRequired,
};

export default EditorLayout;
