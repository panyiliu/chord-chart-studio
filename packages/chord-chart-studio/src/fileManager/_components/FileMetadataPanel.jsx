import './FileMetadataPanel.scss';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import Icon from '../../ui/_components/Icon';
import { useI18n } from '../../ui/i18n/I18nProvider';

function FileMetadataPanel(props) {
	const {
		selectedId,
		file,
		genres,
		tags,
		addGenre,
		updateGenre,
		removeGenre,
		addTag,
		updateTag,
		removeTag,
		updateFile,
	} = props;

	const { t, lang } = useI18n();
	const unselected = t('未选择');

	const [genreOpen, setGenreOpen] = useState(false);
	const [tagOpen, setTagOpen] = useState(false);

	if (!selectedId || !file) {
		return (
			<div className="fileMetadataPanel">
				<div className="fileMetadataPanel-title">{t('元数据')}</div>
				<p className="fileMetadataPanel-empty">
					{t('选中曲目后可编辑作者、类型与标签。')}
				</p>
			</div>
		);
	}

	const onAuthorChange = (e) => {
		updateFile(selectedId, { author: e.target.value });
	};

	const radioGroupName = `file-metadata-genre-${selectedId}`;

	const currentGenreSummary = !file.genreId
		? unselected
		: genres.find((g) => g.id === file.genreId)?.name ?? unselected;

	const selectedTagNames = (file.tagIds || [])
		.map((id) => tags.find((t) => t.id === id)?.name)
		.filter(Boolean);
	const tagSummary =
		selectedTagNames.length === 0
			? unselected
			: selectedTagNames.length <= 2
				? lang === 'en'
					? selectedTagNames.join(', ')
					: selectedTagNames.join('、')
				: t('已选 {{count}} 个', { count: selectedTagNames.length });

	const addNewGenre = () => {
		const name = window.prompt(t('请输入新类型名称'));
		if (!name || !name.trim()) {
			return;
		}
		const id = `genre_${uuidv4()}`;
		addGenre(id, name.trim());
		updateFile(selectedId, { genreId: id });
	};

	const renameGenre = (g) => {
		const name = window.prompt(t('类型名称'), g.name);
		if (name == null || !String(name).trim()) {
			return;
		}
		updateGenre(g.id, String(name).trim());
	};

	const onRemoveGenre = (genreId, genreName) => {
		if (
			!window.confirm(
				t('确定删除类型「{{name}}」？\n使用该类型的曲目将变为「未选择」。', {
					name: genreName,
				})
			)
		) {
			return;
		}
		removeGenre(genreId);
	};

	const toggleTag = (tagId) => {
		const next = new Set(file.tagIds || []);
		if (next.has(tagId)) {
			next.delete(tagId);
		} else {
			next.add(tagId);
		}
		updateFile(selectedId, { tagIds: Array.from(next) });
	};

	const addNewTag = () => {
		const name = window.prompt(t('请输入新标签名称'));
		if (!name || !name.trim()) {
			return;
		}
		const id = `tag_${uuidv4()}`;
		addTag(id, name.trim());
		const next = new Set(file.tagIds || []);
		next.add(id);
		updateFile(selectedId, { tagIds: Array.from(next) });
	};

	const renameTag = (t) => {
		const name = window.prompt(t('标签名称'), t.name);
		if (name == null || !String(name).trim()) {
			return;
		}
		updateTag(t.id, String(name).trim());
	};

	const onRemoveTag = (tagId, tagName) => {
		if (
			!window.confirm(
				t(
					'确定删除标签「{{name}}」？\n将从曲库移除，并从所有曲目上摘掉该标签。',
					{ name: tagName }
				)
			)
		) {
			return;
		}
		removeTag(tagId);
	};

	return (
		<div className="fileMetadataPanel">
			<div className="fileMetadataPanel-title">{t('元数据')}</div>

			<label
				className="fileMetadataPanel-label"
				htmlFor="file-metadata-author"
			>
				{t('作者')}
			</label>
			<input
				id="file-metadata-author"
				className="fileMetadataPanel-input"
				type="text"
				value={file.author ?? ''}
				onChange={onAuthorChange}
				placeholder={t('作者名')}
				autoComplete="off"
			/>

			<div className="fileMetadataPanel-dropSection">
				<button
					type="button"
					className={
						genreOpen
							? 'fileMetadataPanel-dropToggle fileMetadataPanel-dropToggle--open'
							: 'fileMetadataPanel-dropToggle'
					}
					onClick={() => setGenreOpen((o) => !o)}
					aria-expanded={genreOpen}
					id="file-metadata-genre-heading"
				>
					<span className="fileMetadataPanel-dropLabel">{t('类型')}</span>
					<span className="fileMetadataPanel-dropSummary">
						{currentGenreSummary}
					</span>
					<Icon
						iconName={genreOpen ? 'expand_less' : 'expand_more'}
					/>
				</button>
				{genreOpen ? (
					<div
						className="fileMetadataPanel-dropBody"
						role="group"
						aria-labelledby="file-metadata-genre-heading"
					>
						<button
							type="button"
							className="fileMetadataPanel-dropPrimaryBtn"
							onClick={addNewGenre}
						>
							{t('新增类型')}
						</button>
						<ul className="fileMetadataPanel-dropList">
							<li className="fileMetadataPanel-dropRow">
								<label className="fileMetadataPanel-dropPick">
									<input
										type="radio"
										name={radioGroupName}
										checked={!file.genreId}
										onChange={() =>
											updateFile(selectedId, {
												genreId: null,
											})
										}
									/>
									<span>{unselected}</span>
								</label>
							</li>
							{genres.map((g) => (
								<li
									key={g.id}
									className="fileMetadataPanel-dropRow"
								>
									<label className="fileMetadataPanel-dropPick">
										<input
											type="radio"
											name={radioGroupName}
											checked={file.genreId === g.id}
											onChange={() =>
												updateFile(selectedId, {
													genreId: g.id,
												})
											}
										/>
										<span className="fileMetadataPanel-dropPickText">
											{g.name}
										</span>
									</label>
									<div className="fileMetadataPanel-dropActions">
										<button
											type="button"
											className="fileMetadataPanel-dropMiniBtn"
											onClick={() => renameGenre(g)}
										>
											{t('改名')}
										</button>
										<button
											type="button"
											className="fileMetadataPanel-dropMiniBtn"
											onClick={() =>
												onRemoveGenre(g.id, g.name)
											}
										>
											{t('删除')}
										</button>
									</div>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</div>

			<div className="fileMetadataPanel-dropSection">
				<button
					type="button"
					className={
						tagOpen
							? 'fileMetadataPanel-dropToggle fileMetadataPanel-dropToggle--open'
							: 'fileMetadataPanel-dropToggle'
					}
					onClick={() => setTagOpen((o) => !o)}
					aria-expanded={tagOpen}
					id="file-metadata-tags-heading"
				>
					<span className="fileMetadataPanel-dropLabel">{t('标签')}</span>
					<span className="fileMetadataPanel-dropSummary">
						{tagSummary}
					</span>
					<Icon iconName={tagOpen ? 'expand_less' : 'expand_more'} />
				</button>
				{tagOpen ? (
					<div
						className="fileMetadataPanel-dropBody"
						role="group"
						aria-labelledby="file-metadata-tags-heading"
					>
						<p className="fileMetadataPanel-dropHint">
							{t(
								'勾选下方标签以关联到本曲目；可在曲库列表用「标签」筛选。'
							)}
						</p>
						<button
							type="button"
							className="fileMetadataPanel-dropPrimaryBtn"
							onClick={addNewTag}
						>
							{t('新增标签')}
						</button>
						<ul className="fileMetadataPanel-tagAssignList">
							{tags.length === 0 ? (
								<li className="fileMetadataPanel-dropEmpty">
									{t('暂无标签，请先新增')}
								</li>
							) : null}
							{tags.map((t) => (
								<li key={t.id}>
									<label className="fileMetadataPanel-tagAssignRow">
										<input
											type="checkbox"
											checked={(
												file.tagIds || []
											).includes(t.id)}
											onChange={() => toggleTag(t.id)}
										/>
										<span>{t.name}</span>
									</label>
								</li>
							))}
						</ul>
						<div
							className="fileMetadataPanel-dropDivider"
							role="presentation"
						/>
						<div className="fileMetadataPanel-dropSubhead">
							{t('管理曲库标签')}
						</div>
						<ul className="fileMetadataPanel-dropManageList">
							{tags.map((t) => (
								<li
									key={`m-${t.id}`}
									className="fileMetadataPanel-dropManageRow"
								>
									<span className="fileMetadataPanel-dropManageName">
										{t.name}
									</span>
									<div className="fileMetadataPanel-dropActions">
										<button
											type="button"
											className="fileMetadataPanel-dropMiniBtn"
											onClick={() => renameTag(t)}
										>
											{t('改名')}
										</button>
										<button
											type="button"
											className="fileMetadataPanel-dropMiniBtn"
											onClick={() =>
												onRemoveTag(t.id, t.name)
											}
										>
											{t('删除')}
										</button>
									</div>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</div>
		</div>
	);
}

FileMetadataPanel.propTypes = {
	selectedId: PropTypes.string,
	file: PropTypes.shape({
		id: PropTypes.string,
		author: PropTypes.string,
		genreId: PropTypes.string,
		tagIds: PropTypes.arrayOf(PropTypes.string),
	}),
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
	addGenre: PropTypes.func.isRequired,
	updateGenre: PropTypes.func.isRequired,
	removeGenre: PropTypes.func.isRequired,
	addTag: PropTypes.func.isRequired,
	updateTag: PropTypes.func.isRequired,
	removeTag: PropTypes.func.isRequired,
	updateFile: PropTypes.func.isRequired,
};

export default FileMetadataPanel;
