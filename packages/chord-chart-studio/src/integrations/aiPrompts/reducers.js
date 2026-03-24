import * as actionTypes from './actionsTypes';
import seed from './seed';

/** @typedef {typeof seed} AiPromptsState */

const initialState = seed;

export default (state = initialState, action = {}) => {
	switch (action.type) {
		case actionTypes.AI_PROMPTS_SET: {
			const { patch } = action.payload;
			return { ...state, ...patch };
		}
		default:
			return state;
	}
};
