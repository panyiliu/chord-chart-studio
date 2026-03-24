import {
	getRawChordTransformFullCode,
	getRawChordTransformOptions,
} from './rawChordTransformOptions';

/** 与 Python 版一致：和弦行识别（maj7 / b5 / slash 等） */
export const CHORD_REGEX = new RegExp(
	'[A-G][#b]?' +
		'(?:maj7|maj|min|m|dim|aug|sus\\d*|add\\d*|b5|#5)?' +
		'\\d*' +
		'(?:/[A-G][#b]?)?',
	'g'
);

function isChordLine(line) {
	const lineStrip = line.trim();
	if (!lineStrip) {
		return false;
	}
	const matches = [...lineStrip.matchAll(CHORD_REGEX)].map((m) => m[0]);
	const compact = lineStrip.replace(/\s/g, '');
	return (
		matches.length > 0 && matches.join('').length >= compact.length * 0.6
	);
}

function convertSection(line, sectionMapping) {
	const lineLower = line.toLowerCase();
	for (const [k, v] of Object.entries(sectionMapping)) {
		const keyLower = String(k || '').toLowerCase();
		if (!keyLower) {
			continue;
		}
		if (lineLower.includes(keyLower)) {
			return v;
		}
	}
	return null;
}

function parseChordsWithPos(line) {
	const result = [];
	const re = new RegExp(CHORD_REGEX.source, 'g');
	let m = re.exec(line);
	while (m !== null) {
		result.push([m[0], m.index]);
		m = re.exec(line);
	}
	return result;
}

function convertChordLine(chords) {
	if (chords.length >= 2) {
		return chords.map(([c]) => c).join(' ');
	}
	return chords[0][0];
}

function applyChordsToLyrics(lyric, chords, markerEnabled = true, markerText = '_') {
	const positions = chords.map(([, pos]) => pos);
	const maxLen = Math.max(
		lyric.length,
		positions.length ? Math.max(...positions) + 1 : 0
	);
	const chars = lyric.padEnd(maxLen, ' ').split('');
	const marks = Array(maxLen).fill(false);
	for (const [, pos] of chords) {
		if (pos < maxLen) {
			marks[pos] = true;
		}
	}
	const result = [];
	const marker = String(markerText || '_');
	for (let i = 0; i < maxLen; i += 1) {
		if (markerEnabled && marks[i]) {
			result.push(marker);
		}
		result.push(chars[i] || '');
	}
	return result.join('').replace(/\s+$/, '');
}

function normalizeMatchText(text) {
	return String(text || '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * 截断规则关键词里若无法输入真实换行（单行输入框），可写字面量 `\n` 表示换行。
 * 多行匹配时，删除「before / after」的锚点落在**匹配块的最后一行**（例如上一行是 X、本行是 Last update:）。
 */
function unescapeTrimRuleKeywordNewlines(keyword) {
	let s = String(keyword || '');
	s = s.replace(/\\r\\n/g, '\n');
	s = s.replace(/\\r/g, '\n');
	s = s.replace(/\\n/g, '\n');
	return s;
}

function lineMatchesTrimPart(line, part) {
	const p = String(part || '').trim();
	if (!p) {
		return !String(line || '').trim();
	}
	return normalizeMatchText(line).includes(normalizeMatchText(p));
}

/**
 * @returns {{ anchorBefore: number, anchorAfter: number }} 未匹配时均为 -1
 */
function findRuleMatchBounds(lines, keywordRaw) {
	const expanded = unescapeTrimRuleKeywordNewlines(
		String(keywordRaw || '').trim()
	);
	if (!expanded) {
		return { anchorBefore: -1, anchorAfter: -1 };
	}
	const segments = expanded.split(/\r?\n/);
	if (segments.length === 1) {
		const needle = normalizeMatchText(segments[0]);
		if (!needle) {
			return { anchorBefore: -1, anchorAfter: -1 };
		}
		const idx = lines.findIndex((line) =>
			normalizeMatchText(line).includes(needle)
		);
		return { anchorBefore: idx, anchorAfter: idx };
	}
	const parts = segments.map((seg) => seg.trim());
	const span = parts.length;
	for (let i = 0; i <= lines.length - span; i += 1) {
		let ok = true;
		for (let j = 0; j < span; j += 1) {
			if (!lineMatchesTrimPart(lines[i + j], parts[j])) {
				ok = false;
				break;
			}
		}
		if (ok) {
			return {
				anchorBefore: i,
				anchorAfter: i + span - 1,
			};
		}
	}
	return { anchorBefore: -1, anchorAfter: -1 };
}

const KEY_TOKEN_CANDIDATES = [
	'C#',
	'DB',
	'D#',
	'EB',
	'F#',
	'GB',
	'G#',
	'AB',
	'A#',
	'BB',
	'C',
	'D',
	'E',
	'F',
	'G',
	'A',
	'B',
];

function normalizeKeyToken(token) {
	const raw = String(token || '').trim();
	if (!raw) {
		return '';
	}
	const first = raw.charAt(0).toUpperCase();
	const rest = raw.slice(1);
	if (!rest) {
		return first;
	}
	return `${first}${rest}`;
}

function pickKeyTokenFromPrefix(text) {
	const source = String(text || '').trimStart();
	if (!source) {
		return { token: '', length: 0 };
	}
	const upper = source.toUpperCase();
	for (const majorToken of KEY_TOKEN_CANDIDATES) {
		const minorToken = `${majorToken}M`;
		if (upper.startsWith(minorToken)) {
			return {
				token: normalizeKeyToken(
					`${majorToken.charAt(0)}${majorToken.slice(1).toLowerCase()}m`
				),
				length: minorToken.length,
			};
		}
		if (upper.startsWith(majorToken)) {
			return {
				token: normalizeKeyToken(
					`${majorToken.charAt(0)}${majorToken.slice(1).toLowerCase()}`
				),
				length: majorToken.length,
			};
		}
	}
	return { token: '', length: 0 };
}

function extractKeyFromLine(line) {
	const text = String(line || '');
	if (!text) {
		return null;
	}

	/**
	 * 不能用简单的 /key\\s*:/i：会误匹配 monkey:/turkey:/hockey: 等子串里的 “key:”，
	 * 导致大量行被插入空行与错误的 key 行。
	 *
	 * 合法场景：
	 * - 行首或非标点字母数字后的独立 “Key:”（如 “Key: C”“| Key: C”）
	 * - 与调音粘连的 “EKey:”“BbKey:”（如 “...B EKey: CCapo...”）
	 */
	const attempts = [];

	const reGlued = /([A-G][#b]?)key\s*:/gi;
	let m = reGlued.exec(text);
	while (m !== null) {
		const markerEnd = m.index + m[0].length;
		attempts.push({
			removeStart: m.index + m[1].length,
			markerEnd,
		});
		m = reGlued.exec(text);
	}

	const reStand = /(^|[^A-Za-z0-9#b])(key\s*:)/gi;
	m = reStand.exec(text);
	while (m !== null) {
		const removeStart = m.index + m[1].length;
		const markerEnd = m.index + m[0].length;
		attempts.push({
			removeStart,
			markerEnd,
		});
		m = reStand.exec(text);
	}

	if (!attempts.length) {
		return null;
	}

	attempts.sort((a, b) => a.removeStart - b.removeStart);

	for (const a of attempts) {
		const tail = text.slice(a.markerEnd);
		const leadingSpacesMatch = tail.match(/^\s*/);
		const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[0] : '';
		const tokenInfo = pickKeyTokenFromPrefix(
			tail.slice(leadingSpaces.length)
		);
		if (!tokenInfo.token || tokenInfo.length <= 0) {
			continue;
		}
		const removeEnd = a.markerEnd + leadingSpaces.length + tokenInfo.length;
		const cleanedLine =
			`${text.slice(0, a.removeStart)} ${text.slice(removeEnd)}`
				.replace(/\s+/g, ' ')
				.trim();
		return {
			keyLine: `key ${tokenInfo.token}`,
			cleanedLine,
		};
	}

	return null;
}

/**
 * 去掉网页噪声：支持 before/after 与 OR/AND 两种匹配关系。
 * @param {string[]} lines
 * @param {{ keyword: string, position: 'before' | 'after', includeMatchedLine?: boolean }[]} rules
 * @param {'or' | 'and'} [matchMode]
 * @returns {string[]}
 */
function trimTrailingNoise(lines, rules, matchMode = 'or') {
	const normalized = (rules || [])
		.map((r) => ({
			keyword: String(r?.keyword || '')
				.trim()
				.toLowerCase(),
			position: r?.position === 'before' ? 'before' : 'after',
			includeMatchedLine: r?.includeMatchedLine !== false,
		}))
		.filter((r) => r.keyword)
		.map((r) => {
			const { anchorBefore, anchorAfter } = findRuleMatchBounds(
				lines,
				r.keyword
			);
			if (anchorBefore < 0) {
				return { ...r, index: -1, anchorBefore: -1, anchorAfter: -1 };
			}
			const index = r.position === 'before' ? anchorBefore : anchorAfter;
			return { ...r, index, anchorBefore, anchorAfter };
		});
	if (!normalized.length) {
		return lines;
	}

	const matched = normalized.filter((r) => r.index >= 0);
	const mode = matchMode === 'and' ? 'and' : 'or';
	if (!matched.length) {
		return lines;
	}
	if (mode === 'and' && matched.length !== normalized.length) {
		return lines;
	}

	const toApply = matched;
	const keepMask = lines.map(() => true);
	for (const rule of toApply) {
		const { anchorBefore, anchorAfter } = rule;
		if (rule.position === 'before') {
			// 多行匹配时：不包含命中行 → 删到块首之前；包含命中行 → 删到块尾（整块去掉）
			const keepFrom = rule.includeMatchedLine
				? anchorAfter + 1
				: anchorBefore;
			for (let i = 0; i < keepFrom; i += 1) {
				keepMask[i] = false;
			}
		} else {
			// 多行匹配时：不包含命中行 → 从块尾下一行起删；包含命中行 → 从块首起删（整块及之后去掉）
			const keepToExclusive = rule.includeMatchedLine
				? anchorBefore
				: anchorAfter + 1;
			for (let i = keepToExclusive; i < keepMask.length; i += 1) {
				keepMask[i] = false;
			}
		}
	}
	return lines.filter((_, idx) => keepMask[idx]);
}

function normalizeLegacyKeywordsToRules(keywords) {
	return (keywords || [])
		.map((k) => String(k || '').trim())
		.filter(Boolean)
		.map((keyword) => ({
			keyword,
			position: 'after',
			includeMatchedLine: true,
		}));
}

/** Ultimate Guitar 等：同一行同时出现 views / saves / comments（允许数字与词粘连） */
function isUgStatsLine(line) {
	const s = String(line || '');
	if (!s.trim()) {
		return false;
	}
	return /views/i.test(s) && /saves/i.test(s) && /comments/i.test(s);
}

/** 解析「歌名 Chords by 歌手」 */
function parseUgChordsByTitleLine(line) {
	const t = String(line || '').trim();
	if (!t) {
		return null;
	}
	const m = t.match(/^(.+?)\s+chords\s+by\s+(.+)$/i);
	if (!m) {
		return null;
	}
	const title = m[1].trim().replace(/\s+/g, ' ');
	const artist = m[2].trim().replace(/\s+/g, ' ');
	if (!title || !artist) {
		return null;
	}
	return { title, artist };
}

function indexOfPreviousNonEmptyLine(lines, fromIndex) {
	for (let j = fromIndex - 1; j >= 0; j -= 1) {
		if (String(lines[j] || '').trim()) {
			return j;
		}
	}
	return -1;
}

/**
 * 基于含 views/saves/comments 的统计行：向上跳过空行，取最近一行非空行推断「歌名 Chords by 歌手」（UG 常见版式）。
 * 须在**自定义截断等规则之前**调用，避免规则删行导致抓不到。
 * @returns {{ artist: string, titleLineText: string, statsLineText: string } | null}
 */
function extractUgTitleArtistFromLines(lines) {
	for (let i = 0; i < lines.length; i += 1) {
		if (!isUgStatsLine(lines[i])) {
			continue;
		}
		const titleIdx = indexOfPreviousNonEmptyLine(lines, i);
		if (titleIdx < 0) {
			continue;
		}
		const parsed = parseUgChordsByTitleLine(lines[titleIdx]);
		if (!parsed) {
			continue;
		}
		return {
			artist: parsed.artist,
			titleLineText: String(lines[titleIdx] || ''),
			statsLineText: String(lines[i] || ''),
		};
	}
	return null;
}

function stripUgCapturedLines(lines, ugMeta) {
	if (!ugMeta) {
		return lines;
	}
	const norm = (s) => String(s || '').replace(/\r$/, '');
	const titleWant = norm(ugMeta.titleLineText);
	const statsWant = norm(ugMeta.statsLineText);
	return lines.filter((line) => {
		const n = norm(line);
		return n !== titleWant && n !== statsWant;
	});
}

/**
 * 将「原始和弦稿」转为 ChordMark 风格文本（与给定 Python 脚本等价）。
 *
 * trimRules[].keyword：可多行；单行内可用字面量 \\n 表示换行。
 * 多行 + after：不包含命中行则从块尾下一行删起；包含命中行则从块首删起。
 * 多行 + before：不包含命中行则删到块首前；包含命中行则删到块尾。
 *
 * @param {string} input - 全文（按行 \n 分隔）
 * @param {{
 *   sectionMapping?: Record<string, string>,
 *   trimRules?: { keyword: string, position: 'before' | 'after', includeMatchedLine?: boolean }[],
 *   trimRuleMatchMode?: 'or' | 'and',
 *   artistLinePrefix?: string,
 *   lyricChordMarkerEnabled?: boolean,
 *   lyricChordMarker?: string,
 * }} [options] - 与默认合并（便于单测或临时覆盖）
 * @returns {string}
 */
function builtInConvertRawChordSheet(input, options = {}, runtime = {}) {
	const readOptions =
		typeof runtime?.getRawChordTransformOptions === 'function'
			? runtime.getRawChordTransformOptions
			: getRawChordTransformOptions;
	const base = readOptions();
	const sectionMapping = {
		...base.sectionMapping,
		...(options.sectionMapping || {}),
	};
	const trimRules = Array.isArray(options.trimRules)
		? options.trimRules
		: Array.isArray(base.trimRules) && base.trimRules.length
			? base.trimRules
			: normalizeLegacyKeywordsToRules(base.trimAfterKeywords);
	const trimRuleMatchMode =
		options.trimRuleMatchMode || base.trimRuleMatchMode || 'or';
	const artistLinePrefix =
		options.artistLinePrefix !== undefined
			? String(options.artistLinePrefix)
			: base.artistLinePrefix;
	const lyricChordMarkerEnabled =
		typeof options.lyricChordMarkerEnabled === 'boolean'
			? options.lyricChordMarkerEnabled
			: typeof base.lyricChordMarkerEnabled === 'boolean'
				? base.lyricChordMarkerEnabled
				: true;
	const lyricChordMarker =
		typeof options.lyricChordMarker === 'string'
			? String(options.lyricChordMarker)
			: String(base.lyricChordMarker || '_');
	const rawLines = input.replace(/\r\n/g, '\n').split('\n');
	/** 先于截断规则抓取，避免被用户规则删掉后无法识别 */
	const ugMeta = extractUgTitleArtistFromLines(rawLines);
	const trimmedLines = trimTrailingNoise(
		rawLines,
		trimRules,
		trimRuleMatchMode
	);
	const lines = stripUgCapturedLines(trimmedLines, ugMeta);
	const output = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i].replace(/\r$/, '');
		const extractedKey = extractKeyFromLine(line);
		if (extractedKey) {
			if (extractedKey.cleanedLine) {
				output.push(extractedKey.cleanedLine);
			}
			output.push('');
			output.push(extractedKey.keyLine);
			i += 1;
			continue;
		}

		const sec = convertSection(line, sectionMapping);
		if (sec) {
			output.push(sec);
			i += 1;
			continue;
		}

		if (!line.trim()) {
			output.push('');
			i += 1;
			continue;
		}

		if (isChordLine(line)) {
			const chords = parseChordsWithPos(line);

			if (i + 1 < lines.length) {
				const nextLine = lines[i + 1].replace(/\r$/, '');

				if (!isChordLine(nextLine) && nextLine.trim()) {
					const chordLine = convertChordLine(chords);
					const lyricLine = applyChordsToLyrics(
						nextLine,
						chords,
						lyricChordMarkerEnabled,
						lyricChordMarker
					);

					output.push(chordLine);
					output.push(lyricLine);

					i += 2;
					continue;
				}
			}

			output.push(convertChordLine(chords));
			i += 1;
			continue;
		}

		output.push(line);
		i += 1;
	}

	const body = output.join('\n');
	if (ugMeta) {
		return [artistLinePrefix + ugMeta.artist, '', body].join('\n');
	}
	return body;
}

function compileCustomConverterFromCode(codeText) {
	const raw = String(codeText || '').trim();
	if (!raw) return null;
	try {
		const wrapped = `
${raw}
; return (typeof convertRawChordSheet === 'function'
	? convertRawChordSheet
	: (typeof module !== 'undefined' && module && module.exports && module.exports.default)
		? module.exports.default
		: null);
`;
		const fn = Function('module', wrapped);
		const moduleLike = { exports: {} };
		const compiled = fn(moduleLike);
		return typeof compiled === 'function' ? compiled : null;
	} catch {
		return null;
	}
}

let cachedCustomCode = null;
let cachedCustomConverter = null;

function getCustomConverter() {
	const code = getRawChordTransformFullCode();
	if (!code) return null;
	if (code === cachedCustomCode) return cachedCustomConverter;
	cachedCustomCode = code;
	cachedCustomConverter = compileCustomConverterFromCode(code);
	return cachedCustomConverter;
}

export function getBuiltInRawChordConverterSource() {
	const builtInSource = builtInConvertRawChordSheet
		.toString()
		.replace(
			'function builtInConvertRawChordSheet',
			'function __builtInConvertRawChordSheet'
		);
	return [
		`const CHORD_REGEX = ${CHORD_REGEX.toString()};`,
		isChordLine.toString(),
		convertSection.toString(),
		parseChordsWithPos.toString(),
		convertChordLine.toString(),
		applyChordsToLyrics.toString(),
		normalizeMatchText.toString(),
		unescapeTrimRuleKeywordNewlines.toString(),
		lineMatchesTrimPart.toString(),
		findRuleMatchBounds.toString(),
		normalizeKeyToken.toString(),
		pickKeyTokenFromPrefix.toString(),
		extractKeyFromLine.toString(),
		trimTrailingNoise.toString(),
		normalizeLegacyKeywordsToRules.toString(),
		isUgStatsLine.toString(),
		parseUgChordsByTitleLine.toString(),
		indexOfPreviousNonEmptyLine.toString(),
		extractUgTitleArtistFromLines.toString(),
		stripUgCapturedLines.toString(),
		builtInSource,
		`function convertRawChordSheet(input, options = {}, context = {}) {
  return __builtInConvertRawChordSheet(input, options, {
    getRawChordTransformOptions: context.getRawChordTransformOptions,
  });
}`,
	].join('\n\n');
}

export function convertRawChordSheet(input, options = {}) {
	const custom = getCustomConverter();
	if (custom) {
		try {
			return String(
				custom(String(input || ''), options || {}, {
					__builtinConvertRawChordSheet: builtInConvertRawChordSheet,
					getRawChordTransformOptions,
				})
			);
		} catch {
			// 自定义代码出错时自动回退到内置转换器，避免主流程中断
		}
	}
	return builtInConvertRawChordSheet(input, options);
}
