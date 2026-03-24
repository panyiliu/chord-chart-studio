// Centralized bilingual strings for UI.
// Key should be the original "source" string used in JSX (mostly Chinese currently).
// Values provide per-language display text.
//
// Interpolation:
// - Use {{var}} in translation strings and call t(key, { var: value }).

const TRANSLATIONS = {
	zh: {
		// Nav
		Edit: '编辑',
		'Screen view': '屏幕视图',
		'Print/PDF Preview': '打印/PDF预览',
		'Export Preview': '导出预览',

		// Right bar (Rendering widgets)
		'Editor preferences': '编辑器偏好',
		Theme: '主题',
		'Darks 1 (default)': '深色 1（默认）',
		'Dark 1 (default)': '深色 1（默认）',
		'Dark 2': '深色 2',
		'Dark 3': '深色 3',
		'Export format': '导出格式',
		'ChordMark (Source)': 'ChordMark（源码）',
		ChordPro: 'ChordPro',
		UltimateGuitar: 'Ultimate Guitar',
		Key: '调性',
		Transpose: '移调',
		'Preferred accidentals': '偏好变音符',
		Auto: '自动',
		'Symbols type': '符号类型',
		'Chord symbols': '和弦符号',
		'Roman numerals': '罗马数字',
		'Chart settings': '谱面设置',
		Type: '类型',
		'Show everything': '显示全部',
		'Lyrics only': '仅歌词',
		'Chords only': '仅和弦',
		'Chords + First lyric line': '和弦 + 首句歌词',
		'Align chords with lyrics': '和弦与歌词对齐',
		'Align bars': '对齐小节线',
		'Auto repeat chords': '自动重复和弦',
		'Expand copied sections': '展开复制段落',
		Layout: '版式',
		'Print / PDF — chord style': '打印/PDF — 和弦样式',
		'Chord color': '和弦颜色',
		'Same as lyrics': '与歌词一致',
		Blue: '蓝色',
		Teal: '青色',
		Red: '红色',
		Purple: '紫色',
		Black: '黑色',
		'Chord size': '和弦字号',
		'Bold chord symbols': '粗体和弦',
		'Chord shadow': '和弦阴影',
		Page: '页面',
		'Font size': '字体大小',
		Columns: '列数',
		'Column Break on section': '按段落分页',
		Margins: '页边距',

		// Input format selector
		'Input format:': '输入格式：',
		Detect: '检测',
		'Bracketed chords (ChordPro)': '括号和弦（ChordPro）',
		'Chords over lyrics (Ultimate Guitar...)': '歌词上方和弦（Ultimate Guitar...）',

		// Buttons / tooltips
		降: '降',
		升: '升',
		复原: '复原',
		已复原: '已复原',
		Language: '语言',
		Chinese: '中文',
		English: '英文',

		// Misc
		'User Guide': '用户指南',
		'ChordMark preview': 'ChordMark 预览',
		界面配色: '界面配色',
		跟随系统: '跟随系统',
		浅色: '浅色',
		深色: '深色',

		'Logo by': 'Logo 设计：',
		'Chord Chart Studio': '和弦图工作室',
		ChordSymbol: 'ChordSymbol',
		'ChordMark': 'ChordMark',

		// Default (fallback keys used in other UI)
		'ChordMark source': 'ChordMark source',
		'Artist 行': 'Artist 行',
		'规则代码(JS)': '规则代码(JS)',
		'高级：完整规则代码（JS）': '高级：完整规则代码（JS）',
		'展示与应用的是可运行 JS 配置代码（export default 对象），可直接复制到 IDE。':
			'展示与应用的是可运行 JS 配置代码（export default 对象），可直接复制到 IDE。',
		'应用代码到规则': '应用代码到规则',
		'代码解析失败：': '代码解析失败：',
		歌手: '歌手',
		全部歌手: '全部歌手',
		'按歌手筛选': '按歌手筛选',
		从曲库作者中搜索并选择: '从曲库作者中搜索并选择',
		'搜索歌手…': '搜索歌手…',
		搜索歌手: '搜索歌手',
		没有匹配歌手: '没有匹配歌手',
		'调用模板说明（?）': '调用模板说明（?）',
		'以下模板可直接用于调试 Node 代理。变量会按你当前输入自动填充。':
			'以下模板可直接用于调试 Node 代理。变量会按你当前输入自动填充。',
		'POST 上传模板': 'POST 上传模板',
		'GET/下载（当前实现为 POST 请求）模板':
			'GET/下载（当前实现为 POST 请求）模板',
		说明: '说明',
		'Backblaze Account ID，用于代理服务鉴权。':
			'Backblaze Account ID，用于代理服务鉴权。',
		'Backblaze Application Key，仅本地保存。':
			'Backblaze Application Key，仅本地保存。',
		'你在 Backblaze B2 中创建的桶名。': '你在 Backblaze B2 中创建的桶名。',
		'例如 https://s3.us-east-005.backblazeb2.com':
			'例如 https://s3.us-east-005.backblazeb2.com',
		'例如 us-east-005': '例如 us-east-005',
		'例如 http://localhost:8787，前端通过它调用云端 API。':
			'例如 http://localhost:8787，前端通过它调用云端 API。',
		'云端文件路径，例如 chord-chart-studio/backups/latest.json':
			'云端文件路径，例如 chord-chart-studio/backups/latest.json',
		'可编辑注入块：__APP_INJECT_ALLOWED_GENRES__':
			'可编辑注入块：__APP_INJECT_ALLOWED_GENRES__',
		'可编辑注入块：__APP_INJECT_ALLOWED_TAGS__':
			'可编辑注入块：__APP_INJECT_ALLOWED_TAGS__',
		'可编辑注入块：__APP_INJECT_AUTHOR_BINDING__':
			'可编辑注入块：__APP_INJECT_AUTHOR_BINDING__',
		'可编辑注入块：强制输出策略（应用级）':
			'可编辑注入块：强制输出策略（应用级）',
		'曲库注入块（合并编辑，推荐）': '曲库注入块（合并编辑，推荐）',
		'正在备份到云端…': '正在备份到云端…',
		'备份成功：已上传并覆盖云端同一对象。': '备份成功：已上传并覆盖云端同一对象。',
		'导出（与云端一致）': '导出（与云端一致）',
		'已导出与云端一致的备份 JSON。': '已导出与云端一致的备份 JSON。',
		'导出失败：': '导出失败：',
		'一键导出全部（ZIP）': '一键导出全部（ZIP）',
		'正在打包全部歌曲…': '正在打包全部歌曲…',
		'已导出全部歌曲 ZIP。': '已导出全部歌曲 ZIP。',
		'已导出全部歌曲 ZIP（TXT）。': '已导出全部歌曲 ZIP（TXT）。',
		'云端恢复（JSON）': '云端恢复（JSON）',
		'本地恢复（JSON）': '本地恢复（JSON）',
		'本地恢复（ZIP）': '本地恢复（ZIP）',
		'从本地 ZIP 恢复': '从本地 ZIP 恢复',
		'从本地 JSON 恢复': '从本地 JSON 恢复',
		'正在读取本地 JSON…': '正在读取本地 JSON…',
		'正在解析 ZIP…': '正在解析 ZIP…',
		'本地 JSON 恢复失败：': '本地 JSON 恢复失败：',
		'本地 ZIP 恢复失败：': '本地 ZIP 恢复失败：',
		'备份 JSON 格式无效。': '备份 JSON 格式无效。',
		检测到: '检测到',
		'首歌曲。': '首歌曲。',
		'一键删除所有曲谱（测试恢复）': '一键删除所有曲谱（测试恢复）',
		'确定要删除全部曲谱吗？此操作不可撤销。':
			'确定要删除全部曲谱吗？此操作不可撤销。',
		'已清空全部曲谱，可立即测试恢复。': '已清空全部曲谱，可立即测试恢复。',
		'清空曲谱失败：': '清空曲谱失败：',
		云端操作: '云端操作',
		本地恢复: '本地恢复',
		导出工具: '导出工具',
		测试辅助: '测试辅助',
		云备份: '云备份',
		'立即云备份（覆盖云端同一对象）。': '立即云备份（覆盖云端同一对象）。',
		歌曲名称: '歌曲名称',
		云服务器: '云服务器',
		未命名服务器: '未命名服务器',
		新增服务器: '新增服务器',
		删除服务器: '删除服务器',
		服务器名称: '服务器名称',
		'服务器配置（默认折叠）': '服务器配置（默认折叠）',
		'至少保留一个云服务器配置。': '至少保留一个云服务器配置。',
		'已新增云服务器配置。': '已新增云服务器配置。',
		'已删除当前云服务器配置。': '已删除当前云服务器配置。',
		'管理模型连接与默认引擎。': '管理模型连接与默认引擎。',
		'按功能绑定引擎与模板。': '按功能绑定引擎与模板。',
		'模板管理：统一维护提示词模板；全局规则：附加系统说明。':
			'模板管理：统一维护提示词模板；全局规则：附加系统说明。',
		'配置整理规则。': '配置整理规则。',
		'可配置段落映射、噪声截断关键词与规则代码。':
			'可配置段落映射、噪声截断关键词与规则代码。',
		'云备份与恢复。': '云备份与恢复。',
		'集中配置 AI 引擎、提示词模板、ChordMark 整理规则与备份恢复。':
			'集中配置 AI 引擎、提示词模板、ChordMark 整理规则与备份恢复。',
		AI引擎: 'AI引擎',
		'各 AI 功能的专用引擎在「提示词模板 → AI引擎」分页中配置。':
			'各 AI 功能的专用引擎在「提示词模板 → AI引擎」分页中配置。',
		'测试连接：': '测试连接：',
		'云端备份：': '云端备份：',
		'读取云端备份：': '读取云端备份：',
		'追加恢复：': '追加恢复：',
		'覆盖恢复：': '覆盖恢复：',
		'{{ctx}}无法连接到本地 Node 备份代理。请另开终端在项目根目录运行「yarn workspace backup-proxy dev」，并核对设置中的「Node 代理地址」与端口（默认 http://localhost:8787）。':
			'{{ctx}}无法连接到本地 Node 备份代理。请另开终端在项目根目录运行「yarn workspace backup-proxy dev」，并核对设置中的「Node 代理地址」与端口（默认 http://localhost:8787）。',
		'{{ctx}}配置不完整：请填写账号 ID、应用密钥、Bucket、备份对象键、S3 Endpoint、Region 与 Node 代理地址。':
			'{{ctx}}配置不完整：请填写账号 ID、应用密钥、Bucket、备份对象键、S3 Endpoint、Region 与 Node 代理地址。',
		'{{ctx}}鉴权失败：账号 ID 或应用密钥可能错误，或当前密钥无权访问该 Bucket。请在 Backblaze 控制台核对密钥与权限。':
			'{{ctx}}鉴权失败：账号 ID 或应用密钥可能错误，或当前密钥无权访问该 Bucket。请在 Backblaze 控制台核对密钥与权限。',
		'{{ctx}}Bucket 或端点不匹配：请核对 Bucket 名称、S3 Endpoint URL 与 Region 是否与控制台一致。':
			'{{ctx}}Bucket 或端点不匹配：请核对 Bucket 名称、S3 Endpoint URL 与 Region 是否与控制台一致。',
		'各功能可分别指定<strong>AI 引擎</strong>与<strong>提示模板</strong>；引擎留空则沿用「AI 引擎」分页的<strong>当前选中</strong>。模板正文在「模板管理」编辑。':
			'各功能可分别指定<strong>AI 引擎</strong>与<strong>提示模板</strong>；引擎留空则沿用「AI 引擎」分页的<strong>当前选中</strong>。模板正文在「模板管理」编辑。',
		'编辑发送给模型的 <strong>system</strong> 正文；在「AI 引擎」分页里为各功能绑定模板。':
			'编辑发送给模型的 <strong>system</strong> 正文；在「AI 引擎」分页里为各功能绑定模板。',
		'系统模板由上方「曲库元数据」行的模板决定；此处仅填写附加说明、user 前置与约束。':
			'系统模板由上方「曲库元数据」行的模板决定；此处仅填写附加说明、user 前置与约束。',
		'请在「AI 引擎」分页的「曲库元数据」一行配置。':
			'请在「AI 引擎」分页的「曲库元数据」一行配置。',
	},
	en: {
		// Nav
		Edit: 'Edit',
		'Screen view': 'Screen view',
		'Print/PDF Preview': 'Print/PDF Preview',
		'Export Preview': 'Export Preview',

		// Right bar (Rendering widgets)
		'Editor preferences': 'Editor preferences',
		Theme: 'Theme',
		'Dark 1 (default)': 'Dark 1 (default)',
		'Dark 2': 'Dark 2',
		'Dark 3': 'Dark 3',
		'Export format': 'Export format',
		'ChordMark (Source)': 'ChordMark (Source)',
		ChordPro: 'ChordPro',
		UltimateGuitar: 'UltimateGuitar',
		Key: 'Key',
		Transpose: 'Transpose',
		'Preferred accidentals': 'Preferred accidentals',
		Auto: 'Auto',
		'Symbols type': 'Symbols type',
		'Chord symbols': 'Chord symbols',
		'Roman numerals': 'Roman numerals',
		'Chart settings': 'Chart settings',
		Type: 'Type',
		'Show everything': 'Show everything',
		'Lyrics only': 'Lyrics only',
		'Chords only': 'Chords only',
		'Chords + First lyric line': 'Chords + First lyric line',
		'Align chords with lyrics': 'Align chords with lyrics',
		'Align bars': 'Align bars',
		'Auto repeat chords': 'Auto repeat chords',
		'Expand copied sections': 'Expand copied sections',
		Layout: 'Layout',
		'Print / PDF — chord style': 'Print / PDF — chord style',
		'Chord color': 'Chord color',
		'Same as lyrics': 'Same as lyrics',
		Blue: 'Blue',
		Teal: 'Teal',
		Red: 'Red',
		Purple: 'Purple',
		Black: 'Black',
		'Chord size': 'Chord size',
		'Bold chord symbols': 'Bold chord symbols',
		'Chord shadow': 'Chord shadow',
		Page: 'Page',
		'Font size': 'Font size',
		Columns: 'Columns',
		'Column Break on section': 'Column Break on section',
		Margins: 'Margins',

		// Input format selector
		'Input format:': 'Input format:',
		Detect: 'Detect',
		'Bracketed chords (ChordPro)': 'Bracketed chords (ChordPro)',
		'Chords over lyrics (Ultimate Guitar...)': 'Chords over lyrics (Ultimate Guitar...)',

		// Buttons / tooltips
		降: 'Down',
		升: 'Up',
		复原: 'Reset',
		已复原: 'Reset applied',
		Language: 'Language',
		Chinese: 'Chinese',
		English: 'English',

		// Misc
		'User Guide': 'User Guide',
		'ChordMark preview': 'ChordMark preview',
		界面配色: 'UI color scheme',
		跟随系统: 'Follow system',
		浅色: 'Light',
		深色: 'Dark',

		'Logo by': 'Logo by',
		'Chord Chart Studio': 'Chord Chart Studio',
		ChordSymbol: 'ChordSymbol',
		'ChordMark': 'ChordMark',

		// File manager (left library)
		空白: 'Blank',
		导入: 'Import',
		重命名: 'Rename',
		删除: 'Delete',
		打印: 'Print',
		导出: 'Export',

		'新建空白曲目；和弦与歌词在中间 ChordMark 编辑区编写。':
			'Create a blank song; write chords and lyrics in the middle ChordMark editor.',
		'ChordPro / Ultimate Guitar 等转为 ChordMark。':
			'Convert ChordPro / Ultimate Guitar, etc. into ChordMark.',
		'重命名列表中的当前曲目。': 'Rename the currently selected song.',
		'删除当前曲目。焦点在左侧曲库区域内时也可按 Delete 键打开确认。':
			'Delete the currently selected song. You can also press Delete when focus is inside the left library.',
		'打印当前曲目预览。': 'Print the current song preview.',
		'导出为文本（格式在导出页选择）。':
			'Export as text (format is selected on the export page).',

		'搜索歌曲名…': 'Search song title…',
		'搜索歌曲名': 'Search song title',
		'选中曲目后，焦点在曲库内时按 Delete 可删除（与「删除」按钮相同确认框）':
			'After selecting a song, when focus is inside the library, press Delete to delete it (same confirmation as the Delete button).',
		'未找到匹配歌曲': 'No matching songs',

		// Library filters
		类型: 'Type',
		标签: 'Tags',
		全部类型: 'All types',
		全部标签: 'All tags',
		'按类型筛选': 'Filter by type',
		'多选：曲目类型在任一选中项中即显示':
			'Multi-select: show songs when any selected type matches.',
		'按标签筛选': 'Filter by tags',
		'多选标签时的匹配方式': 'Match mode for multiple tags',
		'标签匹配关系': 'Tag match relationship',
		清除: 'Clear',
		满足任一: 'Match any',
		须全部包含: 'Must include all',
		'已选 {{count}} 项': 'Selected {{count}} items',
		'暂无标签，可在下方元数据中添加':
			'No tags yet. Add them in the metadata section below.',
		歌手: 'Artist',
		全部歌手: 'All artists',
		'按歌手筛选': 'Filter by artist',
		从曲库作者中搜索并选择: 'Search and select from library authors',
		'搜索歌手…': 'Search artist…',
		搜索歌手: 'Search artist',
		没有匹配歌手: 'No matching artist',

		// File metadata panel
		元数据: 'Metadata',
		'选中曲目后可编辑作者、类型与标签。':
			'Edit the author, type and tags after selecting a song.',
		未选择: 'Not selected',
		'请输入新类型名称': 'Enter new type name',
		'类型名称': 'Type name',
		'确定删除类型「{{name}}」？\n使用该类型的曲目将变为「未选择」。':
			'Delete type "{{name}}"?\nSongs using this type will become "Not selected".',
		新增类型: 'Add type',
		改名: 'Rename',
		作者: 'Author',
		作者名: 'Author name',
		标签: 'Tags',
		'勾选下方标签以关联到本曲目；可在曲库列表用「标签」筛选。':
			'Select the tags below to associate them with this song; filter the library list by "Tags".',
		新增标签: 'Add tag',
		'请输入新标签名称': 'Enter new tag name',
		'标签名称': 'Tag name',
		'确定删除标签「{{name}}」？\n将从曲库移除，并从所有曲目上摘掉该标签。':
			'Delete tag "{{name}}"?\nIt will be removed from the library and unassigned from all songs.',
		'暂无标签，请先新增': 'No tags yet. Please add one first.',
		'已选 {{count}} 个': 'Selected {{count}}',
		'管理曲库标签': 'Manage library tags',

		// Settings (AI)
		设置: 'Settings',
		关闭: 'Close',
		'设置分类': 'Settings category',
		配置: 'Configure',
		接口与: 'interfaces and',
		'各场景提示词': 'scenario prompt templates',
		'。Base URL 可填根路径或完整 …/chat/completions；浏览器若遇 CORS 需通过网关或代理。':
			'.../chat/completions. If your browser hits CORS, use a gateway or proxy.',
		'添加多个端点并选择': 'Add multiple endpoints and choose',
		'全局默认引擎': 'the global default engine',
		'；各 AI 功能的专用引擎在「提示词 → 引擎选择」中配置。':
			'the dedicated engines for each AI feature are configured under "Prompt templates → AI engines".',
		引擎选择: 'Engine selection',
		模板管理: 'Template management',
		全局规则: 'Global rules',
		'Artist 行': 'Artist line',
		'规则代码(JS)': 'Rule Code (JS)',
		'高级：完整规则代码（JS）': 'Advanced: full rule code (JS)',
		'展示与应用的是可运行 JS 配置代码（export default 对象），可直接复制到 IDE。':
			'This editor shows runnable JS configuration code (export default object), ready to copy into your IDE.',
		'应用代码到规则': 'Apply code to rules',
		'代码解析失败：': 'Code parse failed: ',
		'调用模板说明（?）': 'API template help (?)',
		'以下模板可直接用于调试 Node 代理。变量会按你当前输入自动填充。':
			'Use these templates to debug the Node proxy directly. Variables are auto-filled from your current form values.',
		'POST 上传模板': 'POST upload template',
		'GET/下载（当前实现为 POST 请求）模板':
			'GET/download template (currently implemented as POST)',
		说明: 'help',
		'Backblaze Account ID，用于代理服务鉴权。':
			'Backblaze Account ID used by the proxy for authentication.',
		'Backblaze Application Key，仅本地保存。':
			'Backblaze Application Key, stored locally only.',
		'你在 Backblaze B2 中创建的桶名。':
			'Bucket name created in your Backblaze B2 account.',
		'例如 https://s3.us-east-005.backblazeb2.com':
			'Example: https://s3.us-east-005.backblazeb2.com',
		'例如 us-east-005': 'Example: us-east-005',
		'例如 http://localhost:8787，前端通过它调用云端 API。':
			'Example: http://localhost:8787, used by frontend to call cloud APIs.',
		'云端文件路径，例如 chord-chart-studio/backups/latest.json':
			'Cloud object path, e.g. chord-chart-studio/backups/latest.json',
		'可编辑注入块：__APP_INJECT_ALLOWED_GENRES__':
			'Editable inject block: __APP_INJECT_ALLOWED_GENRES__',
		'可编辑注入块：__APP_INJECT_ALLOWED_TAGS__':
			'Editable inject block: __APP_INJECT_ALLOWED_TAGS__',
		'可编辑注入块：__APP_INJECT_AUTHOR_BINDING__':
			'Editable inject block: __APP_INJECT_AUTHOR_BINDING__',
		'可编辑注入块：强制输出策略（应用级）':
			'Editable inject block: forced output policy (app-level)',
		'曲库注入块（合并编辑，推荐）':
			'Catalog injection block (combined editing, recommended)',
		'正在备份到云端…': 'Backing up to cloud…',
		'备份成功：已上传并覆盖云端同一对象。':
			'Backup successful: uploaded and replaced the same cloud object.',
		'导出（与云端一致）': 'Export (cloud-equivalent)',
		'已导出与云端一致的备份 JSON。':
			'Exported backup JSON equivalent to cloud payload.',
		'导出失败：': 'Export failed: ',
		'一键导出全部（ZIP）': 'One-click export all (ZIP)',
		'正在打包全部歌曲…': 'Packaging all songs…',
		'已导出全部歌曲 ZIP。': 'Exported all songs ZIP.',
		'已导出全部歌曲 ZIP（TXT）。': 'Exported all songs ZIP (TXT).',
		'云端恢复（JSON）': 'Restore from cloud (JSON)',
		'本地恢复（JSON）': 'Restore local (JSON)',
		'本地恢复（ZIP）': 'Restore local (ZIP)',
		'从本地 ZIP 恢复': 'Restore from local ZIP',
		'从本地 JSON 恢复': 'Restore from local JSON',
		'正在读取本地 JSON…': 'Reading local JSON…',
		'正在解析 ZIP…': 'Parsing ZIP…',
		'本地 JSON 恢复失败：': 'Local JSON restore failed: ',
		'本地 ZIP 恢复失败：': 'Local ZIP restore failed: ',
		'备份 JSON 格式无效。': 'Invalid backup JSON format.',
		检测到: 'Detected',
		'首歌曲。': 'songs.',
		'一键删除所有曲谱（测试恢复）':
			'One-click delete all songs (restore test)',
		'确定要删除全部曲谱吗？此操作不可撤销。':
			'Delete all songs? This action cannot be undone.',
		'已清空全部曲谱，可立即测试恢复。':
			'All songs have been cleared. You can test restore now.',
		'清空曲谱失败：': 'Failed to clear songs: ',
		云端操作: 'Cloud actions',
		本地恢复: 'Local restore',
		导出工具: 'Export tools',
		测试辅助: 'Testing helpers',
		云备份: 'Cloud backup',
		'立即云备份（覆盖云端同一对象）。':
			'Start cloud backup now (overwrite same cloud object).',
		歌曲名称: 'Song title',
		云服务器: 'Cloud server',
		未命名服务器: 'Unnamed server',
		新增服务器: 'Add server',
		删除服务器: 'Remove server',
		服务器名称: 'Server name',
		'服务器配置（默认折叠）': 'Server config (collapsed by default)',
		'至少保留一个云服务器配置。':
			'At least one cloud server config must remain.',
		'已新增云服务器配置。': 'Cloud server config added.',
		'已删除当前云服务器配置。':
			'Current cloud server config removed.',
		'管理模型连接与默认引擎。':
			'Manage model connections and the default engine.',
		'按功能绑定引擎与模板。':
			'Bind engines and templates by feature.',
		'模板管理：统一维护提示词模板；全局规则：附加系统说明。':
			'Template management: maintain prompt templates. Global rules: extra system guidance.',
		'配置整理规则。': 'Configure cleanup rules.',
		'可配置段落映射、噪声截断关键词与规则代码。':
			'Configure paragraph mapping, noise trimming keywords, and rule code.',
		'云备份与恢复。': 'Cloud backup and restore.',
		'集中配置 AI 引擎、提示词模板、ChordMark 整理规则与备份恢复。':
			'Configure AI engines, prompt templates, ChordMark cleanup rules, and backup/restore in one place.',
		AI引擎: 'AI engines',
		'各 AI 功能的专用引擎在「提示词模板 → AI引擎」分页中配置。':
			'Dedicated engines for each AI feature are set under "Prompt templates → AI engines".',
		'测试连接：': 'Connection test: ',
		'云端备份：': 'Cloud backup: ',
		'读取云端备份：': 'Reading cloud backup: ',
		'追加恢复：': 'Merge restore: ',
		'覆盖恢复：': 'Overwrite restore: ',
		'{{ctx}}无法连接到本地 Node 备份代理。请另开终端在项目根目录运行「yarn workspace backup-proxy dev」，并核对设置中的「Node 代理地址」与端口（默认 http://localhost:8787）。':
			'{{ctx}}Cannot reach the local Node backup proxy. In another terminal at the repo root run `yarn workspace backup-proxy dev`, and verify the "Node proxy URL" and port (default http://localhost:8787).',
		'{{ctx}}配置不完整：请填写账号 ID、应用密钥、Bucket、备份对象键、S3 Endpoint、Region 与 Node 代理地址。':
			'{{ctx}}Configuration is incomplete: fill in Account ID, application key, bucket, backup object key, S3 endpoint, region, and Node proxy URL.',
		'{{ctx}}鉴权失败：账号 ID 或应用密钥可能错误，或当前密钥无权访问该 Bucket。请在 Backblaze 控制台核对密钥与权限。':
			'{{ctx}}Authentication failed: Account ID or application key may be wrong, or the key may lack access to this bucket. Check credentials and permissions in the Backblaze console.',
		'{{ctx}}Bucket 或端点不匹配：请核对 Bucket 名称、S3 Endpoint URL 与 Region 是否与控制台一致。':
			'{{ctx}}Bucket or endpoint mismatch: verify bucket name, S3 endpoint URL, and region against the Backblaze console.',
		'各功能可分别指定<strong>AI 引擎</strong>与<strong>提示模板</strong>；引擎留空则沿用「AI 引擎」分页的<strong>当前选中</strong>。模板正文在「模板管理」编辑。':
			'Each feature can use its own <strong>AI engine</strong> and <strong>prompt template</strong>; leave the engine empty to follow the <strong>current selection</strong> on the "AI engines" tab. Edit template bodies under "Template management".',
		'编辑发送给模型的 <strong>system</strong> 正文；在「AI 引擎」分页里为各功能绑定模板。':
			'Edit the <strong>system</strong> body sent to the model; bind templates per feature on the "AI engines" tab.',
		'系统模板由上方「曲库元数据」行的模板决定；此处仅填写附加说明、user 前置与约束。':
			'The system template is determined by the template chosen in the "Library metadata" row above; here you only add extra notes, user preamble, and constraints.',
		'请在「AI 引擎」分页的「曲库元数据」一行配置。':
			'Configure this on the "AI engines" tab → "Library metadata" row.',
		'各功能绑定引擎与模板，并可隐藏导入弹窗内的引擎下拉；':
			'bind engines and templates for each feature, and optionally hide the engine dropdown in the import modal;',
		'统一维护提示词模板；': 'maintain prompt templates in one place;',
		'为附加系统说明。': 'for additional system notes.',
	'配置「整理为 ChordMark」按钮的规则（段落映射、噪声截断关键词）。':
			'Configure the rules for the "Convert to ChordMark" button (paragraph mapping and noise-trim keywords).',
		引擎: 'Engines',
		提示词: 'Prompts',
		ChordMark整理: 'ChordMark Cleanup',
		'模型与连接': 'Model & Connection',
		'提示词与模板': 'Prompts & Templates',
		'整理为 ChordMark': 'Convert to ChordMark',
		'ChordMark 源码：整理、说明、元数据与调试':
			'ChordMark source: cleanup, help, metadata & debug',
		'处理中…': 'Processing…',
		'查看「整理为 ChordMark」内置规则与顺序说明':
			'View built-in rules & order for "Convert to ChordMark"',
		'内置规则与顺序说明': 'Built-in rules & order',
		'将左侧原始和弦稿解析为 ChordMark 结构并写回编辑区（规则可在「设置 → ChordMark整理」维护）':
			'Parse the left raw chord sheet into a ChordMark structure and write it back to the editor (rules are maintained under "Settings → ChordMark Cleanup").',

		'AI 识别元数据': 'AI infer metadata',
		'识别中…': 'Recognizing…',
		'将前 {{n}} 行送交 AI 推断标题、作者、类型与标签，并写入发起识别时的曲目；切换界面或其它歌曲识别中不影响本次回写（引擎与提示词在「设置」）':
			'Send the first {{n}} lines to AI to infer title, author, type and tags, then write back to the song that initiated this recognition. Switching views or recognizing other songs won’t affect this write-back (engines & prompts are configured in "Settings").',
		调试日志: 'Debug log',
		'调试日志已开启：点击关闭调试弹窗（日志保留可再开）':
			'Debug log is enabled: click to close the debug dialog (logs are kept; you can reopen).',
		'开启后：成功或失败后弹出调试弹窗并保留；再次切换可关闭':
			'When enabled: show a debug dialog after success or failure and keep it; toggle again to close.',

		// Raw chord help / log
		'关闭': 'Close',
		'整理为 ChordMark · 内置规则与顺序':
			'Convert to ChordMark · Built-in rules & order',
		暂无日志: 'No logs',
		'曲库元数据 · 调试日志': 'Library metadata · Debug log',
		'清空当前日志条目': 'Clear current log entries',
		清空: 'Clear',
		'关闭调试弹窗（日志保留）': 'Close debug dialog (logs kept)',
		'日志会保留以便后续分析。你可以点击「清空」或「关闭」；若还需要继续 AI 识别，可直接在背景操作。':
			'Logs are kept for later analysis. You can click "Clear" or "Close"; if you want to continue AI recognition, you can do it in the background.',

		// Raw chord transform settings panel
		'ChordMark 整理': 'ChordMark Cleanup',
		'网页识别 · Artist 行': 'Web parse · Artist line',
		'前缀文本（接在歌手名前）': 'Prefix text (right before the artist name)',
		'噪声截断': 'Noise trimming',
		'规则关系': 'Rule relationship',
		'或者（命中几条执行几条）': 'OR (match any: execute corresponding rules)',
		'并且（全部命中才执行）': 'AND (execute only when all match)',
		关键词: 'Keyword',
		'删除范围': 'Deletion range',
		'命中行': 'Matched line',
		'删除后面全部': 'Delete everything after',
		'删除前面全部': 'Delete everything before',
		'包含命中行': 'Include matched lines',
		'不包含命中行': 'Exclude matched lines',
		'删除': 'Delete',
		'新增截断规则': 'Add trim rule',
		'段落映射': 'Paragraph mapping',
		'关键字（忽略大小写）': 'Keyword (case-insensitive)',
		'输出标签': 'Output label',
		'新增映射': 'Add mapping',
		'保存规则': 'Save rules',
		'恢复默认': 'Reset to defaults',
		'已保存：': 'Saved:',

		// Settings: prompt engines/templates management
		提示词分类: 'Prompt categories',
		引擎选择: 'Engine selection',
		模板管理: 'Template management',
		全局规则: 'Global rules',
		'全局附加规则': 'Global additional rules',
		'「附加系统提示」追加在<strong>各导入场景</strong>模板与曲库说明之后（不含引擎与模板绑定）。':
			'"Additional system prompt" is appended after <strong>each import scenario</strong> template and library notes (excluding engine/template bindings).',

		'AI 引擎': 'AI engines',
		测试: 'Test',
		编辑: 'Edit',
		'尚未添加引擎。': 'No engines added yet.',
		'编辑引擎': 'Edit engine',
		'添加引擎': 'Add engine',
		显示名称: 'Display name',
		模型: 'Model',
		'Base URL（可选）': 'Base URL (optional)',
		'API Key（可选）': 'API Key (optional)',
		'保存修改': 'Save changes',
		取消: 'Cancel',

		// FeatureEnginesAndTemplatesPanel
		'你好，请只回复「测试成功」。': 'Reply only "Test succeeded".',
		'连通性测试：请只回复「测试成功」。当前模板：{{name}}。模板首行：{{preview}}':
			'Connectivity test: reply only "Test succeeded". Current template: {{name}}. First line: {{preview}}',
		'(空)': '(empty)',
		'未指定模板': 'No template specified',
		'模板内容为空': 'Template content is empty',
		'与全局「当前选中引擎」相同': 'Same as the current global selected engine',
		'（未指定）': '(Unspecified)',
		'（内置）': '(Built-in)',
		'提示模板': 'Prompt template',
		'功能引擎与模板': 'Feature engines & templates',
		'未保存更改：点击“保存”使配置生效。':
			'Unsaved changes: click "Save" to apply the configuration.',
		'当前为最新配置。': 'Already up to date.',
		保存: 'Save',
		'曲库元数据': 'Library metadata',
		'从正文推断标题、歌手、类型等，并写入曲库':
			'Infer title, artist, type, etc. from the body text and write them into the library.',
		'曲库元数据 · 补充提示词':
			'Library metadata · Additional prompt',
		'连通性测试（自动生成）': 'Connectivity test (auto-generated)',
		'按当前模板重新生成': 'Regenerate with the current template',

		// MetadataInferenceSettings
		前若干行: 'the first few lines',
		'即标题、作者、类型、标签等曲目档案。流程会取当前谱面':
			'infer from the current sheet the song metadata such as title, author, type and tags. The app will take the',
		'发给模型，返回 JSON 后': 'send to the model, then after receiving JSON,',
		自动写入当前曲目: 'automatically write it back to the current song',
		'引擎与系统模板': 'engine and system template',
		'请在「引擎选择」的「曲库元数据」一行配置。':
			'configure the "AI engines" tab → "library metadata" row.',
		此处仅配置: 'Here only configure',
		附加系统说明: 'additional system notes',
		'user 前置与应用级约束。': 'the user preamble and app-level constraints.',
		'附加系统说明（可选，接在上述内容之后）':
			'Additional system notes (optional; appended after the content above)',
		'例如：优先使用中文标题；标签宁缺毋滥':
			'e.g. Prefer Chinese titles; keep tags minimal.',
		'user 前置说明（前端可改，位于摘录正文之前）':
			'user preamble (editable on the frontend; before the excerpt text)',
		'例如：请结合标题行、by 行、站点标题推断歌曲名与作者；只输出 JSON':
			'e.g. Infer the song title and author using the title line, "by" line, and site title; output JSON only.',
		'应用级补充约束（前端可改，默认追加在 system 末尾）':
			'app-level constraints (editable on the frontend; appended at the end of system by default)',
		'例如：title 必须非空；author 优先输出主唱名；可结合自动检索候选进行核对':
			'e.g. title must be non-empty; author should prefer the lead singer name; you can cross-check with auto-retrieved candidates.',
		'允许的 JSON 键名': 'Allowed JSON key names',
		'模型允许输出的字段名（程序会校验并忽略未知键）':
			'Field names the model is allowed to output (the program validates them and ignores unknown keys).',

		// FeatureTemplateBindingsPanel
		功能选模板: 'Select templates for features',
		'URL 导入': 'URL import',
		文件导入: 'File import',
		粘贴导入: 'Paste import',
		元数据识别: 'Metadata recognition',
	'模板在「模板管理」统一增删改；这里仅为每个功能选择要使用的模板。<strong>系统提示正文以这里的绑定为准</strong>（含元数据识别）。':
			'Templates are managed in "Template management". Here you only select which template each feature uses. The system prompt body follows these bindings (including metadata recognition).',

		// PromptTemplatesPanel
		提示词模板: 'Prompt templates',
		占位符与详细说明: 'Placeholders & detailed help',
		选择模板: 'Select template',
		'无模板（异常）。': 'No templates (unexpected).',
		新模板: 'New template',
		新建模板: 'Create new template',
		正在编辑: 'Editing',
		模板名称: 'Template name',
	'模板正文（system）': 'Template body (system)',
		'确定删除模板「{{name}}」？': 'Delete template "{{name}}"?',
		'新建模板并切换到本场景': 'Create new template and switch to this scene',
		'内置模板不可删除，可新建后删除副本': 'Built-in templates cannot be deleted. Create a new one and delete the copy.',
		'删除此模板': 'Delete this template',
		'无可用模板。': 'No available templates.',

		// Backup (single latest snapshot)
		备份平台: 'Backup platform',
		备份: 'Backup',
		备份设置: 'Backup settings',
		'账号 ID': 'Account ID',
		应用密钥: 'Application key',
		'Bucket 名称': 'Bucket name',
		'S3 Endpoint URL': 'S3 Endpoint URL',
		'区域（Region）': 'Region',
		'Node 代理地址': 'Node proxy URL',
		'备份对象键（Object Key）': 'Backup object key (Object Key)',
		测试连接: 'Test connection',
		恢复: 'Restore',
		'测试连接中…': 'Testing connection…',
		'测试连接成功。': 'Connection test succeeded.',
		'请先填写完整的 Backblaze 配置。':
			'Please fill in the complete Backblaze configuration first.',
		'测试连接失败：': 'Connection test failed: ',
		'正在上传备份到云端…': 'Uploading backup to cloud…',
		'备份失败：': 'Backup failed: ',
		'云端备份完成（已覆盖旧备份文件）。':
			'Cloud backup complete (overwrote the previous backup file).',
		'将应用状态作为 JSON 上传到 Backblaze B2。':
			'Upload the app state as JSON to Backblaze B2.',
		'通过 Node 代理调用 Backblaze S3-Compatible API，避免浏览器 CORS 限制。':
			'Use a Node proxy to call Backblaze S3-Compatible API and avoid browser CORS limitations.',
		'将应用状态备份到云端（覆盖旧备份）。':
			'Backup the app state to the cloud (overwriting the previous backup).',
		'正在检查云端备份数量…': 'Checking cloud backup count…',
		'读取云端备份失败：': 'Failed to read cloud backups: ',
		'云端没有可用备份。': 'No available backup found in the cloud.',
		从云端恢复: 'Restore from the cloud',
		云端共发现: 'Found in cloud:',
		'个备份版本。': 'backup versions.',
		'请选择：': 'Please choose:',
		追加到当前曲库: 'Append to the current library',
		覆盖当前曲库: 'Overwrite the current library',
		'追加恢复失败：': 'Append restore failed: ',
		'覆盖恢复失败：': 'Overwrite restore failed: ',
		'仅保留一个版本：每次备份覆盖旧备份。':
			'Keep only one version: every backup overwrites the previous one.',
		自动备份: 'Auto-backup',
		'间隔（分钟）': 'Interval (minutes)',
		立即备份: 'Backup now',
		下载备份文件: 'Download backup file',
		从备份恢复: 'Restore from backup',
		上次备份时间: 'Last backup time',
		'没有可用备份。': 'No available backup.',
		'恢复将覆盖当前数据，是否继续？':
			'Restoring will overwrite your current data. Continue?',
		确定: 'Confirm',
		取消: 'Cancel',
		'无法生成备份：当前浏览器状态不可用。':
			'Cannot generate backup: current browser state is unavailable.',
		'下载备份失败，请稍后再试。': 'Download failed. Please try again later.',
		'在浏览器中保存应用状态的最新备份（覆盖旧备份）。':
			'Saves the latest app state backup in your browser (overwrites the old backup).',

		// Used in other UI
		'ChordMark source': 'ChordMark source',
	},
};

export default TRANSLATIONS;

