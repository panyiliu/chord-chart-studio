import * as actionTypes from './actionsTypes';

/**
 * @typedef {Object} AiEngine
 * @property {string} id
 * @property {string} name - 列表中显示名称
 * @property {string} provider - 自由标识，如 openai | anthropic | openai-compatible
 * @property {string} [baseUrl] - 兼容 OpenAI API 时可填
 * @property {string} model
 * @property {string} [apiKey] - 个人本地使用；仍建议勿提交仓库
 */

const initialState = {
	engines: /** @type {AiEngine[]} */ ([]),
	selectedEngineId: /** @type {string | null} */ (null),
};

export default (state = initialState, action = {}) => {
	switch (action.type) {
		case actionTypes.AI_ENGINES_SET_ALL: {
			const { engines } = action.payload;
			return {
				...state,
				engines: Array.isArray(engines)
					? engines.map((e) => ({ ...e }))
					: [],
			};
		}
		case actionTypes.AI_ENGINES_ADD: {
			const { engine } = action.payload;
			if (!engine?.id) return state;
			if (state.engines.some((e) => e.id === engine.id)) return state;
			return {
				...state,
				engines: [...state.engines, { ...engine }],
			};
		}
		case actionTypes.AI_ENGINES_UPDATE: {
			const { id, patch } = action.payload;
			return {
				...state,
				engines: state.engines.map((e) =>
					e.id === id ? { ...e, ...patch } : e
				),
			};
		}
		case actionTypes.AI_ENGINES_REMOVE: {
			const { id } = action.payload;
			const nextEngines = state.engines.filter((e) => e.id !== id);
			return {
				...state,
				engines: nextEngines,
				selectedEngineId:
					state.selectedEngineId === id
						? nextEngines[0]?.id ?? null
						: state.selectedEngineId,
			};
		}
		case actionTypes.AI_ENGINES_SELECT: {
			const { id } = action.payload;
			if (id !== null && !state.engines.some((e) => e.id === id)) {
				return state;
			}
			return {
				...state,
				selectedEngineId: id,
			};
		}
		default:
			return state;
	}
};
