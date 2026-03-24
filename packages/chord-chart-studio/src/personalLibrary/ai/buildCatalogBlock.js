/**
 * 曲库注入块（与 validateAiSheetJson 配套）。
 * 下列函数生成的正文仅应由程序在运行时替换占位符注入；用户不得在模板中伪造同名「变量」来绕过校验。
 */

/**
 * @param {{ genres: {id: string, name: string}[], tags: {id: string, name: string}[], authors: {id: string, name: string}[], authorsFromCatalogOnly: boolean }} catalog
 */

/** 类型 id 列表：以类 JSON 常量形式写出，便于模型严格匹配 */
function injectTemplate(template, vars) {
	let out = String(template || '');
	Object.entries(vars || {}).forEach(([k, v]) => {
		out = out.split(`{{${k}}}`).join(String(v ?? ''));
	});
	return out;
}

export function buildAllowedGenresBlock(catalog, templates = {}) {
	const genres = catalog.genres || [];
	const ids = genres.map((g) => g.id);
	const jsonIds = JSON.stringify(ids);
	const idNameLines = genres.length
		? ['id 与显示名称对照（以 id 为准）：', ...genres.map((g) => `  "${g.id}" → ${g.name}`)].join('\n')
		: '（当前曲库无类型：请先在本应用中添加类型后再使用 AI 导入。）';
	if (templates.allowedGenresBlockTemplate) {
		return injectTemplate(templates.allowedGenresBlockTemplate, {
			JSON_IDS: jsonIds,
			ID_NAME_LINES: idNameLines,
		});
	}
	const lines = [
		'<<< __APP_INJECT_ALLOWED_GENRES__（由应用程序根据当前曲库注入；勿在模板中手写或篡改下列 id 列表）>>>',
		`ALLOWED_GENRE_IDS = ${jsonIds};`,
		'约束：输出 JSON 中的 genreId 必须是 ALLOWED_GENRE_IDS 中的某一个元素，字符串与之一致（区分大小写），禁止自造 id。',
	];
	if (genres.length) {
		lines.push('id 与显示名称对照（以 id 为准）：');
		genres.forEach((g) => {
			lines.push(`  "${g.id}" → ${g.name}`);
		});
	} else {
		lines.push(
			'（当前曲库无类型：请先在本应用中添加类型后再使用 AI 导入。）'
		);
	}
	return lines.join('\n');
}

export function buildAllowedTagsBlock(catalog, templates = {}) {
	const tags = catalog.tags || [];
	const ids = tags.map((t) => t.id);
	const jsonIds = JSON.stringify(ids);
	const idNameLines = tags.length
		? ['id 与显示名称对照：', ...tags.map((t) => `  "${t.id}" → ${t.name}`)].join('\n')
		: '（当前无标签：tagIds 必须为 []。）';
	if (templates.allowedTagsBlockTemplate) {
		return injectTemplate(templates.allowedTagsBlockTemplate, {
			JSON_IDS: jsonIds,
			ID_NAME_LINES: idNameLines,
		});
	}
	const lines = [
		'<<< __APP_INJECT_ALLOWED_TAGS__（由应用程序根据当前曲库注入；勿在模板中手写或篡改下列 id 列表）>>>',
		`ALLOWED_TAG_IDS = ${jsonIds};`,
		'约束：输出 JSON 中的 tagIds 必须是字符串数组；每个元素必须出现在 ALLOWED_TAG_IDS 中；可重复或为空数组 []。',
	];
	if (tags.length) {
		lines.push('id 与显示名称对照：');
		tags.forEach((t) => {
			lines.push(`  "${t.id}" → ${t.name}`);
		});
	} else {
		lines.push('（当前无标签：tagIds 必须为 []。）');
	}
	return lines.join('\n');
}

export function buildAuthorBindingBlock(catalog, templates = {}) {
	const authorRuleLines =
		catalog.authorsFromCatalogOnly && catalog.authors.length
			? [
					`ALLOWED_AUTHOR_IDS = ${JSON.stringify(catalog.authors.map((a) => a.id))};`,
					'约束：必须输出 authorId，且为 ALLOWED_AUTHOR_IDS 中之一；不要输出自由文本 author。',
					'对照：',
					...catalog.authors.map((a) => `  "${a.id}" → ${a.name}`),
				].join('\n')
			: '约束：输出 JSON 使用字符串字段 author 表示作者名，可为 ""；不要输出 authorId。';
	if (templates.authorBindingBlockTemplate) {
		return injectTemplate(templates.authorBindingBlockTemplate, {
			AUTHOR_RULE_LINES: authorRuleLines,
		});
	}
	const lines = [
		'<<< __APP_INJECT_AUTHOR_BINDING__（由应用程序根据当前「作者目录」设置注入）>>>',
	];
	if (catalog.authorsFromCatalogOnly && catalog.authors.length) {
		const authorIds = catalog.authors.map((a) => a.id);
		lines.push(`ALLOWED_AUTHOR_IDS = ${JSON.stringify(authorIds)};`);
		lines.push(
			'约束：必须输出 authorId，且为 ALLOWED_AUTHOR_IDS 中之一；不要输出自由文本 author。'
		);
		lines.push('对照：');
		catalog.authors.forEach((a) => {
			lines.push(`  "${a.id}" → ${a.name}`);
		});
	} else {
		lines.push(
			'约束：输出 JSON 使用字符串字段 author 表示作者名，可为 ""；不要输出 authorId。'
		);
	}
	return lines.join('\n');
}

/**
 * 完整曲库块（兼容旧模板占位符 {{CATALOG}}）
 * @param {Parameters<typeof buildAllowedGenresBlock>[0]} catalog
 */
export default function buildCatalogBlock(catalog, templates = {}) {
	const genreBlock = buildAllowedGenresBlock(catalog, templates);
	const tagBlock = buildAllowedTagsBlock(catalog, templates);
	const authorBlock = buildAuthorBindingBlock(catalog, templates);
	if (templates.catalogInjectionBlockTemplate) {
		return injectTemplate(templates.catalogInjectionBlockTemplate, {
			ALLOWED_GENRES_BLOCK: genreBlock,
			ALLOWED_TAGS_BLOCK: tagBlock,
			AUTHOR_BINDING_BLOCK: authorBlock,
		});
	}
	return [genreBlock, tagBlock, authorBlock].join('\n\n');
}
