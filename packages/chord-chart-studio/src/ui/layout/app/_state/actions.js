import {
	UI_LAYOUT_APP_SET_EDITOR_MODE,
	UI_LAYOUT_APP_TOGGLE_LEFT_BAR,
	UI_LAYOUT_APP_TOGGLE_RIGHT_BAR,
	UI_LAYOUT_APP_SET_AI_SETTINGS_OPEN,
	UI_LAYOUT_APP_REQUEST_BROWSER_SYSTEM_PRINT,
	UI_LAYOUT_APP_CLEAR_BROWSER_SYSTEM_PRINT,
} from './actionsTypes';

import createAction from '../../../../core/createAction';

export const setEditorMode = (mode) =>
	createAction(UI_LAYOUT_APP_SET_EDITOR_MODE, { mode });

export const toggleLeftBar = () => createAction(UI_LAYOUT_APP_TOGGLE_LEFT_BAR);

export const toggleRightBar = () =>
	createAction(UI_LAYOUT_APP_TOGGLE_RIGHT_BAR);

export const setAiSettingsOpen = (open) =>
	createAction(UI_LAYOUT_APP_SET_AI_SETTINGS_OPEN, { open });

export const requestBrowserSystemPrint = ({ pdfDocumentTitle }) =>
	createAction(UI_LAYOUT_APP_REQUEST_BROWSER_SYSTEM_PRINT, {
		pdfDocumentTitle,
	});

export const clearBrowserSystemPrint = () =>
	createAction(UI_LAYOUT_APP_CLEAR_BROWSER_SYSTEM_PRINT);
