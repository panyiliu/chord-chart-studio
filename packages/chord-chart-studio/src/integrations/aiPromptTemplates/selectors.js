import { TMPL_IMPORT_FROM_FILE_ID, TMPL_IMPORT_FROM_URL_ID } from './seed';

/** @param {object} state */
export const getAiPromptTemplatesState = (state) =>
	state.integrations.aiPromptTemplates;

/** @param {object} state */
export const getPromptTemplates = (state) =>
	getAiPromptTemplatesState(state).templates;

/** @param {object} state */
export const getSelectedImportTemplateId = (state) =>
	getAiPromptTemplatesState(state).selectedImportTemplateId;

/** @param {object} state */
export const getSelectedUrlImportTemplateId = (state) =>
	getAiPromptTemplatesState(state).selectedUrlImportTemplateId ??
	TMPL_IMPORT_FROM_URL_ID;

/** @param {object} state */
export const getSelectedFileImportTemplateId = (state) =>
	getAiPromptTemplatesState(state).selectedFileImportTemplateId ??
	TMPL_IMPORT_FROM_FILE_ID;

/**
 * @param {object} state
 * @param {string} [id]
 */
export const getPromptTemplateById = (state, id) => {
	const templates = getPromptTemplates(state);
	if (!id) {
		return null;
	}
	return templates.find((t) => t.id === id) ?? null;
};

/**
 * @param {object} state
 */
export const getSelectedImportPromptTemplate = (state) => {
	const id = getSelectedImportTemplateId(state);
	const t = id ? getPromptTemplateById(state, id) : null;
	if (t) {
		return t;
	}
	const list = getPromptTemplates(state);
	return list[0] ?? null;
};
