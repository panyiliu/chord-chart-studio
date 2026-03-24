import createAction from '../../core/createAction';
import * as actionTypes from './actionsTypes';

/** @param {Record<string, unknown>} patch */
export const setAiPrompts = (patch) =>
	createAction(actionTypes.AI_PROMPTS_SET, { patch });
