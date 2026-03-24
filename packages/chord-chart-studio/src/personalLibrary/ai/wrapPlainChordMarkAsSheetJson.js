/**
 * 部分模型会忽略 JSON 约定，只返回 ChordMark 正文。此处做保守检测并在可行时包成导入所需对象。
 * @param {string} text
 * @returns {boolean}
 */
export function looksLikePlainChordMark(text) {
	if (!text || typeof text !== 'string') {
		return false;
	}
	const t = text.trim();
	if (t.startsWith('{')) {
		return false;
	}
	if (t.length < 4) {
		return false;
	}
	const normalized = t.replace(/\\n/g, '\n');
	/* # 后至少一个「单词」字符（#v #c #chorus 等） */
	return /^#[\w-]+/m.test(normalized) || /\n#[\w-]+/m.test(normalized);
}

/**
 * @param {string} rawUserText
 * @param {string} chordMarkLines
 * @returns {string}
 */
function inferTitle(rawUserText, chordMarkLines) {
	const firstUser = (rawUserText || '')
		.trim()
		.split(/\r?\n/)
		.filter(Boolean)[0];
	if (firstUser && firstUser.length > 0 && firstUser.length < 100) {
		return firstUser;
	}
	const line = chordMarkLines
		.trim()
		.split(/\r?\n/)
		.find((l) => l.trim().length > 0);
	if (line && !/^#\w/.test(line.trim()) && line.length < 80) {
		return line.trim();
	}
	return '导入曲目';
}

/**
 * @param {{ genres: { id: string }[], authors?: { id: string }[], authorsFromCatalogOnly?: boolean }} catalog
 * @param {string} rawUserText
 * @param {string} assistantText
 * @returns {object | null}
 */
export function wrapPlainChordMarkAsSheetJson(
	catalog,
	rawUserText,
	assistantText
) {
	if (!looksLikePlainChordMark(assistantText)) {
		return null;
	}
	const genres = catalog.genres || [];
	if (!genres.length) {
		return null;
	}
	let chordMark = assistantText
		.trim()
		.replace(/\\n/g, '\n')
		.replace(/\\r\n?/g, '\n');
	const title = inferTitle(rawUserText, chordMark);
	const genreId = genres[0].id;
	/** @type {Record<string, unknown>} */
	const out = {
		title,
		chordMark,
		genreId,
		tagIds: [],
	};
	if (catalog.authorsFromCatalogOnly && catalog.authors.length) {
		out.authorId = catalog.authors[0].id;
	} else {
		out.author = '';
	}
	return out;
}
