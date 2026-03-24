import './AiImportModal.scss';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import Modal from '../../ui/_components/Modal';
import { testOpenAiEngineConnection } from '../../integrations/aiEngines/openAiChat';
import buildUrlImportUserPayload from '../../personalLibrary/ai/buildUrlImportUserPayload';
import { fetchUrlPageText } from '../../integrations/urlFetch/fetchUrlPageText';

const MAX_LOG_RAW_CHARS = 40000;

function formatImportLogEntries(entries) {
	return entries
		.map((entry) => {
			const t = entry.at
				? new Date(entry.at).toLocaleTimeString(undefined, {
						hour12: false,
					})
				: '';
			const head = `[${t}] `;
			switch (entry.type) {
				case 'phase':
					return `${head}${entry.message}`;
				case 'request':
					return `${head}REQUEST\n${JSON.stringify(
						{
							url: entry.url,
							headers: entry.headers,
							requestBody: entry.requestBody,
						},
						null,
						2
					)}`;
				case 'response': {
					const raw = entry.responseRaw || '';
					const truncated =
						raw.length > MAX_LOG_RAW_CHARS
							? `${raw.slice(0, MAX_LOG_RAW_CHARS)}\n\n…(已截断，原长度 ${raw.length})`
							: raw;
					const parsedStr =
						entry.responseParsed !== undefined
							? JSON.stringify(entry.responseParsed, null, 2)
							: 'null';
					return `${head}RESPONSE ${entry.status} ${entry.statusText} ok=${entry.ok}\nparsed:\n${parsedStr}\n\nraw:\n${truncated}`;
				}
				case 'error':
					return `${head}ERROR\n${entry.message}`;
				case 'parse':
					return `${head}PARSE\n${entry.message}\nassistantPreview:\n${entry.assistantPreview}`;
				case 'validate':
					return `${head}VALIDATE\n${entry.message}\n${JSON.stringify(
						entry.parsedJson,
						null,
						2
					)}`;
				case 'success':
					return `${head}SUCCESS\n${entry.message}`;
				default:
					return `${head}${JSON.stringify(entry, null, 2)}`;
			}
		})
		.join('\n\n────────────────\n\n');
}

function AiImportModal(props) {
	const {
		mode,
		closeModal,
		importChordSheetFromAi,
		engines,
		selectedEngineId,
		selectedPasteTemplateId,
		selectedFileTemplateId,
		selectedUrlTemplateId,
		promptTemplates,
		connectivityTestUserMessage,
		hideAiImportEngineSelector,
		urlImportEngineId,
		fileImportEngineId,
		pasteImportEngineId,
	} = props;

	const boundEngineIdForMode =
		mode === 'url'
			? urlImportEngineId
			: mode === 'file'
				? fileImportEngineId
				: pasteImportEngineId;

	const [text, setText] = useState('');
	const [urlInput, setUrlInput] = useState('');
	const [urlPageText, setUrlPageText] = useState('');
	const [fetchBusy, setFetchBusy] = useState(false);
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState('');
	const [engineId, setEngineId] = useState(selectedEngineId || '');
	const [testMsg, setTestMsg] = useState('');
	const [testing, setTesting] = useState(false);
	const [importLog, setImportLog] = useState([]);
	const [logCollapsed, setLogCollapsed] = useState(false);
	const fileInputRef = useRef(null);
	const logEndRef = useRef(null);

	const pushImportLog = useCallback((entry) => {
		setImportLog((prev) => [...prev, { ...entry, at: Date.now() }]);
	}, []);

	useEffect(() => {
		setText('');
		setUrlInput('');
		setUrlPageText('');
		setErr('');
		setTestMsg('');
		const bound = (boundEngineIdForMode || '').trim();
		const fallback = (selectedEngineId || '').trim();
		setEngineId(bound || fallback);
		setImportLog([]);
		setLogCollapsed(false);
	}, [
		mode,
		selectedEngineId,
		boundEngineIdForMode,
		selectedPasteTemplateId,
		selectedFileTemplateId,
		selectedUrlTemplateId,
		promptTemplates,
	]);

	const importTemplateId =
		mode === 'url'
			? selectedUrlTemplateId || ''
			: mode === 'file'
				? selectedFileTemplateId || ''
				: selectedPasteTemplateId || '';

	useEffect(() => {
		if (!logCollapsed && logEndRef.current) {
			logEndRef.current.scrollIntoView({ block: 'end' });
		}
	}, [importLog, logCollapsed]);

	const engineForRun =
		engines.find((e) => e.id === engineId) ?? engines[0] ?? null;

	const onPickFile = (e) => {
		const f = e.target.files && e.target.files[0];
		if (!f) {
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setText(String(reader.result || ''));
		};
		reader.readAsText(f);
	};

	const onTestConnection = async () => {
		if (!engineForRun) {
			setTestMsg('请先添加引擎');
			return;
		}
		setTesting(true);
		setTestMsg('');
		try {
			const out = await testOpenAiEngineConnection(
				engineForRun,
				connectivityTestUserMessage
			);
			setTestMsg(`连通 OK：${out.slice(0, 200)}`);
		} catch (e) {
			setTestMsg(e instanceof Error ? e.message : String(e));
		} finally {
			setTesting(false);
		}
	};

	const onFetchUrl = async () => {
		const u = urlInput.trim();
		if (!u) {
			setErr('请先填写 URL');
			return;
		}
		try {
			new URL(u);
		} catch {
			setErr('URL 格式无效');
			return;
		}
		setFetchBusy(true);
		setErr('');
		try {
			const t = await fetchUrlPageText(u);
			setUrlPageText(t);
		} catch (e) {
			setErr(
				`${e instanceof Error ? e.message : String(e)} — 请手动粘贴「页面正文」`
			);
		} finally {
			setFetchBusy(false);
		}
	};

	const onSubmit = async () => {
		if (!engineForRun) {
			setErr('请先添加并选择 AI 引擎');
			return;
		}
		if (!promptTemplates.length) {
			setErr('请先在「设置 → 提示词模板」中配置模板');
			return;
		}
		let rawText = '';
		if (mode === 'url') {
			const u = urlInput.trim();
			if (!u) {
				setErr('请填写 URL');
				return;
			}
			try {
				new URL(u);
			} catch {
				setErr('URL 格式无效');
				return;
			}
			if (!urlPageText.trim()) {
				setErr(
					'请填写「页面正文」：可先点「尝试抓取」，或手动粘贴页内谱面/歌词'
				);
				return;
			}
			rawText = buildUrlImportUserPayload(u, urlPageText);
		} else if (!text.trim()) {
			setErr('请先输入或选择文本内容');
			return;
		} else {
			rawText = text;
		}
		setBusy(true);
		setErr('');
		setImportLog([]);
		setLogCollapsed(false);
		try {
			await importChordSheetFromAi(
				rawText,
				engineId || engineForRun.id,
				importTemplateId,
				{ onImportLog: pushImportLog }
			);
			closeModal();
		} catch (e) {
			setErr(e instanceof Error ? e.message : String(e));
		} finally {
			setBusy(false);
		}
	};

	const title =
		mode === 'file'
			? 'AI：从文本文件生成曲目'
			: mode === 'url'
				? 'AI：从网页 URL 生成曲目'
				: 'AI：从粘贴文本生成曲目';

	const testResultTone = testing
		? 'loading'
		: testMsg
			? testMsg.startsWith('连通 OK')
				? 'ok'
				: 'err'
			: 'idle';
	const testResultText = testing
		? '正在连接所选引擎，请稍候…'
		: testMsg
			? testMsg
			: '点击「测试连通性」后，接口返回将显示在此。';

	const showLogPanel = busy || importLog.length > 0;
	const logPortal =
		showLogPanel && typeof document !== 'undefined'
			? createPortal(
					<aside
						className={`aiImportLogPanel${logCollapsed ? ' aiImportLogPanel--collapsed' : ''}`}
						aria-label="AI 导入运行日志"
					>
						<div className="aiImportLogPanel-bar">
							<span className="aiImportLogPanel-title">
								运行日志
							</span>
							<span className="aiImportLogPanel-meta">
								{importLog.length} 条
							</span>
							<button
								type="button"
								className="aiImportLogPanel-btn"
								onClick={() => setLogCollapsed((c) => !c)}
							>
								{logCollapsed ? '展开' : '收起'}
							</button>
							<button
								type="button"
								className="aiImportLogPanel-btn"
								onClick={() => setImportLog([])}
								disabled={busy}
							>
								清空
							</button>
						</div>
						{!logCollapsed ? (
							<pre className="aiImportLogPanel-pre">
								{importLog.length
									? formatImportLogEntries(importLog)
									: '等待请求…'}
								<span ref={logEndRef} />
							</pre>
						) : null}
					</aside>,
					document.body
				)
			: null;

	return (
		<>
			<Modal closeModal={closeModal}>
				<div className="aiImportModal">
					<h2 className="aiImportModal-title">{title}</h2>
					<p className="aiImportModal-hint">
						由 AI 产出一条<strong>新曲目</strong>：返回 JSON 中的{' '}
						<code>chordMark</code>{' '}
						会写入中间编辑区。作者/类型/标签由模型按「设置」里的模板与曲库约束填写。
					</p>

					<div className="aiImportModal-section">
						<p className="aiImportModal-fieldHint">
							模板在「设置 → 提示词模板 →
							模板管理」编辑；场景绑定在「AI引擎」分页中配置；本弹窗不再选择模板。
						</p>
					</div>

					{hideAiImportEngineSelector ? (
						<div className="aiImportModal-section">
							<p className="aiImportModal-fieldHint">
								已开启<strong>隐藏引擎选择</strong>
								：将使用「设置 → 提示词模板 → AI引擎」中为
								{mode === 'url'
									? ' URL 导入'
									: mode === 'file'
										? ' 文件导入'
										: ' 粘贴导入'}
								绑定的引擎；未绑定则使用「设置 →
								AI引擎」中的当前选中引擎。
							</p>
							{engineForRun ? (
								<p className="aiImportModal-engineMeta">
									当前调用：{engineForRun.name} ·{' '}
									{engineForRun.model}
									{' · Base：'}
									{engineForRun.baseUrl ||
										'https://api.openai.com/v1'}
								</p>
							) : (
								<p className="aiImportModal-error">
									未找到可用引擎，请先在「设置 →
									AI引擎」中添加。
								</p>
							)}
						</div>
					) : (
						<div className="aiImportModal-section">
							<label
								className="aiImportModal-label"
								htmlFor="ai-import-engine"
							>
								AI 引擎（调用的模型与接口）
							</label>
							<select
								id="ai-import-engine"
								className="aiImportModal-select"
								value={engineId}
								onChange={(e) => setEngineId(e.target.value)}
								disabled={!engines.length}
							>
								{engines.length === 0 ? (
									<option value="">
										（请先在 设置 → AI引擎 中添加引擎）
									</option>
								) : (
									engines.map((eng) => (
										<option key={eng.id} value={eng.id}>
											{eng.name} — {eng.model}
										</option>
									))
								)}
							</select>
							{engineForRun ? (
								<p className="aiImportModal-engineMeta">
									模型：{engineForRun.model}
									{' · '}
									Base：
									{engineForRun.baseUrl ||
										'https://api.openai.com/v1'}
								</p>
							) : null}
						</div>
					)}

					<div className="aiImportModal-testBlock">
						<div className="aiImportModal-testRow">
							<button
								type="button"
								className="aiImportModal-btn aiImportModal-btnSecondary"
								onClick={onTestConnection}
								disabled={testing || !engineForRun}
							>
								{testing ? '测试中…' : '测试连通性'}
							</button>
						</div>
						<div
							className={`aiImportModal-testResult aiImportModal-testResult--${testResultTone}`}
							role="status"
							aria-live="polite"
						>
							{testResultText}
						</div>
					</div>

					{mode === 'file' ? (
						<div className="aiImportModal-row">
							<input
								ref={fileInputRef}
								type="file"
								className="aiImportModal-fileInput"
								accept=".txt,.md,.cho,.crd,.chopro,.text,text/*"
								onChange={onPickFile}
							/>
							<button
								type="button"
								className="aiImportModal-btn aiImportModal-btnSecondary"
								onClick={() => fileInputRef.current?.click()}
							>
								选择文本文件
							</button>
						</div>
					) : null}

					{mode === 'url' ? (
						<>
							<label
								className="aiImportModal-label"
								htmlFor="ai-import-url"
							>
								网页 URL
							</label>
							<p className="aiImportModal-fieldHint">
								多数站点禁止跨域抓取；失败时请把页内谱面或歌词复制到下方「页面正文」。
							</p>
							<div className="aiImportModal-urlRow">
								<input
									id="ai-import-url"
									type="url"
									className="aiImportModal-inputUrl"
									value={urlInput}
									onChange={(e) =>
										setUrlInput(e.target.value)
									}
									placeholder="https://…"
									autoComplete="off"
								/>
								<button
									type="button"
									className="aiImportModal-btn aiImportModal-btnSecondary"
									onClick={onFetchUrl}
									disabled={fetchBusy || busy}
								>
									{fetchBusy ? '抓取中…' : '尝试抓取'}
								</button>
							</div>
							<label
								className="aiImportModal-label"
								htmlFor="ai-import-url-body"
							>
								页面正文
							</label>
							<p className="aiImportModal-fieldHint">
								将发给模型的 user 消息包含 URL
								与此处正文；模板请在「设置 → 提示词模板 → URL
								导入」中维护。
							</p>
							<textarea
								id="ai-import-url-body"
								className="aiImportModal-textarea"
								rows={14}
								value={urlPageText}
								onChange={(e) => setUrlPageText(e.target.value)}
								placeholder="抓取结果或手动粘贴的页面文字…"
							/>
						</>
					) : (
						<>
							<label
								className="aiImportModal-label"
								htmlFor="ai-import-text"
							>
								输入内容（将发给模型的 user 消息）
							</label>
							<p className="aiImportModal-fieldHint">
								粘贴歌词+和弦、纯文本谱、或自然语言描述。不要在此填写本应用的「作者/类型」字段——由
								AI 按模板在 JSON 里输出。
							</p>
							<textarea
								id="ai-import-text"
								className="aiImportModal-textarea"
								rows={14}
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder="在此粘贴或编辑要解析的原文…"
							/>
						</>
					)}
					<div className="aiImportModal-actions">
						<button
							type="button"
							className="aiImportModal-btn"
							onClick={closeModal}
							disabled={busy}
						>
							取消
						</button>
						<button
							type="button"
							className="aiImportModal-btn aiImportModal-btnPrimary"
							onClick={onSubmit}
							disabled={
								busy ||
								!engines.length ||
								!promptTemplates.length
							}
						>
							{busy ? '生成中…' : '生成并打开新曲目'}
						</button>
					</div>
					{err ? <p className="aiImportModal-error">{err}</p> : null}
				</div>
			</Modal>
			{logPortal}
		</>
	);
}

AiImportModal.propTypes = {
	mode: PropTypes.oneOf(['file', 'text', 'url']).isRequired,
	closeModal: PropTypes.func.isRequired,
	importChordSheetFromAi: PropTypes.func.isRequired,
	engines: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			model: PropTypes.string.isRequired,
			baseUrl: PropTypes.string,
			apiKey: PropTypes.string,
		})
	).isRequired,
	selectedEngineId: PropTypes.string,
	connectivityTestUserMessage: PropTypes.string.isRequired,
	selectedPasteTemplateId: PropTypes.string,
	selectedFileTemplateId: PropTypes.string,
	selectedUrlTemplateId: PropTypes.string,
	promptTemplates: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		})
	).isRequired,
	hideAiImportEngineSelector: PropTypes.bool,
	urlImportEngineId: PropTypes.string,
	fileImportEngineId: PropTypes.string,
	pasteImportEngineId: PropTypes.string,
};

AiImportModal.defaultProps = {
	hideAiImportEngineSelector: false,
	urlImportEngineId: '',
	fileImportEngineId: '',
	pasteImportEngineId: '',
};

export default AiImportModal;
