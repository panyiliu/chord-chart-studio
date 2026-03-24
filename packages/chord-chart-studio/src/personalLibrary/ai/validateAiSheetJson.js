import { parseSong } from 'chord-mark';

/**
 * @param {object} catalog — state.db.catalog
 * @param {unknown} data — JSON.parse 后的对象
 * @returns {{ title: string, author: string, genreId: string, tagIds: string[], chordMark: string }}
 */
export default function validateAiSheetJson(catalog, data) {
	if (!data || typeof data !== 'object') {
		throw new TypeError('AI 输出必须是 JSON 对象');
	}

	const { title, author, authorId, genreId, tagIds, chordMark } =
		/** @type {Record<string, unknown>} */ (data);

	if (typeof title !== 'string' || !title.trim()) {
		throw new TypeError('AI 输出缺少有效 title');
	}
	if (typeof chordMark !== 'string') {
		throw new TypeError('AI 输出缺少 chordMark 字符串');
	}

	const allowedGenres = new Set(catalog.genres.map((g) => g.id));
	if (!allowedGenres.has(genreId)) {
		throw new TypeError(`genreId 不在允许列表中: ${String(genreId)}`);
	}

	let normalizedTags = [];
	if (tagIds !== undefined) {
		if (!Array.isArray(tagIds)) {
			throw new TypeError('tagIds 必须是数组');
		}
		normalizedTags = tagIds.map((t) => String(t));
		const allowedTags = new Set(catalog.tags.map((t) => t.id));
		const bad = normalizedTags.filter((id) => !allowedTags.has(id));
		if (bad.length) {
			throw new TypeError(`tagIds 含未定义标签: ${bad.join(', ')}`);
		}
	}

	let resolvedAuthor = '';
	if (catalog.authorsFromCatalogOnly && catalog.authors.length) {
		if (typeof authorId !== 'string' || !authorId) {
			throw new TypeError('当前要求从作者目录选择，缺少 authorId');
		}
		const a = catalog.authors.find((x) => x.id === authorId);
		if (!a) {
			throw new TypeError(`authorId 不在允许列表中: ${authorId}`);
		}
		resolvedAuthor = a.name;
	} else {
		if (author !== undefined && typeof author !== 'string') {
			throw new TypeError('author 必须是字符串');
		}
		resolvedAuthor = typeof author === 'string' ? author : '';
	}

	try {
		parseSong(chordMark);
	} catch (e) {
		throw new TypeError(`chordMark 不是合法 ChordMark: ${e.message || e}`);
	}

	return {
		title: title.trim(),
		author: resolvedAuthor,
		genreId: /** @type {string} */ (genreId),
		tagIds: normalizedTags,
		chordMark,
	};
}
