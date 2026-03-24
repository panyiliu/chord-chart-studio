import * as actionTypes from './actionsTypes';
import seed, {
	TMPL_IMPORT_FROM_FILE_ID,
	TMPL_IMPORT_FROM_URL_ID,
} from './seed';

/** @typedef {import('./seed').PromptTemplate} PromptTemplate */
/** @typedef {import('./seed').AiPromptTemplatesState} AiPromptTemplatesState */

const initialState = /** @type {AiPromptTemplatesState} */ ({ ...seed });

export default (state = initialState, action = {}) => {
	switch (action.type) {
		case actionTypes.AI_PROMPT_TEMPLATES_SET: {
			const { patch } = action.payload;
			return { ...state, ...patch };
		}
		case actionTypes.AI_PROMPT_TEMPLATES_ADD: {
			const { template } = action.payload;
			if (
				!template?.id ||
				state.templates.some((t) => t.id === template.id)
			) {
				return state;
			}
			return {
				...state,
				templates: [...state.templates, { ...template }],
			};
		}
		case actionTypes.AI_PROMPT_TEMPLATES_UPDATE: {
			const { id, patch } = action.payload;
			return {
				...state,
				templates: state.templates.map((t) =>
					t.id === id ? { ...t, ...patch } : t
				),
			};
		}
		case actionTypes.AI_PROMPT_TEMPLATES_REMOVE: {
			const { id } = action.payload;
			if (state.templates.length <= 1) {
				return state;
			}
			const t = state.templates.find((x) => x.id === id);
			if (t?.isBuiltIn) {
				return state;
			}
			const next = state.templates.filter((x) => x.id !== id);
			let selectedImportTemplateId = state.selectedImportTemplateId;
			if (selectedImportTemplateId === id) {
				selectedImportTemplateId = next[0]?.id ?? null;
			}
			let selectedUrlImportTemplateId = state.selectedUrlImportTemplateId;
			if (selectedUrlImportTemplateId === id) {
				selectedUrlImportTemplateId =
					next.find((x) => x.id === TMPL_IMPORT_FROM_URL_ID)?.id ??
					next[0]?.id ??
					null;
			}
			let selectedFileImportTemplateId =
				state.selectedFileImportTemplateId;
			if (selectedFileImportTemplateId === id) {
				selectedFileImportTemplateId =
					next.find((x) => x.id === TMPL_IMPORT_FROM_FILE_ID)?.id ??
					next[0]?.id ??
					null;
			}
			return {
				...state,
				templates: next,
				selectedImportTemplateId,
				selectedUrlImportTemplateId,
				selectedFileImportTemplateId,
			};
		}
		case actionTypes.AI_PROMPT_TEMPLATES_SELECT_IMPORT: {
			const { id } = action.payload;
			if (id !== null && !state.templates.some((t) => t.id === id)) {
				return state;
			}
			return {
				...state,
				selectedImportTemplateId: id,
			};
		}
		case actionTypes.AI_PROMPT_TEMPLATES_SELECT_IMPORT_URL: {
			const { id } = action.payload;
			if (id !== null && !state.templates.some((t) => t.id === id)) {
				return state;
			}
			return {
				...state,
				selectedUrlImportTemplateId: id,
			};
		}
		case actionTypes.AI_PROMPT_TEMPLATES_SELECT_IMPORT_FILE: {
			const { id } = action.payload;
			if (id !== null && !state.templates.some((t) => t.id === id)) {
				return state;
			}
			return {
				...state,
				selectedFileImportTemplateId: id,
			};
		}
		case actionTypes.AI_PROMPT_TEMPLATES_REORDER: {
			const { ids } = action.payload;
			if (!Array.isArray(ids) || ids.length !== state.templates.length) {
				return state;
			}
			const idSet = new Set(ids);
			if (idSet.size !== ids.length) {
				return state;
			}
			const currentIdSet = new Set(state.templates.map((t) => t.id));
			if (currentIdSet.size !== idSet.size) {
				return state;
			}
			for (const id of idSet) {
				if (!currentIdSet.has(id)) {
					return state;
				}
			}
			const byId = new Map(state.templates.map((t) => [t.id, t]));
			const nextTemplates = ids.map((id) => byId.get(id)).filter(Boolean);
			if (nextTemplates.length !== state.templates.length) {
				return state;
			}
			return {
				...state,
				templates: nextTemplates,
			};
		}
		default:
			return state;
	}
};
