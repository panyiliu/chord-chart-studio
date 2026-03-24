/**
 * 作为 importChordSheetFromAi 的 rawText，与常规「粘贴」一样再被外层包装进 user 消息。
 * @param {string} sourceUrl
 * @param {string} pagePlainText
 * @returns {string}
 */
export default function buildUrlImportUserPayload(sourceUrl, pagePlainText) {
	const u = (sourceUrl || '').trim();
	const body = (pagePlainText || '').trim();
	return ['来源 URL:', u, '', '--- 页面正文（抓取或粘贴）---', '', body].join(
		'\n'
	);
}
