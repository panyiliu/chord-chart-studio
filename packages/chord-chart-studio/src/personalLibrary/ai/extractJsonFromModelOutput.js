/**
 * 从模型输出中解析 JSON 对象（支持 ```json 围栏）。
 * @param {string} text
 * @returns {object | null}
 */
export default function extractJsonFromModelOutput(text) {
	if (!text || typeof text !== 'string') {
		return null;
	}
	const t = text.trim();
	const fence = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(t);
	const inner = fence ? fence[1].trim() : t;
	const m = /\{[\s\S]*\}/.exec(inner);
	if (!m) {
		return null;
	}
	try {
		return JSON.parse(m[0]);
	} catch {
		return null;
	}
}
