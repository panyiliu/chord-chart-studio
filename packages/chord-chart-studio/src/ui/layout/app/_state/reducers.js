import {
	UI_LAYOUT_APP_TOGGLE_RIGHT_BAR,
	UI_LAYOUT_APP_TOGGLE_LEFT_BAR,
	UI_LAYOUT_APP_SET_EDITOR_MODE,
	UI_LAYOUT_APP_SET_AI_SETTINGS_OPEN,
	UI_LAYOUT_APP_REQUEST_BROWSER_SYSTEM_PRINT,
	UI_LAYOUT_APP_CLEAR_BROWSER_SYSTEM_PRINT,
} from './actionsTypes';

import {
	DB_FILES_CREATE,
	DB_FILES_IMPORT,
	DB_FILES_DELETE,
} from '../../../../db/files/actionsTypes';

const initialState = {
	isLeftBarCollapsed: false,
	isRightBarCollapsed: false,
	editorMode: 'edit',
	activeModal: 'none',
	aiSettingsOpen: false,
	/** @type {null | { pdfDocumentTitle: string }} */
	pendingBrowserSystemPrint: null,
};

export default function reducers(state = initialState, action = {}) {
	switch (action.type) {
		case UI_LAYOUT_APP_TOGGLE_LEFT_BAR: {
			return {
				...state,
				isLeftBarCollapsed: !state.isLeftBarCollapsed,
			};
		}
		case UI_LAYOUT_APP_TOGGLE_RIGHT_BAR: {
			return {
				...state,
				isRightBarCollapsed: !state.isRightBarCollapsed,
			};
		}
		case UI_LAYOUT_APP_SET_EDITOR_MODE: {
			const { mode } = action.payload;
			return {
				...state,
				editorMode: mode,
				...(mode !== 'print'
					? { pendingBrowserSystemPrint: null }
					: {}),
			};
		}
		case UI_LAYOUT_APP_REQUEST_BROWSER_SYSTEM_PRINT: {
			const { pdfDocumentTitle } = action.payload;
			return {
				...state,
				pendingBrowserSystemPrint: { pdfDocumentTitle },
			};
		}
		case UI_LAYOUT_APP_CLEAR_BROWSER_SYSTEM_PRINT: {
			return {
				...state,
				pendingBrowserSystemPrint: null,
			};
		}
		case UI_LAYOUT_APP_SET_AI_SETTINGS_OPEN: {
			return {
				...state,
				aiSettingsOpen: Boolean(action.payload.open),
			};
		}
		case DB_FILES_DELETE:
		case DB_FILES_CREATE:
		case DB_FILES_IMPORT: {
			return {
				...state,
				editorMode: 'edit',
				pendingBrowserSystemPrint: null,
			};
		}
	}
	return state;
}
