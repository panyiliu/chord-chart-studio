import buildCatalogBlock, {
	buildAllowedGenresBlock,
	buildAllowedTagsBlock,
	buildAuthorBindingBlock,
} from './buildCatalogBlock';

const PLACEHOLDER_FULL = '{{CATALOG}}';
const PLACEHOLDER_GENRES = '{{ALLOWED_GENRES}}';
const PLACEHOLDER_TAGS = '{{ALLOWED_TAGS}}';
const PLACEHOLDER_AUTHORS = '{{AUTHOR_BINDING}}';

function hasAnyInjectPlaceholder(t) {
	return (
		t.includes(PLACEHOLDER_FULL) ||
		t.includes(PLACEHOLDER_GENRES) ||
		t.includes(PLACEHOLDER_TAGS) ||
		t.includes(PLACEHOLDER_AUTHORS)
	);
}

/**
 * 将用户维护的提示词模板与当前曲库合并为完整 system 提示。
 *
 * 占位符（均由程序替换，勿在模板中手写伪造列表）：
 * - {{ALLOWED_GENRES}} — 当前允许的 genreId 列表（含 ALLOWED_GENRE_IDS）
 * - {{ALLOWED_TAGS}} — 当前允许的 tagIds 来源（含 ALLOWED_TAG_IDS）
 * - {{AUTHOR_BINDING}} — 作者字段规则与（若启用）ALLOWED_AUTHOR_IDS
 * - {{CATALOG}} — 上述三段的完整合并（兼容旧模板）
 *
 * 若模板中未出现任一上述占位符，则在文末自动追加完整曲库块。
 * @param {string} templateBody
 * @param {Parameters<typeof buildCatalogBlock>[0]} catalog
 */
export default function renderImportSystemPrompt(
	templateBody,
	catalog,
	templateOverrides = {}
) {
	const genres = buildAllowedGenresBlock(catalog, templateOverrides);
	const tags = buildAllowedTagsBlock(catalog, templateOverrides);
	const authors = buildAuthorBindingBlock(catalog, templateOverrides);
	const full = buildCatalogBlock(catalog, templateOverrides);

	const t = (templateBody || '').trim();
	if (!t) {
		return full;
	}

	let out = t;
	out = out.split(PLACEHOLDER_GENRES).join(genres);
	out = out.split(PLACEHOLDER_TAGS).join(tags);
	out = out.split(PLACEHOLDER_AUTHORS).join(authors);
	out = out.split(PLACEHOLDER_FULL).join(full);

	if (!hasAnyInjectPlaceholder(t)) {
		out = `${out}\n\n${full}`;
	}
	return out;
}
