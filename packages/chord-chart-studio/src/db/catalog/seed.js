/**
 * 个人曲库：基础分类数据（类型 / 标签 / 作者）
 * AI 解析结果必须能映射到这些 id，禁止发明新类型。
 */
export default {
	genres: [
		{ id: 'genre_pop', name: '流行' },
		{ id: 'genre_jazz', name: '爵士' },
	],
	tags: [{ id: 'tag_live', name: '现场版' }],
	/** 为 false 时作者可为任意字符串；为 true 时 AI 只能选 authors[].id */
	authorsFromCatalogOnly: false,
	authors: [],
};
