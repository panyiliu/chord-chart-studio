import { createFile } from '../db/files/actions';
import { selectFile } from '../fileManager/_state/actions';
import validateAiSheetJson from '../personalLibrary/ai/validateAiSheetJson';
import renderImportSystemPrompt from '../personalLibrary/ai/renderImportSystemPrompt';
import extractJsonFromModelOutput from '../personalLibrary/ai/extractJsonFromModelOutput';
import { wrapPlainChordMarkAsSheetJson } from '../personalLibrary/ai/wrapPlainChordMarkAsSheetJson';
import { getAllAiEngines, getSelectedAiEngine } from './aiEngines/selectors';
import { getAiPrompts } from './aiPrompts/selectors';
import {
	getPromptTemplateById,
	getSelectedImportPromptTemplate,
} from './aiPromptTemplates/selectors';
import {
	postOpenAiCompatibleChat,
	extractChatCompletionText,
	maskBearerForLog,
	resolveChatCompletionsUrl,
} from './aiEngines/openAiChat';

/**
 * 调用 AI 引擎将原始文本解析为 ChordMark 并新建文件。
 * @param {string} rawText
 * @param {string} [engineId] - 若传入则使用该引擎，否则用当前选中引擎
 * @param {string} [importTemplateId] - 提示词模板 id；不传则用当前选中的导入模板
 * @param {{ onImportLog?: (entry: object) => void }} [options] - 可选：实时回调运行日志（请求/响应）
 */
export function importChordSheetFromAi(
	rawText,
	engineId,
	importTemplateId,
	options
) {
	const onImportLog =
		options && typeof options.onImportLog === 'function'
			? options.onImportLog
			: null;

	return async (dispatch, getState) => {
		const state = getState();
		let engine =
			typeof engineId === 'string' && engineId.trim()
				? getAllAiEngines(state).find((e) => e.id === engineId) ?? null
				: getSelectedAiEngine(state);
		if (!engine) {
			throw new Error('请先在「设置 → AI引擎」中添加并选择引擎');
		}
		const catalog = state.db.catalog;
		const { systemPromptAppend, importUserPromptPreamble } =
			getAiPrompts(state);
		const promptConfig = getAiPrompts(state);
		const tid =
			typeof importTemplateId === 'string' && importTemplateId.trim()
				? importTemplateId.trim()
				: null;
		const tmpl =
			(tid ? getPromptTemplateById(state, tid) : null) ||
			getSelectedImportPromptTemplate(state);
		if (!tmpl || !tmpl.content) {
			throw new Error('请先在「设置 → 提示词模板」中配置提示词模板');
		}
		const system = [
			renderImportSystemPrompt(tmpl.content, catalog, {
				catalogInjectionBlockTemplate:
					promptConfig.catalogInjectionBlockTemplate,
				allowedGenresBlockTemplate:
					promptConfig.allowedGenresBlockTemplate,
				allowedTagsBlockTemplate: promptConfig.allowedTagsBlockTemplate,
				authorBindingBlockTemplate:
					promptConfig.authorBindingBlockTemplate,
			}),
			(systemPromptAppend || '').trim(),
		]
			.filter(Boolean)
			.join('\n\n');
		const user = [
			'以下为待整理内容。',
			'',
			(importUserPromptPreamble || '').trim(),
			'',
			'--- 用户内容 ---',
			'',
			rawText,
		].join('\n');
		const messages = [
			{ role: 'system', content: system },
			{ role: 'user', content: user },
		];

		const apiBase = engine.baseUrl || 'https://api.openai.com/v1';
		const requestUrl = resolveChatCompletionsUrl(apiBase);
		const requestBodyPreview = {
			model: engine.model,
			messages,
			temperature: 0.2,
		};

		onImportLog?.({
			type: 'phase',
			message: '正在请求 Chat Completions…',
		});

		onImportLog?.({
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
				timeoutMs: 120000,
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			onImportLog?.({ type: 'error', message: msg });
			throw e;
		}

		const { res, raw, parsed } = postResult;

		onImportLog?.({
			type: 'response',
			status: res.status,
			statusText: res.statusText,
			ok: res.ok,
			responseRaw: raw,
			responseParsed: parsed,
		});

		if (!res.ok) {
			const errMsg =
				parsed?.error?.message ||
				parsed?.message ||
				(typeof parsed?.error === 'string' ? parsed.error : '') ||
				raw.slice(0, 400);
			throw new Error(`${res.status} ${errMsg}`);
		}
		if (!parsed) {
			throw new Error(`接口返回非 JSON：${raw.slice(0, 240)}`);
		}

		const content = extractChatCompletionText(parsed);
		let json = extractJsonFromModelOutput(content);
		if (!json || typeof json !== 'object') {
			const wrapped = wrapPlainChordMarkAsSheetJson(
				catalog,
				rawText,
				content || ''
			);
			if (wrapped) {
				onImportLog?.({
					type: 'phase',
					message:
						'模型仅返回 ChordMark 正文，已按曲库默认类型/作者规则自动包成 JSON；请在侧栏核对元数据。',
				});
				json = wrapped;
			}
		}
		if (!json || typeof json !== 'object') {
			onImportLog?.({
				type: 'parse',
				message: '模型返回正文中未能解析出 JSON 对象',
				assistantPreview: (content || '').slice(0, 2000),
			});
			throw new Error('模型未返回可解析的 JSON');
		}
		let validated;
		try {
			validated = validateAiSheetJson(catalog, json);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			onImportLog?.({
				type: 'validate',
				message: msg,
				parsedJson: json,
			});
			throw e;
		}

		onImportLog?.({
			type: 'success',
			message: `已生成曲目：${validated.title}`,
		});
		const action = createFile(validated.title, validated.chordMark, {
			author: validated.author,
			genreId: validated.genreId,
			tagIds: validated.tagIds,
		});
		dispatch(action);
		dispatch(selectFile(action.payload.id));
	};
}
