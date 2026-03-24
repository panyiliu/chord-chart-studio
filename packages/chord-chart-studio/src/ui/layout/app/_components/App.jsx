import './App.scss';

import React from 'react';
import PropTypes from 'prop-types';

import Logo from '../../../sideBar/_components/Logo';
import Nav from './Nav';
import Versions from '../../../sideBar/_components/Versions';
import AiSettingsModal from '../../../../fileManager/_components/AiSettingsModal';
import Icon from '../../../_components/Icon';
import SongImporter from '../../../../songImporter/_containers/SongImporter';

import allNavEntries from '../allNavEntries';

import { I18nProvider } from '../../../i18n/I18nProvider';

function App(props) {
	const {
		editorMode,
		isLeftBarCollapsed,
		isRightBarCollapsed,
		toggleLeftBar,
		toggleRightBar,
		setEditorMode,
		selectedId,
		selectedFileTitle,
		updateFile,

		leftBar,
		rightBar,

		aiSettingsOpen,
		setAiSettingsOpen,
	} = props;

	const leftBarClassNames = ['leftBar'];
	if (isLeftBarCollapsed) {
		leftBarClassNames.push('leftBar-isCollapsed');
	}

	const rightBarClassNames = ['rightBar'];
	if (isRightBarCollapsed) {
		rightBarClassNames.push('rightBar-isCollapsed');
	}

	return (
		<I18nProvider>
			<div className={'appLayout-wrapper'}>
				<SongImporter />
				<section className={leftBarClassNames.join(' ')}>
					<div
						className={'leftBar-content'}
						onClick={isLeftBarCollapsed ? toggleLeftBar : null}
					>
						<Logo />
						{leftBar}
					</div>
					<div
						className={'leftBar-collapser'}
						onClick={toggleLeftBar}
						data-testid={'leftBar-collapser'}
					>
						<span className={'leftBar-collapserIcon'}>
							<Icon iconName={'keyboard_arrow_left'} />
						</span>
					</div>
				</section>
				<section className={'appLayout-main'}>
					<section className={'appLayout-header'}>
						<div className={'appLayout-headerRow'}>
							<div className={'appLayout-headerNav'}>
								<Nav
									allEntries={allNavEntries}
									currentMode={editorMode}
									setEditorMode={setEditorMode}
									selectedId={selectedId}
									selectedFileTitle={selectedFileTitle}
									onSaveSelectedFileTitle={(nextTitle) => {
										if (!selectedId) return;
										updateFile(selectedId, {
											title: nextTitle,
										});
									}}
								/>
							</div>
						</div>
					</section>
					<section className={'appLayout-content'}>
						{props.children}
					</section>
				</section>
				<section className={rightBarClassNames.join(' ')}>
					<div
						className={'rightBar-collapser'}
						onClick={toggleRightBar}
						data-testid={'rightBar-collapser'}
					>
						<span className={'rightBar-collapserIcon'}>
							<Icon iconName={'keyboard_arrow_right'} />
						</span>
					</div>
					<div
						className={'rightBar-content'}
						onClick={isRightBarCollapsed ? toggleRightBar : null}
					>
						<div className={'rightBar-mainTools'}>
							{React.cloneElement(rightBar, {
								onOpenSettings: () => setAiSettingsOpen(true),
							})}
						</div>
						<div className={'rightBar-footerMeta'}>
							<Versions />
						</div>
					</div>
				</section>
				{aiSettingsOpen ? (
					<AiSettingsModal
						closeModal={() => setAiSettingsOpen(false)}
					/>
				) : null}
			</div>
		</I18nProvider>
	);
}

App.propTypes = {
	children: PropTypes.element,

	isLeftBarCollapsed: PropTypes.bool,
	isRightBarCollapsed: PropTypes.bool,
	selectedId: PropTypes.string,
	selectedFileTitle: PropTypes.string,
	toggleLeftBar: PropTypes.func.isRequired,
	toggleRightBar: PropTypes.func.isRequired,

	editorMode: PropTypes.string.isRequired,
	setEditorMode: PropTypes.func.isRequired,
	updateFile: PropTypes.func.isRequired,

	leftBar: PropTypes.element.isRequired,
	rightBar: PropTypes.element.isRequired,

	aiSettingsOpen: PropTypes.bool.isRequired,
	setAiSettingsOpen: PropTypes.func.isRequired,
};

App.defaultProps = {
	isLeftBarCollapsed: false,
	isRightBarCollapsed: false,
};

export default App;
