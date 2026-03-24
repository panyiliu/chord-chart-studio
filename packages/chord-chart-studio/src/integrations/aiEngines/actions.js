import createAction from '../../core/createAction';
import * as actionTypes from './actionsTypes';

/** @param {import('./reducers').AiEngine[]} engines */
export const setAllAiEngines = (engines) =>
	createAction(actionTypes.AI_ENGINES_SET_ALL, { engines });

/** @param {import('./reducers').AiEngine} engine */
export const addAiEngine = (engine) =>
	createAction(actionTypes.AI_ENGINES_ADD, { engine });

/** @param {string} id @param {Partial<import('./reducers').AiEngine>} patch */
export const updateAiEngine = (id, patch) =>
	createAction(actionTypes.AI_ENGINES_UPDATE, { id, patch });

export const removeAiEngine = (id) =>
	createAction(actionTypes.AI_ENGINES_REMOVE, { id });

export const selectAiEngine = (id) =>
	createAction(actionTypes.AI_ENGINES_SELECT, { id });
