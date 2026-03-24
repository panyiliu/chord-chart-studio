import aiPromptTemplatesSeed from '../integrations/aiPromptTemplates/seed';

/**
 * 仅补齐缺失的内置模板，不再覆盖用户已在前端修改过的 name/content。
 * @param {object} state
 * @returns {object}
 */
export default function applyBuiltInPromptTemplatesFromSeed(state) {
	const s = state?.integrations?.aiPromptTemplates;
	if (!s?.templates?.length) {
		return state;
	}
	const templates = s.templates;
	const existingIds = new Set(templates.map((t) => t.id));
	const missingBuiltIns = (aiPromptTemplatesSeed.templates || []).filter(
		(t) => t.isBuiltIn && !existingIds.has(t.id)
	);

	return {
		...state,
		integrations: {
			...state.integrations,
			aiPromptTemplates: {
				...s,
				templates: [...templates, ...missingBuiltIns],
			},
		},
	};
}
