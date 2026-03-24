/**
 * AI「元数据识别」返回的 JSON 校验与归一化。
 * 键名集合可随文件模型扩展：新增键时在此实现解析逻辑，未知键忽略。
 */

/** 当前支持的顶层字段（与 db/files 可更新字段对齐） */
export const METADATA_INFERENCE_KEYS = Object.freeze([
	'title',
	'author',
	'authorId',
	'genreId',
	'tagIds',
]);

/** 模型可能用 songTitle / name 等别名；按顺序取第一个可用非空值 */
const TITLE_ALIAS_KEYS = Object.freeze([
	'title',
	'songTitle',
	'song_title',
	'songName',
	'name',
]);

/**
 * @param {Record<string, unknown>} o
 * @returns {string | null}
 */
function pickTitle(o) {
	for (const k of TITLE_ALIAS_KEYS) {
		if (!(k in o) || o[k] === undefined || o[k] === null) {
			continue;
		}
		const v = o[k];
		let s;
		if (typeof v === 'string') {
			s = v;
		} else if (typeof v === 'number' || typeof v === 'boolean') {
			s = String(v);
		} else {
			continue;
		}
		const t = s.trim();
		if (t) {
			return t;
		}
	}
	return null;
}

/**
 * @param {Record<string, unknown>} o
 * @param {Record<string, unknown>} patch
 */
function applyTitle(o, patch) {
	const t = pickTitle(o);
	if (t) {
		patch.title = t;
	}
}

/**
 * @param {Parameters<typeof validateAiMetadataInferenceJson>[0]} catalog
 * @param {Record<string, unknown>} o
 * @param {Record<string, unknown>} patch
 */
function applyAuthorCatalogMode(catalog, o, patch) {
	if ('authorId' in o && o.authorId !== undefined && o.authorId !== null) {
		if (typeof o.authorId !== 'string' || !o.authorId) {
			throw new TypeError('authorId 必须为非空字符串');
		}
		const a = catalog.authors.find((x) => x.id === o.authorId);
		if (!a) {
			throw new TypeError(`authorId 不在允许列表中: ${o.authorId}`);
		}
		patch.author = a.name;
		return;
	}
	if ('author' in o && o.author !== undefined) {
		throw new TypeError(
			'当前设置为「仅从作者目录选择」，请输出 authorId，不要输出 author'
		);
	}
}

/**
 * @param {Record<string, unknown>} o
 * @param {Record<string, unknown>} patch
 */
function applyAuthorFreeMode(o, patch) {
	if ('author' in o && o.author !== undefined) {
		if (typeof o.author !== 'string') {
			throw new TypeError('author 必须是字符串');
		}
		patch.author = o.author;
	}
	if ('authorId' in o && o.authorId !== undefined) {
		throw new TypeError(
			'当前为自由文本作者模式，请输出 author，不要输出 authorId'
		);
	}
}

/**
 * @param {Parameters<typeof validateAiMetadataInferenceJson>[0]} catalog
 * @param {Record<string, unknown>} o
 * @param {Record<string, unknown>} patch
 */
function applyAuthor(catalog, o, patch) {
	if (catalog.authorsFromCatalogOnly && (catalog.authors || []).length) {
		applyAuthorCatalogMode(catalog, o, patch);
		return;
	}
	applyAuthorFreeMode(o, patch);
}

/**
 * @param {Set<string>} allowedGenres
 * @param {Record<string, unknown>} o
 * @param {Record<string, unknown>} patch
 */
function applyGenreId(allowedGenres, o, patch) {
	if (!('genreId' in o) || o.genreId === undefined) {
		return;
	}
	const g = o.genreId;
	if (g === null || g === '') {
		patch.genreId = null;
		return;
	}
	if (typeof g !== 'string') {
		throw new TypeError('genreId 必须为字符串、null 或空串');
	}
	if (!allowedGenres.has(g)) {
		throw new TypeError(`genreId 不在允许列表中: ${g}`);
	}
	patch.genreId = g;
}

/**
 * @param {Set<string>} allowedTags
 * @param {Record<string, unknown>} o
 * @param {Record<string, unknown>} patch
 */
function applyTagIds(allowedTags, o, patch) {
	if (!('tagIds' in o) || o.tagIds === undefined) {
		return;
	}
	if (!Array.isArray(o.tagIds)) {
		throw new TypeError('tagIds 必须是数组');
	}
	const ids = o.tagIds.map((t) => String(t));
	const bad = ids.filter((id) => !allowedTags.has(id));
	if (bad.length) {
		throw new TypeError(`tagIds 含未定义标签: ${bad.join(', ')}`);
	}
	patch.tagIds = ids;
}

/**
 * @param {{ genres: {id: string}[], tags: {id: string}[], authors: {id: string, name: string}[], authorsFromCatalogOnly: boolean }} catalog
 * @param {unknown} data
 * @returns {Partial<{ title: string, author: string, genreId: string | null, tagIds: string[] }>}
 */
export default function validateAiMetadataInferenceJson(catalog, data) {
	if (!data || typeof data !== 'object') {
		throw new TypeError('AI 输出必须是 JSON 对象');
	}

	const o = /** @type {Record<string, unknown>} */ (data);
	const patch = {};

	const allowedGenres = new Set((catalog.genres || []).map((g) => g.id));
	const allowedTags = new Set((catalog.tags || []).map((t) => t.id));

	applyTitle(o, patch);
	applyAuthor(catalog, o, patch);
	applyGenreId(allowedGenres, o, patch);
	applyTagIds(allowedTags, o, patch);

	return patch;
}
