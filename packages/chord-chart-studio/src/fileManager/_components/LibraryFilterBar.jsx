import './LibraryFilterBar.scss';

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Icon from '../../ui/_components/Icon';
import { useI18n } from '../../ui/i18n/I18nProvider';

function summaryFromIds(ids, catalog, emptyLabel, t) {
	if (!ids.length) {
		return emptyLabel;
	}
	if (ids.length === 1) {
		const name = catalog.find((x) => x.id === ids[0])?.name;
		return name || ids[0];
	}
	return t('已选 {{count}} 项', { count: ids.length });
}

function LibraryFilterBar(props) {
	const {
		genres,
		tags,
		authors,
		filterGenreIds,
		onToggleGenreFilter,
		onClearGenreFilters,
		filterTagIds,
		onToggleTagFilter,
		onClearTagFilters,
		filterAuthor,
		onAuthorFilterChange,
		tagsMatchAll,
		onTagsMatchAllChange,
	} = props;

	const { t, lang } = useI18n();

	const rootRef = useRef(null);
	const [open, setOpen] = useState(
		/** @type {null | 'genre' | 'tags' | 'author'} */ (null)
	);
	const [authorSearch, setAuthorSearch] = useState('');

	useEffect(() => {
		if (!open) {
			return undefined;
		}
		const onDoc = (e) => {
			const n = rootRef.current;
			if (n && !n.contains(e.target)) {
				setOpen(null);
			}
		};
		document.addEventListener('mousedown', onDoc);
		return () => document.removeEventListener('mousedown', onDoc);
	}, [open]);

	const genreSummary = summaryFromIds(
		filterGenreIds,
		genres,
		t('全部类型'),
		t
	);
	const tagSummary = summaryFromIds(
		filterTagIds,
		tags,
		t('全部标签'),
		t
	);
	const tagModeLabel = tagsMatchAll ? t('须全部包含') : t('满足任一');
	const normalizedAuthorSearch = authorSearch.trim().toLowerCase();
	const filteredAuthors = normalizedAuthorSearch
		? authors.filter((a) =>
				(a || '').toLowerCase().includes(normalizedAuthorSearch)
			)
		: authors;

	return (
		<div className="libraryFilter" ref={rootRef}>
			<div className="libraryFilter-row">
				<div className="libraryFilter-cell">
					<button
						type="button"
						className={
							open === 'author'
								? 'libraryFilter-trigger libraryFilter-trigger--active'
								: 'libraryFilter-trigger'
						}
						aria-expanded={open === 'author'}
						aria-haspopup="listbox"
						onClick={() =>
							setOpen((o) => (o === 'author' ? null : 'author'))
						}
					>
						<span className="libraryFilter-triggerLabel">{t('歌手')}</span>
						<span className="libraryFilter-triggerSummary">
							{filterAuthor || t('全部歌手')}
						</span>
						<Icon
							iconName={
								open === 'author' ? 'expand_less' : 'expand_more'
							}
						/>
					</button>
					{open === 'author' ? (
						<div
							className="libraryFilter-pop"
							role="listbox"
							aria-label={t('按歌手筛选')}
						>
							<div className="libraryFilter-popHead">
								<span>{t('从曲库作者中搜索并选择')}</span>
								<button
									type="button"
									className="libraryFilter-linkBtn"
									onClick={() => onAuthorFilterChange('')}
								>
									{t('清除')}
								</button>
							</div>
							<input
								type="search"
								className="promptTemplatesPanel-input"
								value={authorSearch}
								onChange={(e) => setAuthorSearch(e.target.value)}
								placeholder={t('搜索歌手…')}
								aria-label={t('搜索歌手')}
							/>
							<ul className="libraryFilter-checkList">
								<li>
									<label className="libraryFilter-checkRow">
										<input
											type="radio"
											name="library-author-filter"
											checked={!filterAuthor}
											onChange={() => onAuthorFilterChange('')}
										/>
										<span>{t('全部歌手')}</span>
									</label>
								</li>
								{filteredAuthors.map((a) => (
									<li key={a}>
										<label className="libraryFilter-checkRow">
											<input
												type="radio"
												name="library-author-filter"
												checked={filterAuthor === a}
												onChange={() =>
													onAuthorFilterChange(a)
												}
											/>
											<span>{a}</span>
										</label>
									</li>
								))}
								{filteredAuthors.length === 0 ? (
									<li className="libraryFilter-empty">
										{t('没有匹配歌手')}
									</li>
								) : null}
							</ul>
						</div>
					) : null}
				</div>

				<div className="libraryFilter-cell">
					<button
						type="button"
						className={
							open === 'genre'
								? 'libraryFilter-trigger libraryFilter-trigger--active'
								: 'libraryFilter-trigger'
						}
						aria-expanded={open === 'genre'}
						aria-haspopup="listbox"
						onClick={() =>
							setOpen((o) => (o === 'genre' ? null : 'genre'))
						}
					>
						<span className="libraryFilter-triggerLabel">{t('类型')}</span>
						<span className="libraryFilter-triggerSummary">
							{genreSummary}
						</span>
						<Icon
							iconName={
								open === 'genre' ? 'expand_less' : 'expand_more'
							}
						/>
					</button>
					{open === 'genre' ? (
						<div
							className="libraryFilter-pop"
							role="listbox"
							aria-label={t('按类型筛选')}
						>
							<div className="libraryFilter-popHead">
								<span>
									{t('多选：曲目类型在任一选中项中即显示')}
								</span>
								<button
									type="button"
									className="libraryFilter-linkBtn"
									onClick={onClearGenreFilters}
								>
									{t('清除')}
								</button>
							</div>
							<ul className="libraryFilter-checkList">
								{genres.map((g) => (
									<li key={g.id}>
										<label className="libraryFilter-checkRow">
											<input
												type="checkbox"
												checked={filterGenreIds.includes(
													g.id
												)}
												onChange={() =>
													onToggleGenreFilter(g.id)
												}
											/>
											<span>{g.name}</span>
										</label>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>

				<div className="libraryFilter-cell">
					<button
						type="button"
						className={
							open === 'tags'
								? 'libraryFilter-trigger libraryFilter-trigger--active'
								: 'libraryFilter-trigger'
						}
						aria-expanded={open === 'tags'}
						aria-haspopup="listbox"
						onClick={() =>
							setOpen((o) => (o === 'tags' ? null : 'tags'))
						}
					>
						<span className="libraryFilter-triggerLabel">{t('标签')}</span>
						<span className="libraryFilter-triggerSummary">
							{tagSummary}
						</span>
						<span className="libraryFilter-triggerMode">
							{filterTagIds.length ? tagModeLabel : ''}
						</span>
						<Icon
							iconName={
								open === 'tags' ? 'expand_less' : 'expand_more'
							}
						/>
					</button>
					{open === 'tags' ? (
						<div
							className="libraryFilter-pop"
							role="group"
							aria-label={t('按标签筛选')}
						>
							<div className="libraryFilter-popHead">
								<span>{t('多选标签时的匹配方式')}</span>
								<button
									type="button"
									className="libraryFilter-linkBtn"
									onClick={onClearTagFilters}
								>
									{t('清除')}
								</button>
							</div>
							<div
								className="libraryFilter-modeRow"
								role="radiogroup"
								aria-label={t('标签匹配关系')}
							>
								<label className="libraryFilter-modeOption">
									<input
										type="radio"
										name="library-tag-filter-mode"
										checked={!tagsMatchAll}
										onChange={() =>
											onTagsMatchAllChange(false)
										}
									/>
									<span>{t('满足任一')}</span>
								</label>
								<label className="libraryFilter-modeOption">
									<input
										type="radio"
										name="library-tag-filter-mode"
										checked={tagsMatchAll}
										onChange={() =>
											onTagsMatchAllChange(true)
										}
									/>
									<span>{t('须全部包含')}</span>
								</label>
							</div>
							<ul className="libraryFilter-checkList">
								{tags.length === 0 ? (
									<li className="libraryFilter-empty">
										{t('暂无标签，可在下方元数据中添加')}
									</li>
								) : null}
								{tags.map((t) => (
									<li key={t.id}>
										<label className="libraryFilter-checkRow">
											<input
												type="checkbox"
												checked={filterTagIds.includes(
													t.id
												)}
												onChange={() =>
													onToggleTagFilter(t.id)
												}
											/>
											<span>{t.name}</span>
										</label>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

LibraryFilterBar.propTypes = {
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
	authors: PropTypes.arrayOf(PropTypes.string).isRequired,
	filterGenreIds: PropTypes.arrayOf(PropTypes.string).isRequired,
	onToggleGenreFilter: PropTypes.func.isRequired,
	onClearGenreFilters: PropTypes.func.isRequired,
	filterTagIds: PropTypes.arrayOf(PropTypes.string).isRequired,
	onToggleTagFilter: PropTypes.func.isRequired,
	onClearTagFilters: PropTypes.func.isRequired,
	filterAuthor: PropTypes.string.isRequired,
	onAuthorFilterChange: PropTypes.func.isRequired,
	tagsMatchAll: PropTypes.bool.isRequired,
	onTagsMatchAllChange: PropTypes.func.isRequired,
};

export default React.memo(LibraryFilterBar);
