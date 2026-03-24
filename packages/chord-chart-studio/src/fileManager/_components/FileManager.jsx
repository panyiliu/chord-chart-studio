import './FileManager.scss';

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import exportSelectedFileAsText from '../exportSelectedFileAsText';
import { getPrintPdfDocumentTitle } from '../getPrintPdfDocumentTitle';
import { backupNow } from '../../backup/backupStorage';
import {
	backupStateToBackblazeLatest,
	buildCloudBackupJsonTextFromState,
	getBackblazeConfig,
	isBackblazeConfigComplete,
} from '../../backup/backblazeB2Backup';

import DeleteConfirmModal from './DeleteConfirmModal';
import Icon from '../../ui/_components/Icon';
import FileActions from './FileActions';
import FileEntry from './FileEntry';
import FileMetadataPanel from '../_containers/FileMetadataPanel';
import LibraryFilterBar from './LibraryFilterBar';
import { useI18n } from '../../ui/i18n/I18nProvider';

function FileManager(props) {
	const { t } = useI18n();
	const fileManagerRootRef = useRef(null);
	const entriesListRef = useRef(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [backupErrorText, setBackupErrorText] = useState('');
	const [backupStatusText, setBackupStatusText] = useState('');
	const [searchText, setSearchText] = useState('');
	const [filterGenreIds, setFilterGenreIds] = useState(
		/** @type {string[]} */ ([])
	);
	const [filterTagIds, setFilterTagIds] = useState(
		/** @type {string[]} */ ([])
	);
	const [filterAuthor, setFilterAuthor] = useState('');
	const [tagsMatchAll, setTagsMatchAll] = useState(false);

	const {
		allTitles,
		genres,
		tags,
		selected,
		renamed,
		defaultTitle,

		createFile,
		deleteFile,
		enableRename,
		startImport,
		selectFile,
		updateFile,
		setEditorMode,
		requestBrowserSystemPrint,
	} = props;

	const keyword = searchText.trim().toLowerCase();
	const authorOptions = Array.from(
		new Set(
			allTitles
				.map((x) => String(x.author || '').trim())
				.filter(Boolean)
				.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
		)
	);

	const filteredByCatalog = allTitles.filter((f) => {
		if (filterAuthor && String(f.author || '').trim() !== filterAuthor) {
			return false;
		}
		if (filterGenreIds.length > 0) {
			if (!f.genreId || !filterGenreIds.includes(f.genreId)) {
				return false;
			}
		}
		if (filterTagIds.length > 0) {
			const set = new Set(f.tagIds || []);
			if (tagsMatchAll) {
				if (!filterTagIds.every((id) => set.has(id))) {
					return false;
				}
			} else if (!filterTagIds.some((id) => set.has(id))) {
				return false;
			}
		}
		return true;
	});

	const filteredTitles = keyword
		? filteredByCatalog.filter((f) =>
				(f.title || '').toLowerCase().includes(keyword)
			)
		: filteredByCatalog;

	const toggleGenreFilter = (id) => {
		setFilterGenreIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	};

	const toggleTagFilter = (id) => {
		setFilterTagIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	};

	useEffect(() => {
		const onKeyDown = (e) => {
			if (e.key !== 'Delete' || e.repeat) {
				return;
			}
			if (!selected || isDeleting) {
				return;
			}
			const root = fileManagerRootRef.current;
			const el = document.activeElement;
			if (!root || !el || !root.contains(el)) {
				return;
			}
			if (el.isContentEditable) {
				return;
			}
			const tag = el.tagName;
			if (tag === 'TEXTAREA' || tag === 'SELECT') {
				return;
			}
			if (tag === 'INPUT') {
				const inp = /** @type {HTMLInputElement} */ (el);
				if (!inp.readOnly) {
					return;
				}
			}
			e.preventDefault();
			setIsDeleting(true);
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [selected, isDeleting]);

	/**
	 * 避免“内层可滚动容器嵌套导致滚轮不灵敏/滚动目标不一致”的体验问题：
	 * 当鼠标在歌曲列表文字区域滚轮时，强制滚动到 entriesList 本身。
	 */
	const handleEntriesWheel = (e) => {
		const el = entriesListRef.current;
		if (!el) {
			return;
		}
		const isScrollable = el.scrollHeight > el.clientHeight + 1;
		if (!isScrollable) {
			return;
		}

		const delta =
			e.deltaMode === 1
				? e.deltaY * 16 // line
				: e.deltaMode === 2
					? e.deltaY * el.clientHeight // page
					: e.deltaY; // pixel

		const factor = 1.25;
		const maxScrollTop = el.scrollHeight - el.clientHeight;
		const nextScrollTop = el.scrollTop + delta * factor;

		// 边界时交给外层容器滚动（避免“滚轮滚不动”死在边界）
		if (
			(nextScrollTop <= 0 && delta < 0) ||
			(nextScrollTop >= maxScrollTop && delta > 0)
		) {
			return;
		}

		e.preventDefault();
		el.scrollTop = Math.min(maxScrollTop, Math.max(0, nextScrollTop));
	};

	return (
		<div className={'fileManager'} ref={fileManagerRootRef}>
			<DeleteConfirmModal
				deleteFile={deleteFile}
				isDeleting={isDeleting}
				selected={selected}
				setIsDeleting={setIsDeleting}
			/>
			<div className={'fileManager-isCollapsed'}>
				<span className={'fileManager-icon'}>
					<Icon iconName={'file_copy'} />
				</span>
			</div>

			<div className={'fileManager-isExpanded'}>
				<FileActions
					selected={selected}
					onNewScratch={() => createFile(defaultTitle)}
					deleteFile={() => setIsDeleting(true)}
					enableRename={() => enableRename(selected)}
					startImport={() => startImport()}
					backupNow={() => {
						(async () => {
							try {
								const b2cfg = getBackblazeConfig();
								if (!isBackblazeConfigComplete(b2cfg)) {
									setBackupErrorText(
										t('请先填写完整的 Backblaze 配置。')
									);
									setBackupStatusText('');
									return;
								}

								setBackupErrorText('');
								setBackupStatusText(t('正在备份到云端…'));
								const snapshot = backupNow();
								const jsonText = buildCloudBackupJsonTextFromState(
									snapshot?.state
								);
								await backupStateToBackblazeLatest(b2cfg, jsonText);
								setBackupStatusText(t('备份成功：已上传并覆盖云端同一对象。'));
							} catch (e) {
								// eslint-disable-next-line no-console
								console.error(e);
								setBackupErrorText(
									t('备份失败：') + String(e?.message || e)
								);
								setBackupStatusText('');
							}
						})();
					}}
					exportAsText={() => {
						setEditorMode('export');
						setTimeout(() => exportSelectedFileAsText(), 0);
					}}
					printFile={() => {
						setEditorMode('print');
						requestBrowserSystemPrint({
							pdfDocumentTitle: getPrintPdfDocumentTitle(
								selected,
								allTitles,
								defaultTitle
							),
						});
					}}
				/>
				{backupErrorText ? (
					<p className={'fileManager-backupError'}>{backupErrorText}</p>
				) : null}
				{backupStatusText ? (
					<p className={'fileManager-backupStatus'}>{backupStatusText}</p>
				) : null}
				<div className={'fileManager-searchWrap'}>
					<input
						type={'search'}
						className={'fileManager-searchInput'}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						placeholder={t('搜索歌曲名…')}
						aria-label={t('搜索歌曲名')}
					/>
					<div className={'fileManager-searchMeta'}>
						{filteredTitles.length}/{allTitles.length}
					</div>
				</div>
				<LibraryFilterBar
					genres={genres}
					tags={tags}
					authors={authorOptions}
					filterGenreIds={filterGenreIds}
					onToggleGenreFilter={toggleGenreFilter}
					onClearGenreFilters={() => setFilterGenreIds([])}
					filterTagIds={filterTagIds}
					onToggleTagFilter={toggleTagFilter}
					onClearTagFilters={() => setFilterTagIds([])}
					filterAuthor={filterAuthor}
					onAuthorFilterChange={setFilterAuthor}
					tagsMatchAll={tagsMatchAll}
					onTagsMatchAllChange={setTagsMatchAll}
				/>
				<ul
					className={'fileManager-entriesList'}
					ref={entriesListRef}
					onWheel={handleEntriesWheel}
					title={
						t('选中曲目后，焦点在曲库内时按 Delete 可删除（与「删除」按钮相同确认框）')
					}
				>
					{filteredTitles.map((file) => (
						<FileEntry
							title={file.title}
							defaultTitle={defaultTitle}
							fileId={file.id}
							isSelected={selected === file.id}
							isRenamed={renamed === file.id}
							selectFile={selectFile}
							updateFile={updateFile}
							enableRename={enableRename}
							key={file.id}
						/>
					))}
				</ul>
				{filteredTitles.length === 0 ? (
					<p className={'fileManager-emptyTip'}>{t('未找到匹配歌曲')}</p>
				) : null}
				<FileMetadataPanel />
			</div>
		</div>
	);
}

FileManager.propTypes = {
	allTitles: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string.isRequired,
			id: PropTypes.string.isRequired,
			genreId: PropTypes.string,
			tagIds: PropTypes.arrayOf(PropTypes.string),
			author: PropTypes.string,
		})
	).isRequired,
	genres: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		})
	).isRequired,
	tags: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		})
	).isRequired,
	selected: PropTypes.string.isRequired,
	renamed: PropTypes.string.isRequired,
	defaultTitle: PropTypes.string.isRequired,

	selectFile: PropTypes.func.isRequired,
	createFile: PropTypes.func.isRequired,
	deleteFile: PropTypes.func.isRequired,
	enableRename: PropTypes.func.isRequired,
	startImport: PropTypes.func.isRequired,
	updateFile: PropTypes.func.isRequired,
	setEditorMode: PropTypes.func.isRequired,
	requestBrowserSystemPrint: PropTypes.func.isRequired,
};

export default FileManager;
