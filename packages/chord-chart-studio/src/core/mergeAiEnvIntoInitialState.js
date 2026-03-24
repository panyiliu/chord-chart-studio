import { v4 as uuidv4 } from 'uuid';

/**
 * 开发时：若 Vite 环境变量中配置了默认 AI，且当前尚无引擎，则注入一条并选中。
 * 仅在 import.meta.env.DEV 下生效，避免生产构建误用。
 * @param {object} state
 * @returns {object}
 */
export default function mergeAiEnvIntoInitialState(state) {
	const isViteDev =
		typeof import.meta !== 'undefined' &&
		import.meta.env &&
		import.meta.env.DEV === true;

	if (!isViteDev || !state?.integrations?.aiEngines) {
		return state;
	}

	const engines = state.integrations.aiEngines.engines;
	if (Array.isArray(engines) && engines.length > 0) {
		return state;
	}

	const apiKey = (import.meta.env.VITE_AI_DEFAULT_API_KEY || '').trim();
	const model = (import.meta.env.VITE_AI_DEFAULT_MODEL || '').trim();
	if (!apiKey || !model) {
		return state;
	}

	const name = (import.meta.env.VITE_AI_DEFAULT_NAME || 'Env default').trim();
	const base =
		(import.meta.env.VITE_AI_DEFAULT_BASE_URL || '').trim() || undefined;
	const id = `env_${uuidv4()}`;

	return {
		...state,
		integrations: {
			...state.integrations,
			aiEngines: {
				engines: [
					{
						id,
						name,
						provider: 'openai-compatible',
						model,
						baseUrl: base,
						apiKey,
					},
				],
				selectedEngineId: id,
			},
		},
	};
}
