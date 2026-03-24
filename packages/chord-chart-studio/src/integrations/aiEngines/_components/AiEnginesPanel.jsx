import './AiEnginesPanel.scss';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import { testOpenAiEngineConnectionDetailed } from '../openAiChat';
import { useI18n } from '../../../ui/i18n/I18nProvider';

function truncateForDisplay(s, max = 12000) {
	if (!s || typeof s !== 'string') {
		return '';
	}
	if (s.length <= max) {
		return s;
	}
	return `${s.slice(0, max)}\n…（已截断，共 ${s.length} 字符）`;
}

/** @param {Awaited<ReturnType<typeof testOpenAiEngineConnectionDetailed>>} d */
function formatTestDetail(d) {
	const parts = [];
	parts.push(`请求 URL\n${d.requestUrl}`);
	parts.push(
		`\n请求体（JSON，不含 Authorization 头）\n${JSON.stringify(d.requestBody, null, 2)}`
	);
	if (d.networkError) {
		parts.push(`\n客户端/网络错误\n${d.message || ''}`);
		return parts.join('\n');
	}
	parts.push(`\nHTTP 状态\n${d.status} ${d.statusText}`);
	if (d.responseParsed) {
		parts.push(
			`\n响应 JSON（格式化）\n${JSON.stringify(d.responseParsed, null, 2)}`
		);
	} else if (d.responseRaw) {
		parts.push(`\n响应（原始）\n${truncateForDisplay(d.responseRaw)}`);
	}
	if (d.ok && d.assistantText) {
		parts.push(`\n解析出的 assistant 文本\n${d.assistantText}`);
	}
	if (!d.ok && d.errorLine) {
		parts.push(`\n错误信息\n${d.errorLine}`);
	}
	return parts.join('\n');
}

function AiEnginesPanel(props) {
	const {
		engines,
		selectedEngineId,
		connectivityTestUserMessage,
		addAiEngine,
		removeAiEngine,
		selectAiEngine,
		updateAiEngine,
	} = props;

	const { t } = useI18n();

	const [editingId, setEditingId] = useState(
		/** @type {string | null} */ (null)
	);
	const [name, setName] = useState('');
	const [model, setModel] = useState('');
	const [provider, setProvider] = useState('openai-compatible');
	const [baseUrl, setBaseUrl] = useState('');
	const [apiKey, setApiKey] = useState('');
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [testingId, setTestingId] = useState(
		/** @type {string | null} */ (null)
	);
	const [testLines, setTestLines] = useState(
		/** @type {Record<string, string>} */ ({})
	);
	const [testDetails, setTestDetails] = useState(
		/** @type {Record<string, Awaited<ReturnType<typeof testOpenAiEngineConnectionDetailed>>>} */ ({})
	);

	const clearForm = () => {
		setEditingId(null);
		setName('');
		setModel('');
		setProvider('openai-compatible');
		setBaseUrl('');
		setApiKey('');
		setShowCreateForm(false);
	};

	const loadEngineForEdit = (eng) => {
		setEditingId(eng.id);
		setShowCreateForm(true);
		setName(eng.name || '');
		setModel(eng.model || '');
		setProvider(eng.provider || 'openai-compatible');
		setBaseUrl(eng.baseUrl || '');
		setApiKey(eng.apiKey || '');
		selectAiEngine(eng.id);
	};

	const onSubmitForm = (e) => {
		e.preventDefault();
		if (!name.trim() || !model.trim()) {
			return;
		}
		const patch = {
			name: name.trim(),
			model: model.trim(),
			provider: provider.trim() || 'openai-compatible',
			baseUrl: baseUrl.trim() || undefined,
			apiKey: apiKey.trim() || undefined,
		};
		if (editingId) {
			updateAiEngine(editingId, patch);
		} else {
			const id = uuidv4();
			addAiEngine({ id, ...patch });
			selectAiEngine(id);
		}
		clearForm();
	};

	const onRemoveEngine = (eng) => {
		if (editingId === eng.id) {
			clearForm();
		}
		removeAiEngine(eng.id);
	};

	const runTest = async (eng) => {
		setTestingId(eng.id);
		try {
			const detail = await testOpenAiEngineConnectionDetailed(
				eng,
				connectivityTestUserMessage
			);
			setTestDetails((prev) => ({ ...prev, [eng.id]: detail }));
			if (detail.networkError) {
				setTestLines((prev) => ({
					...prev,
					[eng.id]: `错误: ${detail.message || '请求失败'}`,
				}));
				return;
			}
			if (!detail.ok) {
				setTestLines((prev) => ({
					...prev,
					[eng.id]: `HTTP ${detail.status} · ${(detail.errorLine || '').slice(0, 220)}`,
				}));
				return;
			}
			setTestLines((prev) => ({
				...prev,
				[eng.id]: `HTTP ${detail.status} · ${detail.assistantText.slice(0, 280)}`,
			}));
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			setTestLines((prev) => ({
				...prev,
				[eng.id]: `错误: ${msg}`,
			}));
		} finally {
			setTestingId(null);
		}
	};

	return (
		<div className="aiEnginesPanel">
			<div className="aiEnginesPanel-title">{t('AI 引擎')}</div>
			<p className="aiEnginesPanel-hint">
				本地保存。本应用只支持
				<strong> OpenAI 兼容的 Chat Completions</strong>（请求体为
				<code>messages</code>，不是文档里的 Responses API{' '}
				<code>/responses</code> +<code>input</code>）。火山方舟请填 Chat
				地址，例如
				https://ark.cn-beijing.volces.com/api/v3/chat/completions，或只填根路径
				https://ark.cn-beijing.volces.com/api/v3（会自动补
				/chat/completions）。OpenAI 风格根路径仍会补
				/v1/chat/completions。密钥勿提交到公开仓库。若返回
				404（InvalidEndpointOrModel）：「模型」须填控制台
				<strong>推理接入</strong>的 <strong>Endpoint 模型 ID</strong>
				（如 deepseek-v3-2-251201），区分大小写。
			</p>

			{engines.length > 0 ? (
				<ul className="aiEnginesPanel-list">
					{engines.map((eng) => (
						<li
							key={eng.id}
							className={
								editingId === eng.id
									? 'aiEnginesPanel-item aiEnginesPanel-itemEditing'
									: 'aiEnginesPanel-item'
							}
						>
							<div className="aiEnginesPanel-row">
								<label className="aiEnginesPanel-radioLabel">
									<input
										type="radio"
										name="ai-engine-selected"
										checked={selectedEngineId === eng.id}
										onChange={() => selectAiEngine(eng.id)}
									/>
									<span className="aiEnginesPanel-engineName">
										{eng.name}
									</span>
									<span className="aiEnginesPanel-engineMeta">
										{eng.model}
									</span>
								</label>
								<button
									type="button"
									className="aiEnginesPanel-test"
									onClick={() => runTest(eng)}
									disabled={testingId === eng.id}
								>
									{testingId === eng.id ? '…' : t('测试')}
								</button>
								<button
									type="button"
									className="aiEnginesPanel-edit"
									onClick={() => loadEngineForEdit(eng)}
									title="在下方表单中修改"
								>
									{t('编辑')}
								</button>
								<button
									type="button"
									className="aiEnginesPanel-remove"
									onClick={() => onRemoveEngine(eng)}
									aria-label={`删除 ${eng.name}`}
								>
									×
								</button>
							</div>
							{testLines[eng.id] ? (
								<div className="aiEnginesPanel-testLine">
									{testLines[eng.id]}
								</div>
							) : null}
							{testDetails[eng.id] ? (
								<details
									className="aiEnginesPanel-testDetails"
									open
								>
									<summary className="aiEnginesPanel-testDetailsSummary">
										请求数据 · HTTP 状态 · 完整响应
									</summary>
									<pre className="aiEnginesPanel-debugPre">
										{formatTestDetail(testDetails[eng.id])}
									</pre>
								</details>
							) : null}
						</li>
					))}
				</ul>
			) : (
				<p className="aiEnginesPanel-empty">{t('尚未添加引擎。')}</p>
			)}

			<div className="aiEnginesPanel-formTitle">
				{editingId ? t('编辑引擎') : t('添加引擎')}
			</div>
			{!editingId && !showCreateForm ? (
				<button
					type="button"
					className="aiEnginesPanel-submit"
					onClick={() => setShowCreateForm(true)}
				>
					{t('添加引擎')}
				</button>
			) : null}
			{editingId || showCreateForm ? (
				<form className="aiEnginesPanel-form" onSubmit={onSubmitForm}>
				<label
					className="aiEnginesPanel-label"
					htmlFor="ai-engine-name"
				>
					{t('显示名称')}
				</label>
				<input
					id="ai-engine-name"
					className="aiEnginesPanel-input"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="例如 OpenAI"
					autoComplete="off"
				/>
				<label
					className="aiEnginesPanel-label"
					htmlFor="ai-engine-model"
				>
					{t('模型')}
				</label>
				<input
					id="ai-engine-model"
					className="aiEnginesPanel-input"
					value={model}
					onChange={(e) => setModel(e.target.value)}
					placeholder="如 doubao-xxx（须与方舟控制台 Endpoint 模型 ID 一致）"
					autoComplete="off"
				/>
				<p className="aiEnginesPanel-fieldHint">
					火山方舟：勿用手写展示名（如
					Doubao-Seed-1.6-lite）；请打开方舟控制台 → 在线推理 /
					模型，复制该 Endpoint 要求的<strong>模型名称</strong>字段。
				</p>
				<label
					className="aiEnginesPanel-label"
					htmlFor="ai-engine-provider"
				>
					Provider
				</label>
				<input
					id="ai-engine-provider"
					className="aiEnginesPanel-input"
					value={provider}
					onChange={(e) => setProvider(e.target.value)}
					autoComplete="off"
				/>
				<label
					className="aiEnginesPanel-label"
					htmlFor="ai-engine-baseurl"
				>
					{t('Base URL（可选）')}
				</label>
				<input
					id="ai-engine-baseurl"
					className="aiEnginesPanel-input"
					value={baseUrl}
					onChange={(e) => setBaseUrl(e.target.value)}
					placeholder="https://ark.cn-beijing.volces.com/api/v3 或 …/api/v3/chat/completions"
					autoComplete="off"
				/>
				<label className="aiEnginesPanel-label" htmlFor="ai-engine-key">
					{t('API Key（可选）')}
				</label>
				<input
					id="ai-engine-key"
					className="aiEnginesPanel-input"
					type="password"
					value={apiKey}
					onChange={(e) => setApiKey(e.target.value)}
					autoComplete="off"
				/>
				<div className="aiEnginesPanel-formActions">
					<button type="submit" className="aiEnginesPanel-submit">
						{editingId ? t('保存修改') : t('添加引擎')}
					</button>
					{editingId || showCreateForm ? (
						<button
							type="button"
							className="aiEnginesPanel-cancelEdit"
							onClick={clearForm}
						>
							{t('取消')}
						</button>
					) : null}
				</div>
				</form>
			) : null}
		</div>
	);
}

AiEnginesPanel.propTypes = {
	connectivityTestUserMessage: PropTypes.string.isRequired,
	engines: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			model: PropTypes.string.isRequired,
			provider: PropTypes.string,
			baseUrl: PropTypes.string,
			apiKey: PropTypes.string,
		})
	).isRequired,
	selectedEngineId: PropTypes.string,
	addAiEngine: PropTypes.func.isRequired,
	removeAiEngine: PropTypes.func.isRequired,
	selectAiEngine: PropTypes.func.isRequired,
	updateAiEngine: PropTypes.func.isRequired,
};

export default AiEnginesPanel;
