import './Nav.scss';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import NavEntry from './NavEntry';
import { useI18n } from '../../../i18n/I18nProvider';

function Nav(props) {
	const {
		currentMode,
		allEntries,
		setEditorMode,
		selectedId,
		selectedFileTitle,
		onSaveSelectedFileTitle,
	} = props;
	const { t } = useI18n();
	const [draftTitle, setDraftTitle] = useState(selectedFileTitle || '');

	useEffect(() => {
		setDraftTitle(selectedFileTitle || '');
	}, [selectedFileTitle, selectedId]);

	return (
		<nav className={'mainNav'}>
			<ul className={'mainNav-entries'}>
				{allEntries.map((entry, key) => (
					<NavEntry
						key={key}
						isActive={
							!!selectedId && entry.editorMode === currentMode
						}
						isDisabled={!selectedId}
						setEditorMode={setEditorMode}
						{...entry}
					/>
				))}
			</ul>
			<div className={'mainNav-titleEditor'}>
				<label htmlFor={'main-nav-title'}>{t('歌曲名称')}</label>
				<input
					id={'main-nav-title'}
					type={'text'}
					value={draftTitle}
					onChange={(e) => setDraftTitle(e.target.value)}
					onBlur={() => {
						const next = String(draftTitle || '').trim();
						if (next) onSaveSelectedFileTitle(next);
					}}
					onKeyDown={(e) => {
						if (e.key !== 'Enter') return;
						e.preventDefault();
						const next = String(draftTitle || '').trim();
						if (next) onSaveSelectedFileTitle(next);
						e.currentTarget.blur();
					}}
					placeholder={'[untitled]'}
					disabled={!selectedId}
				/>
			</div>
		</nav>
	);
}

Nav.propTypes = {
	currentMode: PropTypes.string.isRequired,
	setEditorMode: PropTypes.func.isRequired,
	selectedId: PropTypes.string,
	selectedFileTitle: PropTypes.string,
	onSaveSelectedFileTitle: PropTypes.func.isRequired,
	allEntries: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
			icon: PropTypes.string.isRequired,
			editorMode: PropTypes.string.isRequired,
		})
	),
};

export default React.memo(Nav);
