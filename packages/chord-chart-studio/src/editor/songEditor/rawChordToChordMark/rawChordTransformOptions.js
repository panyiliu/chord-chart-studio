/**
 * 原始和弦稿 → ChordMark 的**可编辑选项**（项目内维护）。
 * 推荐在「设置 → ChordMark整理」中可视化编辑；也可在控制台设置：
 *   localStorage.setItem('chordStudio.rawChordTransformOptions', JSON.stringify({ sectionMapping: { ... } }))
 * 并刷新页面（会合并到下方默认映射上）。
 */
export const RAW_CHORD_TRANSFORM_OPTIONS_STORAGE_KEY =
	'chordStudio.rawChordTransformOptions';
export const RAW_CHORD_TRANSFORM_FULL_CODE_STORAGE_KEY =
	'chordStudio.rawChordTransformFullCode';
export const RAW_CHORD_TRANSFORM_CODE_TEMPLATES_STORAGE_KEY =
	'chordStudio.rawChordTransformCodeTemplates';
export const RAW_CHORD_TRANSFORM_ACTIVE_TEMPLATE_ID_STORAGE_KEY =
	'chordStudio.rawChordTransformActiveTemplateId';

/** @type {Record<string, string>} 英文片段（小写匹配）→ ChordMark 段落标记 */
export const DEFAULT_SECTION_MAPPING = {
	intro: '#i',
	verse: '#v',
	'pre-chorus': '#p',
	chorus: '#c',
	bridge: '#b',
	instrumental: '#solo',
};
export const DEFAULT_TRIM_AFTER_KEYWORDS = ['Last update:', 'Rating'];
export const DEFAULT_TRIM_RULES = DEFAULT_TRIM_AFTER_KEYWORDS.map(
	(keyword) => ({
		keyword,
		position: 'after',
		includeMatchedLine: true,
	})
);
export const DEFAULT_TRIM_RULE_MATCH_MODE = 'or';

/** 接在歌手名前；可含冒号、空格或中文，例如「Artist: 」「Artist 」「歌手：」 */
export const DEFAULT_ARTIST_LINE_PREFIX = 'Artist: ';
/** 和弦落点写入歌词时，是否在对应位置插入标记字符（默认 `_`）。 */
export const DEFAULT_LYRIC_CHORD_MARKER_ENABLED = true;
export const DEFAULT_LYRIC_CHORD_MARKER = '_';

function readStoredOptions() {
	if (typeof localStorage === 'undefined') {
		return null;
	}
	try {
		const raw = localStorage.getItem(
			RAW_CHORD_TRANSFORM_OPTIONS_STORAGE_KEY
		);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

/**
 * trimRules[].keyword：可多行（连续行依次匹配）；单行里也可用字面量 \\n 表示换行。
 * 多行 + after：不包含命中行则从块尾下一行删起；包含命中行则从块首删起。
 * 多行 + before：不包含命中行则删到块首前；包含命中行则删到块尾（整块去掉）。
 *
 * @returns {{
 *   sectionMapping: Record<string, string>,
 *   trimAfterKeywords: string[],
 *   trimRules: { keyword: string, position: 'before' | 'after', includeMatchedLine?: boolean }[],
 *   trimRuleMatchMode: 'or' | 'and',
 *   artistLinePrefix: string,
 *   lyricChordMarkerEnabled: boolean,
 *   lyricChordMarker: string,
 * }}
 */
export function getRawChordTransformOptions() {
	const stored = readStoredOptions();
	const sectionMapping = {
		...DEFAULT_SECTION_MAPPING,
		...(stored && typeof stored.sectionMapping === 'object'
			? stored.sectionMapping
			: {}),
	};
	const trimAfterKeywords = Array.isArray(stored?.trimAfterKeywords)
		? stored.trimAfterKeywords
				.map((x) => String(x || '').trim())
				.filter(Boolean)
		: [...DEFAULT_TRIM_AFTER_KEYWORDS];
	const trimRulesFromStored = Array.isArray(stored?.trimRules)
		? stored.trimRules
				.map((x) => ({
					keyword: String(x?.keyword || '').trim(),
					position: x?.position === 'before' ? 'before' : 'after',
					includeMatchedLine: x?.includeMatchedLine !== false,
				}))
				.filter((x) => x.keyword)
		: [];
	const trimRules = trimRulesFromStored.length
		? trimRulesFromStored
		: trimAfterKeywords.map((keyword) => ({
				keyword,
				position: 'after',
				includeMatchedLine: true,
			}));
	const trimRuleMatchMode =
		stored?.trimRuleMatchMode === 'and'
			? 'and'
			: DEFAULT_TRIM_RULE_MATCH_MODE;
	const artistLinePrefix =
		typeof stored?.artistLinePrefix === 'string'
			? stored.artistLinePrefix
			: DEFAULT_ARTIST_LINE_PREFIX;
	const lyricChordMarkerEnabled =
		typeof stored?.lyricChordMarkerEnabled === 'boolean'
			? stored.lyricChordMarkerEnabled
			: DEFAULT_LYRIC_CHORD_MARKER_ENABLED;
	const lyricChordMarkerRaw =
		typeof stored?.lyricChordMarker === 'string'
			? stored.lyricChordMarker
			: DEFAULT_LYRIC_CHORD_MARKER;
	const lyricChordMarker = lyricChordMarkerRaw || DEFAULT_LYRIC_CHORD_MARKER;
	return {
		sectionMapping,
		trimAfterKeywords,
		trimRules,
		trimRuleMatchMode,
		artistLinePrefix,
		lyricChordMarkerEnabled,
		lyricChordMarker,
	};
}

/**
 * @param {{
 *   sectionMapping?: Record<string, string>,
 *   trimAfterKeywords?: string[],
 *   trimRules?: { keyword: string, position: 'before' | 'after', includeMatchedLine?: boolean }[],
 *   trimRuleMatchMode?: 'or' | 'and',
 *   artistLinePrefix?: string,
 *   lyricChordMarkerEnabled?: boolean,
 *   lyricChordMarker?: string,
 * }} patch
 */
export function saveRawChordTransformOptions(patch) {
	if (typeof localStorage === 'undefined') {
		return;
	}
	const current = getRawChordTransformOptions();
	const next = {
		sectionMapping:
			patch && typeof patch.sectionMapping === 'object'
				? patch.sectionMapping
				: current.sectionMapping,
		trimAfterKeywords: Array.isArray(patch?.trimAfterKeywords)
			? patch.trimAfterKeywords
					.map((x) => String(x || '').trim())
					.filter(Boolean)
			: current.trimAfterKeywords,
		trimRules: Array.isArray(patch?.trimRules)
			? patch.trimRules
					.map((x) => ({
						keyword: String(x?.keyword || '').trim(),
						position: x?.position === 'before' ? 'before' : 'after',
						includeMatchedLine: x?.includeMatchedLine !== false,
					}))
					.filter((x) => x.keyword)
			: current.trimRules,
		trimRuleMatchMode:
			patch?.trimRuleMatchMode === 'and' ||
			patch?.trimRuleMatchMode === 'or'
				? patch.trimRuleMatchMode
				: current.trimRuleMatchMode,
		artistLinePrefix:
			patch &&
			Object.prototype.hasOwnProperty.call(patch, 'artistLinePrefix')
				? String(patch.artistLinePrefix)
				: current.artistLinePrefix,
		lyricChordMarkerEnabled:
			typeof patch?.lyricChordMarkerEnabled === 'boolean'
				? patch.lyricChordMarkerEnabled
				: current.lyricChordMarkerEnabled,
		lyricChordMarker:
			typeof patch?.lyricChordMarker === 'string'
				? String(patch.lyricChordMarker) || DEFAULT_LYRIC_CHORD_MARKER
				: current.lyricChordMarker || DEFAULT_LYRIC_CHORD_MARKER,
	};
	localStorage.setItem(
		RAW_CHORD_TRANSFORM_OPTIONS_STORAGE_KEY,
		JSON.stringify(next)
	);
}

export function resetRawChordTransformOptions() {
	if (typeof localStorage === 'undefined') {
		return;
	}
	localStorage.removeItem(RAW_CHORD_TRANSFORM_OPTIONS_STORAGE_KEY);
}

/**
 * 完整转换器源码（JS 字符串），优先级高于可视化配置。
 * @returns {string}
 */
export function getRawChordTransformFullCode() {
	if (typeof localStorage === 'undefined') {
		return '';
	}
	try {
		return (
			localStorage.getItem(RAW_CHORD_TRANSFORM_FULL_CODE_STORAGE_KEY) || ''
		);
	} catch {
		return '';
	}
}

/**
 * @param {string} code
 */
export function saveRawChordTransformFullCode(code) {
	if (typeof localStorage === 'undefined') {
		return;
	}
	localStorage.setItem(
		RAW_CHORD_TRANSFORM_FULL_CODE_STORAGE_KEY,
		String(code || '')
	);
}

export function resetRawChordTransformFullCode() {
	if (typeof localStorage === 'undefined') {
		return;
	}
	localStorage.removeItem(RAW_CHORD_TRANSFORM_FULL_CODE_STORAGE_KEY);
}

/**
 * @returns {{ id: string, name: string, code: string }[]}
 */
export function getRawChordTransformCodeTemplates() {
	if (typeof localStorage === 'undefined') {
		return [];
	}
	try {
		const raw = localStorage.getItem(
			RAW_CHORD_TRANSFORM_CODE_TEMPLATES_STORAGE_KEY
		);
		const parsed = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((x) => ({
				id: String(x?.id || '').trim(),
				name: String(x?.name || '').trim(),
				code: String(x?.code || ''),
			}))
			.filter((x) => x.id && x.name);
	} catch {
		return [];
	}
}

/**
 * @param {{ id: string, name: string, code: string }[]} templates
 */
export function saveRawChordTransformCodeTemplates(templates) {
	if (typeof localStorage === 'undefined') {
		return;
	}
	const next = Array.isArray(templates)
		? templates
				.map((x) => ({
					id: String(x?.id || '').trim(),
					name: String(x?.name || '').trim(),
					code: String(x?.code || ''),
				}))
				.filter((x) => x.id && x.name)
		: [];
	localStorage.setItem(
		RAW_CHORD_TRANSFORM_CODE_TEMPLATES_STORAGE_KEY,
		JSON.stringify(next)
	);
}

/**
 * @returns {string}
 */
export function getRawChordTransformActiveTemplateId() {
	if (typeof localStorage === 'undefined') {
		return 'builtin';
	}
	try {
		return (
			localStorage.getItem(
				RAW_CHORD_TRANSFORM_ACTIVE_TEMPLATE_ID_STORAGE_KEY
			) || 'builtin'
		);
	} catch {
		return 'builtin';
	}
}

/**
 * @param {string} templateId
 */
export function saveRawChordTransformActiveTemplateId(templateId) {
	if (typeof localStorage === 'undefined') {
		return;
	}
	localStorage.setItem(
		RAW_CHORD_TRANSFORM_ACTIVE_TEMPLATE_ID_STORAGE_KEY,
		String(templateId || 'builtin')
	);
}
