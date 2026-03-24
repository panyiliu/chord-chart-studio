/**
 * OpenAI 兼容 Chat Completions（浏览器 fetch）。
 * baseUrl 示例：https://api.openai.com/v1
 * 或完整 endpoint（须含路径 …/chat/completions），例如火山方舟 Chat Completions：
 * https://ark.cn-beijing.volces.com/api/v3/chat/completions
 * （不要使用文档中的 /responses 端点：请求体字段不同，本应用仅支持 OpenAI 兼容的 messages。）
 */

/**
 * @param {string} [baseUrl]
 * @returns {string}
 */
export function resolveChatCompletionsUrl(baseUrl) {
	const b = (baseUrl || '').trim().replace(/\/+$/, '');
	if (!b) {
		return 'https://api.openai.com/v1/chat/completions';
	}
	if (/\/chat\/completions/i.test(b)) {
		return b;
	}
	/* 火山方舟等：只填到 …/api/v3 时应补 /chat/completions，不能补 /v1/chat/completions */
	if (/\/api\/v\d+$/i.test(b)) {
		return `${b}/chat/completions`;
	}
	/*
	 * 文档里的 Responses API（/responses + input 数组）与本应用不兼容；
	 * 若用户误填，自动改为同前缀下的 Chat Completions。
	 */
	if (/\/responses$/i.test(b)) {
		return b.replace(/\/responses$/i, '/chat/completions');
	}
	if (/\/v1$/i.test(b)) {
		return `${b}/chat/completions`;
	}
	return `${b}/v1/chat/completions`;
}

/**
 * @param {unknown} json
 * @returns {string}
 */
export function extractChatCompletionText(json) {
	const c = json?.choices?.[0]?.message?.content;
	return typeof c === 'string' ? c : '';
}

/**
 * @param {{
 *   baseUrl?: string,
 *   apiKey: string,
 *   model: string,
 *   messages: { role: string, content: string }[],
 *   timeoutMs?: number,
 * }} opts
 * @returns {Promise<{
 *   url: string,
 *   requestBody: { model: string, messages: unknown[], temperature: number },
 *   res: Response,
 *   raw: string,
 *   parsed: object | null,
 * }>}
 */
/** 用于日志展示，不泄露完整 API Key */
export function maskBearerForLog(apiKey) {
	const k = (apiKey || '').trim();
	if (!k) {
		return '(未配置)';
	}
	if (k.length <= 6) {
		return 'Bearer ****';
	}
	return `Bearer ****${k.slice(-4)}`;
}

export async function postOpenAiCompatibleChat(opts) {
	const { baseUrl, apiKey, model, messages, timeoutMs = 90000 } = opts;
	if (!apiKey || !String(apiKey).trim()) {
		throw new Error('API Key 未配置');
	}
	if (!model || !String(model).trim()) {
		throw new Error('模型名称未配置');
	}
	const url = resolveChatCompletionsUrl(baseUrl);
	const requestBody = { model, messages, temperature: 0.2 };
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(requestBody),
			signal: controller.signal,
		});
		const raw = await res.text();
		let parsed = null;
		try {
			parsed = JSON.parse(raw);
		} catch {
			// leave null
		}
		return { url, requestBody, res, raw, parsed };
	} finally {
		clearTimeout(timer);
	}
}

/**
 * @param {{
 *   baseUrl?: string,
 *   apiKey: string,
 *   model: string,
 *   messages: { role: string, content: string }[],
 *   timeoutMs?: number,
 * }} opts
 * @returns {Promise<string>} assistant 文本
 */
export async function callOpenAiCompatibleChat({
	baseUrl,
	apiKey,
	model,
	messages,
	timeoutMs = 90000,
}) {
	try {
		const { res, raw, parsed } = await postOpenAiCompatibleChat({
			baseUrl,
			apiKey,
			model,
			messages,
			timeoutMs,
		});
		if (!res.ok) {
			const msg =
				parsed?.error?.message ||
				parsed?.message ||
				(typeof parsed?.error === 'string' ? parsed.error : '') ||
				raw.slice(0, 300);
			throw new Error(`${res.status} ${msg}`);
		}
		if (!parsed) {
			throw new Error(`接口返回非 JSON：${raw.slice(0, 240)}`);
		}
		return extractChatCompletionText(parsed);
	} catch (e) {
		if (e && e.name === 'AbortError') {
			throw new Error('请求超时');
		}
		if (e instanceof TypeError && String(e.message).includes('fetch')) {
			throw new Error(
				'网络请求失败（浏览器常因 CORS 拦截直连 API：请使用网关/代理或允许跨域的兼容端点）'
			);
		}
		throw e;
	}
}

/**
 * 连通性测试：单条 user 消息；返回请求 URL、请求体、HTTP 状态与完整响应，便于排查。
 * @param {{ baseUrl?: string, apiKey?: string, model: string }} engine
 * @param {string} userMessage
 * @returns {Promise<{
 *   ok: boolean,
 *   networkError?: boolean,
 *   message?: string,
 *   status?: number,
 *   statusText?: string,
 *   requestUrl: string,
 *   requestBody: { model: string, messages: { role: string, content: string }[], temperature: number },
 *   responseRaw: string,
 *   responseParsed: object | null,
 *   assistantText: string,
 *   errorLine?: string | null,
 * }>}
 */
export async function testOpenAiEngineConnectionDetailed(engine, userMessage) {
	const userMsg =
		userMessage && userMessage.trim()
			? userMessage.trim()
			: 'Reply with OK.';
	const requestBodyPreview = {
		model: engine.model,
		messages: [{ role: 'user', content: userMsg }],
		temperature: 0.2,
	};
	const base = (engine.baseUrl || '').trim() || 'https://api.openai.com/v1';

	try {
		const { url, requestBody, res, raw, parsed } =
			await postOpenAiCompatibleChat({
				baseUrl: base,
				apiKey: engine.apiKey || '',
				model: engine.model,
				messages: [{ role: 'user', content: userMsg }],
				timeoutMs: 45000,
			});
		const assistantText = parsed ? extractChatCompletionText(parsed) : '';
		const errorLine = !res.ok
			? parsed?.error?.message ||
				parsed?.message ||
				(typeof parsed?.error === 'string' ? parsed.error : '') ||
				raw.slice(0, 400)
			: null;
		return {
			ok: res.ok,
			status: res.status,
			statusText: res.statusText,
			requestUrl: url,
			requestBody,
			responseRaw: raw,
			responseParsed: parsed,
			assistantText,
			errorLine,
		};
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		if (e && e.name === 'AbortError') {
			return {
				ok: false,
				networkError: true,
				message: '请求超时',
				requestUrl: resolveChatCompletionsUrl(base),
				requestBody: requestBodyPreview,
				responseRaw: '',
				responseParsed: null,
				assistantText: '',
				errorLine: null,
			};
		}
		if (e instanceof TypeError && String(e.message).includes('fetch')) {
			return {
				ok: false,
				networkError: true,
				message:
					'网络请求失败（浏览器常因 CORS 拦截直连 API：请使用网关/代理或允许跨域的兼容端点）',
				requestUrl: resolveChatCompletionsUrl(base),
				requestBody: requestBodyPreview,
				responseRaw: '',
				responseParsed: null,
				assistantText: '',
				errorLine: null,
			};
		}
		return {
			ok: false,
			networkError: true,
			message: msg,
			requestUrl: resolveChatCompletionsUrl(base),
			requestBody: requestBodyPreview,
			responseRaw: '',
			responseParsed: null,
			assistantText: '',
			errorLine: null,
		};
	}
}

/**
 * 连通性测试：单条 user 消息。
 * @param {{ baseUrl?: string, apiKey?: string, model: string }} engine
 * @param {string} userMessage
 */
export async function testOpenAiEngineConnection(engine, userMessage) {
	const d = await testOpenAiEngineConnectionDetailed(engine, userMessage);
	if (d.networkError) {
		throw new Error(d.message || '请求失败');
	}
	if (!d.ok) {
		throw new Error(`${d.status} ${d.errorLine || '请求失败'}`);
	}
	return d.assistantText;
}
