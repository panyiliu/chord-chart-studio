import createAction from '../../core/createAction';
import * as actionTypes from './actionsTypes';

/** @param {Record<string, unknown>} patch */
export const setAiPromptTemplates = (patch) =>
	createAction(actionTypes.AI_PROMPT_TEMPLATES_SET, { patch });

/** @param {{ id: string, name: string, content: string, isBuiltIn?: boolean }} template */
export const addPromptTemplate = (template) =>
	createAction(actionTypes.AI_PROMPT_TEMPLATES_ADD, { template });

/** @param {string} id @param {Record<string, unknown>} patch */
export const updatePromptTemplate = (id, patch) =>
	createAction(actionTypes.AI_PROMPT_TEMPLATES_UPDATE, { id, patch });

/** @param {string} id */
export const removePromptTemplate = (id) =>
	createAction(actionTypes.AI_PROMPT_TEMPLATES_REMOVE, { id });

/** @param {string | null} id */
export const selectImportPromptTemplate = (id) =>
	createAction(actionTypes.AI_PROMPT_TEMPLATES_SELECT_IMPORT, { id });

/** @param {string | null} id */
export const selectUrlImportPromptTemplate = (id) =>
	createAction(actionTypes.AI_PROMPT_TEMPLATES_SELECT_IMPORT_URL, { id });

/** @param {string | null} id */
export const selectFileImportPromptTemplate = (id) =>
	createAction(actionTypes.AI_PROMPT_TEMPLATES_SELECT_IMPORT_FILE, { id });

/**
 * @param {string[]} ids Full template order, includes built-ins (长度必须等于 templates.length)
 */
export const reorderPromptTemplates = (ids) =>
	createAction(actionTypes.AI_PROMPT_TEMPLATES_REORDER, { ids });
