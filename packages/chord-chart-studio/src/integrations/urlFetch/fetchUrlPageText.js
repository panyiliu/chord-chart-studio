/**
 * 浏览器直接 fetch 外站常因 CORS 失败；失败时由 UI 提示用户粘贴正文。
 * @param {string} urlString
 * @returns {Promise<string>}
 */
export async function fetchUrlPageText(urlString) {
	const url = new URL(urlString);
	if (!/^https?:$/i.test(url.protocol)) {
		throw new Error('仅支持 http / https URL');
	}
	const res = await fetch(url.href, {
		mode: 'cors',
		credentials: 'omit',
		redirect: 'follow',
	});
	if (!res.ok) {
		throw new Error(`页面请求失败：HTTP ${res.status}`);
	}
	const raw = await res.text();
	const ct = (res.headers.get('content-type') || '').toLowerCase();
	if (ct.includes('html')) {
		return htmlToPlainText(raw);
	}
	return raw.trim();
}

/**
 * @param {string} html
 * @returns {string}
 */
function htmlToPlainText(html) {
	if (typeof DOMParser === 'undefined') {
		return html
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}
	const doc = new DOMParser().parseFromString(html, 'text/html');
	doc.querySelectorAll('script, style, noscript, svg').forEach((el) => {
		el.remove();
	});
	const t = doc.body?.innerText || doc.documentElement?.textContent || '';
	return t.replace(/\n{3,}/g, '\n\n').trim();
}
