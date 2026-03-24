import { connect } from 'react-redux';

import {
	toggleLeftBar,
	toggleRightBar,
	setEditorMode,
	setAiSettingsOpen,
} from '../_state/actions';
import {
	isLeftBarCollapsed,
	isRightBarCollapsed,
	getEditorMode,
	isAiSettingsOpen,
} from '../_state/selectors';
import { getSelectedId } from '../../../../fileManager/_state/selectors';
import { getOne } from '../../../../db/files/selectors';
import { updateFile } from '../../../../db/files/actions';

import App from '../_components/App';

export default connect(
	(state) => ({
		editorMode: getEditorMode(state),
		isLeftBarCollapsed: isLeftBarCollapsed(state),
		isRightBarCollapsed: isRightBarCollapsed(state),
		selectedId: getSelectedId(state),
		aiSettingsOpen: isAiSettingsOpen(state),
		selectedFileTitle: getOne(state, getSelectedId(state))?.title || '',
	}),

	{
		toggleLeftBar,
		toggleRightBar,
		setEditorMode,
		setAiSettingsOpen,
		updateFile,
	}
)(App);
