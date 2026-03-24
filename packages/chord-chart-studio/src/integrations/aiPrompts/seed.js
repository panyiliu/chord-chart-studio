export default {
	/** 追加在提示词模板 + {{CATALOG}} 之后的系统说明 */
	systemPromptAppend: '',
	/** 导入场景的 user 前置说明（在「--- 用户内容 ---」前） */
	importUserPromptPreamble: [
		'硬性要求（违反则导入失败）：',
		'- 只输出一个 JSON 对象，第一个字符必须是「{」，最后一个字符必须是「}」。',
		'- 禁止只输出 ChordMark 正文；ChordMark 必须放在 JSON 的 chordMark 字符串字段里。',
		'- 顶层必须包含 title、chordMark、genreId、tagIds，并按系统提示中的 AUTHOR_BINDING 规则包含 author 或 authorId。',
		'- 不要使用 Markdown 代码围栏。',
	].join('\n'),
	/** 测试连通性时发送给模型的用户消息 */
	connectivityTestUserMessage: '你好，请只回复「测试成功」。',

	/**
	 * 各 AI 功能专用引擎；空字符串表示与「引擎」页中的当前选中引擎相同。
	 * @type {string}
	 */
	urlImportEngineId: '',
	fileImportEngineId: '',
	pasteImportEngineId: '',
	/**
	 * 元数据识别使用的引擎 id；空字符串表示与「当前选中引擎」相同。
	 * @type {string}
	 */
	metadataInferenceEngineId: '',

	/**
	 * 为 true 时，AI 文件/粘贴/URL 导入弹窗内不显示引擎下拉框，仅使用上方绑定的引擎。
	 * @type {boolean}
	 */
	hideAiImportEngineSelector: false,
	/** 元数据识别使用的模板 id（来自统一模板库） */
	metadataInferenceTemplateId: '',

	/**
	 * 元数据识别：system 提示主体（支持 {{CATALOG}} / {{ALLOWED_GENRES}} 等与导入相同的占位符）。
	 */
	metadataInferenceSystemPrompt: `你是音乐资料助手。用户会提供当前歌曲编辑区**前若干行**摘录（可能含和弦、歌词或标题）。请根据摘录推断曲目元数据，并**只输出一个 JSON 对象**。

【能力边界】
- 你无法在本对话中自行打开网页；请使用摘录文本 + 你对发行歌曲的常识进行匹配。
- 若摘录明显对应某首公开发行的作品，title 应使用该作品常见的**正式曲名**；author 优先填**主唱/主要艺人**的常见署名。不要只用一句副歌歌词充当歌名，除非它确实就是官方标题。

【必须遵守】
- 只输出 JSON：从第一个「{」到最后一个「}」，前后不要说明文字，不要使用 Markdown 代码围栏。
- 键名必须严格使用下列之一（可省略不需要的键；不要发明其它键名）：
  - title: string，歌曲标题；不要省略，也不要给空串。
  - author: string，作者显示名（当下方 AUTHOR_BINDING 要求自由文本时）；能识别歌曲时填艺人署名，否则可填 "未知作者"。
  - authorId: string，作者目录 id（当下方要求必须从目录选择时）。
  - genreId: string 或 null；string 时必须等于允许的某个类型 id。
  - tagIds: string[]，每项必须属于允许的标签 id；无标签时 []。

【业务】
- 摘录可能不完整，请合理推测；genreId、tagIds、author/authorId 必须严格符合下方曲库白名单。

{{CATALOG}}`,

	/** 追加在 system 末尾（在 {{CATALOG}} 展开之后） */
	metadataInferencePromptAppend: '',
	/** 元数据识别 user 前置说明（在摘录正文前） */
	metadataInferenceUserPreamble: [
		'你将收到当前编辑区摘录。',
		'请仅基于摘录推断元数据，并只输出一个 JSON 对象。',
	].join('\n'),
	/** 元数据识别的应用级补充约束（可在前端设置里完整修改） */
	metadataInferenceRuntimePromptAppend: [
		'【强制输出策略（应用级）】',
		'- title：不要省略，也不要输出空串。若摘录歌词与某首公开发行的作品高度吻合，请输出正式曲名（常用英文名或译名）。',
		'- author：在 author 模式下，优先输出主唱/主要艺人的常见署名；仅当无法匹配时再输出「未知作者」。',
	].join('\n'),

	/** 曲库注入块模板（高级可配）。支持变量：{{JSON_IDS}} {{ID_NAME_LINES}} */
	allowedGenresBlockTemplate: [
		'<<< __APP_INJECT_ALLOWED_GENRES__（由应用程序根据当前曲库注入；勿在模板中手写或篡改下列 id 列表）>>>',
		'ALLOWED_GENRE_IDS = {{JSON_IDS}};',
		'约束：输出 JSON 中的 genreId 必须是 ALLOWED_GENRE_IDS 中的某一个元素，字符串与之一致（区分大小写），禁止自造 id。',
		'{{ID_NAME_LINES}}',
	].join('\n'),
	allowedTagsBlockTemplate: [
		'<<< __APP_INJECT_ALLOWED_TAGS__（由应用程序根据当前曲库注入；勿在模板中手写或篡改下列 id 列表）>>>',
		'ALLOWED_TAG_IDS = {{JSON_IDS}};',
		'约束：输出 JSON 中的 tagIds 必须是字符串数组；每个元素必须出现在 ALLOWED_TAG_IDS 中；可重复或为空数组 []。',
		'{{ID_NAME_LINES}}',
	].join('\n'),
	authorBindingBlockTemplate: [
		'<<< __APP_INJECT_AUTHOR_BINDING__（由应用程序根据当前「作者目录」设置注入）>>>',
		'{{AUTHOR_RULE_LINES}}',
	].join('\n'),
	/**
	 * 曲库注入块总模板（优先级高于上面三个分块模板）。
	 * 可用变量：{{ALLOWED_GENRES_BLOCK}} {{ALLOWED_TAGS_BLOCK}} {{AUTHOR_BINDING_BLOCK}}
	 */
	catalogInjectionBlockTemplate: '',
};
