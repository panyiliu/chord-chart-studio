export const isLeftBarCollapsed = (state) =>
	state.ui.layout.app.isLeftBarCollapsed;

export const isRightBarCollapsed = (state) =>
	state.ui.layout.app.isRightBarCollapsed;

export const getEditorMode = (state) => state.ui.layout.app.editorMode;

export const isAiSettingsOpen = (state) =>
	Boolean(state.ui.layout.app.aiSettingsOpen);

export const getPendingBrowserSystemPrint = (state) =>
	state.ui.layout.app.pendingBrowserSystemPrint ?? null;
