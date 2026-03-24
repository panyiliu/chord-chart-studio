import { updateFile } from '../db/files/actions';
import { getSelectedId } from '../fileManager/_state/selectors';
import { getAiPrompts } from './aiPrompts/selectors';
import { getAllAiEngines, getSelectedAiEngine } from './aiEngines/selectors';
import {
	getPromptTemplateById,
	getSelectedImportTemplateId,
} from './aiPromptTemplates/selectors';
import {
	postOpenAiCompatibleChat,
	extractChatCompletionText,
	maskBearerForLog,
	resolveChatCompletionsUrl,
} from './aiEngines/openAiChat';
import extractJsonFromModelOutput from '../personalLibrary/ai/extractJsonFromModelOutput';
import renderImportSystemPrompt from '../personalLibrary/ai/renderImportSystemPrompt';
import validateAiMetadataInferenceJson from '../personalLibrary/ai/validateAiMetadataInferenceJson';

/**
 * @param {object} state
 * @returns {import('./aiEngines/reducers').AiEngine | null}
 */
function resolveMetadataEngine(state) {
	const { metadataInferenceEngineId } = getAiPrompts(state);
	const id = (metadataInferenceEngineId || '').trim();
	if (id) {
		return getAllAiEngines(state).find((e) => e.id === id) ?? null;
	}
	return getSelectedAiEngine(state);
}

/**
 * @param {object} state
 * @param {string} excerpt
 * @returns {{ catalog: object, messages: { role: string, content: string }[] }}
 */
function buildMetadataMessages(state, excerpt) {
	const prompts = getAiPrompts(state);
	const metadataTemplateId = (
		prompts.metadataInferenceTemplateId || ''
	).trim();
	const fallbackTemplateId = getSelectedImportTemplateId(state) || '';
	const resolvedTemplateId = metadataTemplateId || fallbackTemplateId;
	const templateById = resolvedTemplateId
		? getPromptTemplateById(state, resolvedTemplateId)
		: null;
	const template = String(templateById?.content || '').trim();
	if (!template) {
		throw new Error(
			'请先在「设置 → 提示词模板 → AI 引擎」为「曲库元数据」选择一个有效模板'
		);
	}

	const catalog = state.db.catalog;
	const systemCore = renderImportSystemPrompt(template, catalog, {
		catalogInjectionBlockTemplate: prompts.catalogInjectionBlockTemplate,
		allowedGenresBlockTemplate: prompts.allowedGenresBlockTemplate,
		allowedTagsBlockTemplate: prompts.allowedTagsBlockTemplate,
		authorBindingBlockTemplate: prompts.authorBindingBlockTemplate,
	});
	const append = (prompts.metadataInferencePromptAppend || '').trim();
	const userPreamble = (prompts.metadataInferenceUserPreamble || '').trim();
	const runtimeAppend = (
		prompts.metadataInferenceRuntimePromptAppend || ''
	).trim();
	const excerptLineCount =
		typeof excerpt === 'string' ? excerpt.split(/\r?\n/).length : 0;

	const system = [systemCore, append, runtimeAppend]
		.filter(Boolean)
		.join('\n\n');

	const user = [
		`以下为当前编辑区摘录（至多前 ${excerptLineCount} 行）`,
		'',
		userPreamble,
		'',
		'---',
		'',
		(typeof excerpt === 'string' ? excerpt : '').trim() || '（空）',
	]
		.filter((x, i, arr) => {
			if (x !== '') return true;
			return !(arr[i - 1] === '' || i === arr.length - 1);
		})
		.join('\n');

	const messages = [
		{ role: 'system', content: system },
		{ role: 'user', content: user },
	];

	return {
		catalog,
		messages,
		templateMeta: {
			resolvedTemplateId,
			resolvedTemplateName: templateById?.name || '',
			metadataTemplateId,
			fallbackTemplateId,
		},
	};
}

/**
 * @param {import('./aiEngines/reducers').AiEngine} engine
 * @param {{ role: string, content: string }[]} messages
 * @param {(e: object) => void} [onLog]
 */
async function fetchMetadataJsonFromModel(engine, messages, onLog) {
	const apiBase = engine.baseUrl || 'https://api.openai.com/v1';
	const requestUrl = resolveChatCompletionsUrl(apiBase);
	const requestBodyPreview = {
		model: engine.model,
		messages,
		temperature: 0.2,
	};

	onLog?.({
		type: 'phase',
		message: '正在请求 Chat Completions（曲库元数据）…',
	});
	onLog?.({
		type: 'request',
		url: requestUrl,
		headers: {
			'Content-Type': 'application/json',
			Authorization: maskBearerForLog(engine.apiKey || ''),
		},
		requestBody: requestBodyPreview,
	});

	let postResult;
	try {
		postResult = await postOpenAiCompatibleChat({
			baseUrl: apiBase,
			apiKey: engine.apiKey || '',
			model: engine.model,
			messages,
			timeoutMs: 90000,
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw new Error(`请求失败: ${msg}`);
	}

	const { res, raw, parsed } = postResult;

	onLog?.({
		type: 'response',
		status: res.status,
		statusText: res.statusText,
		ok: res.ok,
		responseRaw: raw,
		responseParsed: parsed,
	});

	if (!res.ok) {
		throw new Error(
			`HTTP ${postResult.res.status}: ${(postResult.raw || '').slice(0, 400)}`
		);
	}

	const text = extractChatCompletionText(parsed);
	onLog?.({
		type: 'assistant',
		message: '模型返回的 assistant 正文（解析 JSON 前）',
		preview: (text || '').slice(0, 8000),
	});

	const json = extractJsonFromModelOutput(text);
	if (!json) {
		onLog?.({
			type: 'parse',
			message: '无法从模型输出解析 JSON',
			assistantPreview: (text || '').slice(0, 2000),
		});
		throw new Error(
			`无法从模型输出解析 JSON。原始片段：${(text || '').slice(0, 500)}`
		);
	}

	onLog?.({
		type: 'json',
		message: 'extractJsonFromModelOutput 得到的对象',
		parsedJson: json,
	});

	return json;
}

/**
 * 用编辑区摘录请求 AI，解析 JSON 后写入指定曲目（与当前选中项解耦，避免切歌后写错文件）。
 * @param {string} excerpt - 应用会截取若干行
 * @param {{
 *   fileId?: string,
 *   onLog?: (entry: object) => void,
 * }} [options] - 务必传入发起识别时的 fileId，与 excerpt 同源
 * @returns {import('redux-thunk').ThunkAction<Promise<void>, any, any, any>}
 */
export function inferFileMetadataFromAi(excerpt, options) {
	const onLog =
		options && typeof options.onLog === 'function' ? options.onLog : null;
	const fileIdFromOptions =
		options &&
		options.fileId != null &&
		String(options.fileId).trim() !== ''
			? String(options.fileId).trim()
			: null;

	return async (dispatch, getState) => {
		const push = (entry) => {
			onLog?.({ ...entry, at: Date.now() });
		};

		try {
			const state = getState();
			const fileId = fileIdFromOptions || getSelectedId(state);
			if (!fileId) {
				throw new Error('请先选中一首曲目');
			}

			const engine = resolveMetadataEngine(state);
			if (!engine) {
				throw new Error(
					'请先在「设置 → AI引擎」主分页中添加并选择推理引擎（或在「设置 → 提示词模板 → AI引擎」的曲库元数据行指定专用引擎）'
				);
			}

			push({
				type: 'phase',
				message: `开始曲库元数据推断 · fileId=${fileId} · engine=${engine.id} · model=${engine.model}`,
			});

			const { catalog, messages, templateMeta } = buildMetadataMessages(
				state,
				excerpt
			);
			push({
				type: 'phase',
				message: `模板解析：metadataTemplateId=${templateMeta.metadataTemplateId || '(空)'} · fallbackImportTemplateId=${templateMeta.fallbackTemplateId || '(空)'} · resolved=${templateMeta.resolvedTemplateId || '(空)'} ${templateMeta.resolvedTemplateName ? `(${templateMeta.resolvedTemplateName})` : ''}`,
			});

			const json = await fetchMetadataJsonFromModel(
				engine,
				messages,
				push
			);

			let patch;
			try {
				patch = validateAiMetadataInferenceJson(catalog, json);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				push({
					type: 'validate',
					message: msg,
					parsedJson: json,
				});
				throw e;
			}

			push({
				type: 'patch',
				message: `校验后的 patch（将写入曲目 fileId=${fileId}）`,
				patch,
			});

			if (Object.keys(patch).length === 0) {
				throw new Error('模型未返回可应用的元数据字段（或全部为空）');
			}

			push({ type: 'phase', message: 'dispatch updateFile…' });
			dispatch(updateFile(fileId, patch));
			push({
				type: 'success',
				message: `已写入元数据：${JSON.stringify(patch)}`,
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			push({ type: 'error', message: msg });
			throw e;
		}
	};
}
