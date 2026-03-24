import './RawChordTransformSettingsPanel.scss';

import React, { useMemo, useState } from 'react';
import {
	DEFAULT_SECTION_MAPPING,
	DEFAULT_TRIM_RULE_MATCH_MODE,
	DEFAULT_TRIM_RULES,
	getRawChordTransformActiveTemplateId,
	getRawChordTransformCodeTemplates,
	getRawChordTransformFullCode,
	getRawChordTransformOptions,
	resetRawChordTransformFullCode,
	resetRawChordTransformOptions,
	saveRawChordTransformActiveTemplateId,
	saveRawChordTransformCodeTemplates,
	saveRawChordTransformFullCode,
	saveRawChordTransformOptions,
} from '../rawChordTransformOptions';
import { getBuiltInRawChordConverterSource } from '../convertRawChordSheet';

import { useI18n } from '../../../../ui/i18n/I18nProvider';

function toRows(mapping) {
	return Object.entries(mapping || {}).map(([k, v]) => ({
		key: k,
		value: v,
	}));
}

function normalizeRows(rows) {
	const out = {};
	(rows || []).forEach((r) => {
		const k = String(r?.key || '')
			.trim()
			.toLowerCase();
		const v = String(r?.value || '').trim();
		if (k && v) {
			out[k] = v;
		}
	});
	return out;
}

function getDefaultFullCodeDraft() {
	const stored = getRawChordTransformFullCode();
	return stored || getBuiltInRawChordConverterSource();
}

function createTemplateId() {
	return `tpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const BUILTIN_TEMPLATE_ID = 'builtin';

function RawChordTransformSettingsPanel() {
	const { t } = useI18n();
	const initial = useMemo(() => getRawChordTransformOptions(), []);
	const [rows, setRows] = useState(() => toRows(initial.sectionMapping));
	const [trimRules, setTrimRules] = useState(
		(initial.trimRules || DEFAULT_TRIM_RULES).map((x) => ({
			keyword: x.keyword,
			position: x.position === 'before' ? 'before' : 'after',
			includeMatchedLine: x.includeMatchedLine !== false,
		}))
	);
	const [trimRuleMatchMode, setTrimRuleMatchMode] = useState(
		initial.trimRuleMatchMode || DEFAULT_TRIM_RULE_MATCH_MODE
	);
	const [templates, setTemplates] = useState(() =>
		getRawChordTransformCodeTemplates()
	);
	const [activeTemplateId, setActiveTemplateId] = useState(() =>
		getRawChordTransformActiveTemplateId() || BUILTIN_TEMPLATE_ID
	);
	const builtInCode = getBuiltInRawChordConverterSource();
	const isBuiltinTemplate = activeTemplateId === BUILTIN_TEMPLATE_ID;
	const activeCustomTemplate = templates.find((x) => x.id === activeTemplateId);
	const [savedAt, setSavedAt] = useState(0);
	const [codeDraft, setCodeDraft] = useState(() => {
		const activeId = getRawChordTransformActiveTemplateId();
		const storedTemplates = getRawChordTransformCodeTemplates();
		if (activeId !== 'builtin') {
			const selected = storedTemplates.find((x) => x.id === activeId);
			if (selected?.code) {
				return selected.code;
			}
		}
		return getDefaultFullCodeDraft();
	});
	const [codeError, setCodeError] = useState('');
	const [isEditingTemplate, setIsEditingTemplate] = useState(false);
	const [editingTemplateId, setEditingTemplateId] = useState(
		/** @type {string | null} */ (null)
	);
	const [templateNameDraft, setTemplateNameDraft] = useState('');
	const [templateCodeDraft, setTemplateCodeDraft] = useState('');
	const [activeTab, setActiveTab] = useState(
		/** @type {'trim' | 'mapping' | 'code'} */ ('trim')
	);

	const onSave = () => {
		const sectionMapping = normalizeRows(rows);
		const nextTrimRules = trimRules
			.map((x) => ({
				keyword: String(x?.keyword || '').trim(),
				position: x?.position === 'before' ? 'before' : 'after',
				includeMatchedLine: x?.includeMatchedLine !== false,
			}))
			.filter((x) => x.keyword);
		saveRawChordTransformOptions({
			sectionMapping,
			trimRules: nextTrimRules,
			trimRuleMatchMode: trimRuleMatchMode === 'and' ? 'and' : 'or',
		});
		setCodeError('');
		setSavedAt(Date.now());
	};

	const onReset = () => {
		if (!window.confirm(t('确认恢复默认？这会清空当前模板启用状态并还原规则。'))) {
			return;
		}
		resetRawChordTransformOptions();
		setRows(toRows(DEFAULT_SECTION_MAPPING));
		setTrimRules([...DEFAULT_TRIM_RULES]);
		setTrimRuleMatchMode(DEFAULT_TRIM_RULE_MATCH_MODE);
		resetRawChordTransformFullCode();
		saveRawChordTransformActiveTemplateId(BUILTIN_TEMPLATE_ID);
		setActiveTemplateId(BUILTIN_TEMPLATE_ID);
		setCodeDraft(builtInCode);
		setIsEditingTemplate(false);
		setEditingTemplateId(null);
		setCodeError('');
		setSavedAt(Date.now());
	};

	const onSelectTemplate = (nextId) => {
		setActiveTemplateId(nextId);
		saveRawChordTransformActiveTemplateId(nextId);
		if (nextId === BUILTIN_TEMPLATE_ID) {
			setCodeDraft(builtInCode);
			resetRawChordTransformFullCode();
			setCodeError('');
			return;
		}
		const selected = templates.find((x) => x.id === nextId);
		const source = selected?.code || builtInCode;
		setCodeDraft(source);
		saveRawChordTransformFullCode(source);
		setCodeError('');
	};

	const onStartCreateTemplate = () => {
		setIsEditingTemplate(true);
		setEditingTemplateId(null);
		setTemplateNameDraft(`我的模板 ${templates.length + 1}`);
		setTemplateCodeDraft(String(codeDraft || '').trim() || builtInCode);
		setCodeError('');
	};

	const onStartEditTemplate = (templateId) => {
		const target = templates.find((x) => x.id === templateId);
		if (!target) return;
		setIsEditingTemplate(true);
		setEditingTemplateId(templateId);
		setTemplateNameDraft(target.name);
		setTemplateCodeDraft(target.code || builtInCode);
		setCodeError('');
	};

	const onCancelEditTemplate = () => {
		setIsEditingTemplate(false);
		setEditingTemplateId(null);
		setTemplateNameDraft('');
		setTemplateCodeDraft('');
		setCodeError('');
	};

	const onSaveTemplate = () => {
		const name = String(templateNameDraft || '').trim();
		const source = String(templateCodeDraft || '').trim();
		if (!name) {
			setCodeError(t('模板名称不能为空'));
			return;
		}
		if (!source) {
			setCodeError(t('代码不能为空'));
			return;
		}
		if (editingTemplateId) {
			const next = templates.map((x) =>
				x.id === editingTemplateId ? { ...x, name, code: source } : x
			);
			setTemplates(next);
			saveRawChordTransformCodeTemplates(next);
			onSelectTemplate(editingTemplateId);
		} else {
			const id = createTemplateId();
			const next = [...templates, { id, name, code: source }];
			setTemplates(next);
			saveRawChordTransformCodeTemplates(next);
			onSelectTemplate(id);
		}
		onCancelEditTemplate();
		setSavedAt(Date.now());
	};

	const onDeleteTemplate = (templateId) => {
		const target = templates.find((x) => x.id === templateId);
		if (!target) return;
		if (!window.confirm(t('确认删除模板「{{name}}」？删除后无法恢复。').replace('{{name}}', target.name))) {
			return;
		}
		const next = templates.filter((x) => x.id !== templateId);
		setTemplates(next);
		saveRawChordTransformCodeTemplates(next);
		if (activeTemplateId === templateId) {
			onSelectTemplate(BUILTIN_TEMPLATE_ID);
		}
		if (editingTemplateId === templateId) {
			onCancelEditTemplate();
		}
		setSavedAt(Date.now());
	};

	return (
		<div className="promptTemplatesPanel rawChordTransformSettingsPanel">
			<div className="promptTemplatesPanel-title">{t('ChordMark 整理')}</div>
			<p className="rawChordTransformSettingsPanel-intro">
				以下选项对应主界面「整理为 ChordMark」及旁帮助按钮说明中的
				<strong>可配置部分</strong>
				；保存后立即生效并写入本机。内置识别顺序为：先抓歌手再跑截断规则，最后逐行转换并在顶部插入
				Artist 行。
			</p>
			<div className="rawChordTransformSettingsPanel-tabs" role="tablist">
				<button
					type="button"
					className={
						activeTab === 'trim'
							? 'rawChordTransformSettingsPanel-tab rawChordTransformSettingsPanel-tab--active'
							: 'rawChordTransformSettingsPanel-tab'
					}
					role="tab"
					aria-selected={activeTab === 'trim'}
					onClick={() => setActiveTab('trim')}
				>
					{t('噪声截断')}
				</button>
				<button
					type="button"
					className={
						activeTab === 'mapping'
							? 'rawChordTransformSettingsPanel-tab rawChordTransformSettingsPanel-tab--active'
							: 'rawChordTransformSettingsPanel-tab'
					}
					role="tab"
					aria-selected={activeTab === 'mapping'}
					onClick={() => setActiveTab('mapping')}
				>
					{t('段落映射')}
				</button>
				<button
					type="button"
					className={
						activeTab === 'code'
							? 'rawChordTransformSettingsPanel-tab rawChordTransformSettingsPanel-tab--active'
							: 'rawChordTransformSettingsPanel-tab'
					}
					role="tab"
					aria-selected={activeTab === 'code'}
					onClick={() => setActiveTab('code')}
				>
					{t('规则代码(JS)')}
				</button>
			</div>

			<div className="rawChordTransformSettingsPanel-sections">
				<section
					className="rawChordTransformSettingsPanel-section"
					aria-labelledby="rtc-s1-title"
					hidden={activeTab !== 'code'}
				>
					<div className="rawChordTransformSettingsPanel-sectionHeader">
						<div className="rawChordTransformSettingsPanel-sectionTitles">
							<h3
								className="rawChordTransformSettingsPanel-sectionTitle"
								id="rtc-s1-title"
							>
								{t('规则模板')}
							</h3>
							<p className="rawChordTransformSettingsPanel-sectionLead">
								{t('直接点选即可启用模板。当前启用模板会有勾选标识。内置模板只读，自定义模板可编辑和删除。')}
							</p>
						</div>
					</div>
					<div className="rawChordTransformSettingsPanel-templateList">
						<button
							type="button"
							className="rawChordTransformSettingsPanel-templateRow"
							onClick={() => onSelectTemplate(BUILTIN_TEMPLATE_ID)}
						>
							<span className="rawChordTransformSettingsPanel-templateCheck">
								{activeTemplateId === BUILTIN_TEMPLATE_ID ? '✓' : ''}
							</span>
							<span className="rawChordTransformSettingsPanel-templateName">
								{t('内置模板（只读）')}
							</span>
						</button>
						{templates.map((tpl) => (
							<div key={tpl.id} className="rawChordTransformSettingsPanel-templateRowWrap">
								<button
									type="button"
									className="rawChordTransformSettingsPanel-templateRow"
									onClick={() => onSelectTemplate(tpl.id)}
								>
									<span className="rawChordTransformSettingsPanel-templateCheck">
										{activeTemplateId === tpl.id ? '✓' : ''}
									</span>
									<span className="rawChordTransformSettingsPanel-templateName">
										{tpl.name}
									</span>
								</button>
								<div className="rawChordTransformSettingsPanel-templateActions">
									<button
										type="button"
										className="promptTemplatesPanel-btn"
										onClick={() => onStartEditTemplate(tpl.id)}
									>
										{t('编辑')}
									</button>
									<button
										type="button"
										className="promptTemplatesPanel-btn"
										onClick={() => onDeleteTemplate(tpl.id)}
									>
										{t('删除')}
									</button>
								</div>
							</div>
						))}
					</div>
					<div className="promptTemplatesPanel-actions">
						<button
							type="button"
							className="promptTemplatesPanel-btn"
							onClick={onStartCreateTemplate}
						>
							{t('新增模板')}
						</button>
					</div>
				</section>

				<section
					className="rawChordTransformSettingsPanel-section"
					aria-labelledby="rtc-s2-title"
					hidden={activeTab !== 'trim'}
				>
					<div className="rawChordTransformSettingsPanel-sectionHeader">
						<div className="rawChordTransformSettingsPanel-sectionTitles">
							<h3
								className="rawChordTransformSettingsPanel-sectionTitle"
								id="rtc-s2-title"
							>
								{t('噪声截断')}
							</h3>
							<p className="rawChordTransformSettingsPanel-sectionLead">
								在段落映射与和弦整理<strong>之前</strong>
								按行过滤；关键词为包含匹配（忽略大小写，空白会合并）。
								多行条件可在关键词框内直接换行，或在一行里用字面量
								<code>\n</code>
								表示换行（例如上一行是
								<code>X</code>、下一行是
								<code>Last update:</code>
								）。多行命中时：选「不包含命中行」则从
								<strong>匹配块最后一行之后</strong>
								开始删（整块保留）；选「包含命中行」则从
								<strong>匹配块第一行</strong>
								起删（整块及之后都去掉）。
							</p>
						</div>
					</div>
					<div className="rawChordTransformSettingsPanel-toolbarRow">
						<label
							className="promptTemplatesPanel-label"
							htmlFor="trim-rule-mode"
						>
							{t('规则关系')}
						</label>
						<select
							id="trim-rule-mode"
							className="promptTemplatesPanel-input"
							value={trimRuleMatchMode}
							onChange={(e) =>
								setTrimRuleMatchMode(
									e.target.value === 'and' ? 'and' : 'or'
								)
							}
						>
							<option value="or">
								{t('或者（命中几条执行几条）')}
							</option>
							<option value="and">
								{t('并且（全部命中才执行）')}
							</option>
						</select>
					</div>
					<div className="rawChordTransformSettingsPanel-gridHead">
						<span>{t('关键词')}</span>
						<span>{t('删除范围')}</span>
						<span>{t('命中行')}</span>
						<span />
					</div>
					{trimRules.map((row, idx) => (
						<div
							className="rawChordTransformSettingsPanel-gridRow rawChordTransformSettingsPanel-gridRow--keywords"
							key={idx}
						>
							<textarea
								className="promptTemplatesPanel-input rawChordTransformSettingsPanel-keyword"
								rows={2}
								value={row.keyword}
								onChange={(e) =>
									setTrimRules((prev) =>
										prev.map((x, i) =>
											i === idx
												? {
														...x,
														keyword: e.target.value,
													}
												: x
										)
									)
								}
								placeholder={
									'多行可换行；或一行写 X\\nLast update:'
								}
								spellCheck={false}
							/>
							<select
								className="promptTemplatesPanel-input"
								value={row.position}
								onChange={(e) =>
									setTrimRules((prev) =>
										prev.map((x, i) =>
											i === idx
												? {
														...x,
														position:
															e.target.value ===
															'before'
																? 'before'
																: 'after',
													}
												: x
										)
									)
								}
							>
								<option value="after">
									{t('删除后面全部')}
								</option>
								<option value="before">
									{t('删除前面全部')}
								</option>
							</select>
							<select
								className="promptTemplatesPanel-input"
								value={
									row.includeMatchedLine !== false
										? 'yes'
										: 'no'
								}
								onChange={(e) =>
									setTrimRules((prev) =>
										prev.map((x, i) =>
											i === idx
												? {
														...x,
														includeMatchedLine:
															e.target.value ===
															'yes',
													}
												: x
										)
									)
								}
							>
								<option value="yes">{t('包含命中行')}</option>
								<option value="no">{t('不包含命中行')}</option>
							</select>
							<button
								type="button"
								className="promptTemplatesPanel-btn"
								onClick={() =>
									setTrimRules((prev) =>
										prev.filter((_, i) => i !== idx)
									)
								}
							>
								{t('删除')}
							</button>
						</div>
					))}
					<button
						type="button"
						className="promptTemplatesPanel-btn rawChordTransformSettingsPanel-addBtn"
						onClick={() =>
							setTrimRules((prev) => [
								...prev,
								{
									keyword: '',
									position: 'after',
									includeMatchedLine: true,
								},
							])
						}
					>
						{t('新增截断规则')}
					</button>
				</section>

				<section
					className="rawChordTransformSettingsPanel-section"
					aria-labelledby="rtc-s3-title"
					hidden={activeTab !== 'mapping'}
				>
					<div className="rawChordTransformSettingsPanel-sectionHeader">
						<div className="rawChordTransformSettingsPanel-sectionTitles">
							<h3
								className="rawChordTransformSettingsPanel-sectionTitle"
								id="rtc-s3-title"
							>
								{t('段落映射')}
							</h3>
							<p className="rawChordTransformSettingsPanel-sectionLead">
								正文行若<strong>包含</strong>
								下列英文片段（忽略大小写），则整行替换为右侧
								ChordMark 段落标签（如 <code>#v</code>）。
							</p>
						</div>
					</div>
					<div className="rawChordTransformSettingsPanel-gridHead">
						<span>{t('关键字（忽略大小写）')}</span>
						<span>{t('输出标签')}</span>
						<span />
					</div>
					{rows.map((row, idx) => (
						<div
							className="rawChordTransformSettingsPanel-gridRow"
							key={idx}
						>
							<input
								className="promptTemplatesPanel-input"
								value={row.key}
								onChange={(e) =>
									setRows((prev) =>
										prev.map((x, i) =>
											i === idx
												? { ...x, key: e.target.value }
												: x
										)
									)
								}
								placeholder="例如 verse"
							/>
							<input
								className="promptTemplatesPanel-input"
								value={row.value}
								onChange={(e) =>
									setRows((prev) =>
										prev.map((x, i) =>
											i === idx
												? {
														...x,
														value: e.target.value,
													}
												: x
										)
									)
								}
								placeholder="例如 #v"
							/>
							<button
								type="button"
								className="promptTemplatesPanel-btn"
								onClick={() =>
									setRows((prev) =>
										prev.filter((_, i) => i !== idx)
									)
								}
							>
								{t('删除')}
							</button>
						</div>
					))}
					<button
						type="button"
						className="promptTemplatesPanel-btn rawChordTransformSettingsPanel-addBtn"
						onClick={() =>
							setRows((prev) => [
								...prev,
								{ key: '', value: '#v' },
							])
						}
					>
						{t('新增映射')}
					</button>
				</section>
			</div>
			<section className="rawChordTransformSettingsPanel-section">
				<div hidden={activeTab !== 'code'}>
				<div className="rawChordTransformSettingsPanel-sectionHeader">
					<div className="rawChordTransformSettingsPanel-sectionTitles">
						<h3 className="rawChordTransformSettingsPanel-sectionTitle">
							{t('高级：完整规则代码（JS）')}
						</h3>
						<p className="rawChordTransformSettingsPanel-sectionLead">
							{t('这里是完整转换器源码。你可以直接覆盖算法细节（换行、和弦识别、和弦落点、Artist 处理等）。')}
						</p>
					</div>
				</div>
				{activeTemplateId !== BUILTIN_TEMPLATE_ID ? (
					<p className="rawChordTransformSettingsPanel-fieldHint">
						{t('当前启用模板：')} <strong>{activeCustomTemplate?.name}</strong>
					</p>
				) : (
					<p className="rawChordTransformSettingsPanel-fieldHint">
						{t('当前启用模板：内置模板（只读）')}
					</p>
				)}
				{isEditingTemplate ? (
					<div className="rawChordTransformSettingsPanel-editBox">
						<div className="rawChordTransformSettingsPanel-field">
							<label className="rawChordTransformSettingsPanel-fieldLabel" htmlFor="template-name-input">
								{t('模板名称')}
							</label>
							<input
								id="template-name-input"
								className="promptTemplatesPanel-input"
								value={templateNameDraft}
								onChange={(e) => setTemplateNameDraft(e.target.value)}
								placeholder={t('请输入模板名称')}
								autoComplete="off"
								spellCheck={false}
							/>
						</div>
						<textarea
							className="promptTemplatesPanel-textarea rawChordTransformSettingsPanel-json"
							rows={12}
							value={templateCodeDraft}
							onChange={(e) => setTemplateCodeDraft(e.target.value)}
							spellCheck={false}
						/>
						<div className="promptTemplatesPanel-actions rawChordTransformSettingsPanel-actionsAligned">
							<button type="button" className="promptTemplatesPanel-btn promptTemplatesPanel-btnPrimary" onClick={onSaveTemplate}>
								{t('保存模板')}
							</button>
							<button type="button" className="promptTemplatesPanel-btn" onClick={onCancelEditTemplate}>
								{t('取消编辑')}
							</button>
						</div>
					</div>
				) : null}
				<textarea
					className="promptTemplatesPanel-textarea rawChordTransformSettingsPanel-json"
					rows={12}
					value={codeDraft}
					onChange={(e) => setCodeDraft(e.target.value)}
					readOnly
					spellCheck={false}
				/>
				{codeError ? (
					<p className="rawChordTransformSettingsPanel-jsonError">{codeError}</p>
				) : null}
				</div>
			</section>

			<div className="promptTemplatesPanel-actions rawChordTransformSettingsPanel-actionsAligned">
				<button
					type="button"
					className="promptTemplatesPanel-btn promptTemplatesPanel-btnPrimary"
					onClick={onSave}
				>
					{t('保存规则')}
				</button>
				<button
					type="button"
					className="promptTemplatesPanel-btn"
					onClick={onReset}
				>
					{t('恢复默认')}
				</button>
			</div>
			{savedAt ? (
				<p className="rawChordTransformSettingsPanel-savedTip">
					{t('已保存：')} {new Date(savedAt).toLocaleTimeString()}
				</p>
			) : null}
		</div>
	);
}

export default RawChordTransformSettingsPanel;
