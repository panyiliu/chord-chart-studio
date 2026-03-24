import './PromptTemplatesPanel.scss';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { useI18n } from '../../../ui/i18n/I18nProvider';

function PromptTemplatesPanel(props) {
	const {
		templates,
		addPromptTemplate,
		reorderPromptTemplates,
		updatePromptTemplate,
		removePromptTemplate,
	} = props;

	const { t } = useI18n();

	// 内置模板当前不出现在「模板管理」列表中（仍保留在系统状态里用于默认导入/绑定）。
	const visibleTemplates = templates.filter((t) => !t.isBuiltIn);

	const [activeId, setActiveId] = useState(
		/** @type {string | null} */ (null)
	);
	const [draftName, setDraftName] = useState('');
	const [draftContent, setDraftContent] = useState('');
	const [draggingId, setDraggingId] = useState(
		/** @type {string | null} */ (null)
	);
	const [dragOverId, setDragOverId] = useState(
		/** @type {string | null} */ (null)
	);

	useEffect(() => {
		if (!visibleTemplates.length) {
			setActiveId(null);
			setDraftName('');
			setDraftContent('');
			return;
		}
		const first = visibleTemplates[0].id;
		if (!activeId || !visibleTemplates.some((t) => t.id === activeId)) {
			setActiveId(first);
		}
	}, [templates, visibleTemplates, activeId]);

	const active = visibleTemplates.find((t) => t.id === activeId);

	useEffect(() => {
		if (active) {
			setDraftName(active.name);
			setDraftContent(active.content);
		}
	}, [activeId, active?.name, active?.content]);

	const onSave = () => {
		if (!active || !draftName.trim()) {
			return;
		}
		updatePromptTemplate(active.id, {
			name: draftName.trim(),
			content: draftContent,
		});
	};

	const onAdd = () => {
		const id = `tmpl_${uuidv4()}`;
		addPromptTemplate({
			id,
			name: t('新模板'),
			content:
				'你是乐谱结构化助手。\n只输出 JSON。\n\n{{ALLOWED_GENRES}}\n\n{{ALLOWED_TAGS}}\n\n{{AUTHOR_BINDING}}',
			isBuiltIn: false,
		});
		setActiveId(id);
	};

	const onDelete = () => {
		if (!active || active.isBuiltIn) {
			return;
		}
		if (
			!window.confirm(
				t('确定删除模板「{{name}}」？', { name: active.name })
			)
		) {
			return;
		}
		removePromptTemplate(active.id);
	};

	const reorderByDrag = (sourceId, targetId) => {
		if (!sourceId || !targetId || sourceId === targetId) return;

		const visibleIds = visibleTemplates.map((t) => t.id);
		const fromIndex = visibleIds.indexOf(sourceId);
		const toIndex = visibleIds.indexOf(targetId);
		if (fromIndex === -1 || toIndex === -1) return;

		const nextVisibleIds = [...visibleIds];
		const [moved] = nextVisibleIds.splice(fromIndex, 1);
		let insertIndex = toIndex;
		// 移除后目标索引会整体右移一步，需要修正插入位置
		if (toIndex > fromIndex) insertIndex = toIndex - 1;
		nextVisibleIds.splice(insertIndex, 0, moved);

		// 保持内置模板在原数组中的位置不变，仅在可见区段内重排。
		const fullOrderIds = templates.map((t) => t.id);
		const hiddenIdSet = new Set(
			templates.filter((t) => t.isBuiltIn).map((t) => t.id)
		);
		let cursor = 0;
		const nextFullOrderIds = fullOrderIds.map((id) => {
			if (hiddenIdSet.has(id)) return id;
			return nextVisibleIds[cursor++];
		});
		if (cursor !== nextVisibleIds.length) return;

		reorderPromptTemplates(nextFullOrderIds);
	};

	return (
		<div className="promptTemplatesPanel promptTemplatesPanel--layout">
			<header className="promptTemplatesPanel-top">
				<div className="promptTemplatesPanel-topText">
					<div className="promptTemplatesPanel-title">{t('提示词模板')}</div>
					<p
						className="promptTemplatesPanel-lead"
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={{
							__html: t(
								'编辑发送给模型的 <strong>system</strong> 正文；在「AI 引擎」分页里为各功能绑定模板。'
							),
						}}
					/>
				</div>
				<details className="promptTemplatesPanel-details">
					<summary className="promptTemplatesPanel-detailsSummary">
						{t('占位符与详细说明')}
					</summary>
					<div className="promptTemplatesPanel-detailsBody">
						<p>
							当前「模板管理」列表 <strong>不显示内置模板</strong>
							（内置模板仍保留在系统里用于默认导入/绑定）。
							如需自定义，请新建模板并在此处编辑。
						</p>
						<p>
							下列占位符由程序在运行时替换（随曲库变化），
							<strong>勿手写假的 id 列表</strong>：
							<code>{' {{ALLOWED_GENRES}} '}</code>
							（类型，含 <code>ALLOWED_GENRE_IDS</code>）、
							<code>{' {{ALLOWED_TAGS}} '}</code>
							（标签）、
							<code>{' {{AUTHOR_BINDING}} '}</code>
							（作者规则）。也可用
							<code>{' {{CATALOG}} '}</code>
							一次注入合并块。未写占位符时，程序会在文末自动追加完整曲库说明。「附加系统提示」仍追加在本段之后。
						</p>
					</div>
				</details>
			</header>

			<div className="promptTemplatesPanel-body">
				<aside
					className="promptTemplatesPanel-sidebar"
					aria-label="模板列表"
				>
					<div className="promptTemplatesPanel-sidebarHead">
						{t('选择模板')}
					</div>
					{visibleTemplates.length ? (
						<ul
							className="promptTemplatesPanel-list"
							role="listbox"
							aria-label="可选模板"
						>
							{visibleTemplates.map((t) => {
								const isActive = activeId === t.id;
								const isDropTarget =
									dragOverId === t.id &&
									draggingId &&
									draggingId !== t.id;
								const className = isActive
									? 'promptTemplatesPanel-pill promptTemplatesPanel-pillActive'
									: 'promptTemplatesPanel-pill';
								return (
									<li
										key={t.id}
										className="promptTemplatesPanel-item"
									>
										<button
											type="button"
											role="option"
											aria-selected={activeId === t.id}
											aria-grabbed={draggingId === t.id}
											className={
												isDropTarget
													? `${className} promptTemplatesPanel-pillDropTarget`
													: className
											}
											onClick={() => setActiveId(t.id)}
											draggable={true}
											onDragStart={(e) => {
												e.dataTransfer.setData(
													'text/plain',
													t.id
												);
												e.dataTransfer.effectAllowed =
													'move';
												setDraggingId(t.id);
												setDragOverId(t.id);
											}}
											onDragOver={(e) => {
												e.preventDefault();
												e.dataTransfer.dropEffect =
													'move';
												if (dragOverId !== t.id)
													setDragOverId(t.id);
											}}
											onDrop={(e) => {
												e.preventDefault();
												const sourceId =
													e.dataTransfer.getData(
														'text/plain'
													) || draggingId;
												reorderByDrag(sourceId, t.id);
												setDraggingId(null);
												setDragOverId(null);
											}}
											onDragEnd={() => {
												setDraggingId(null);
												setDragOverId(null);
											}}
										>
											<span className="promptTemplatesPanel-pillName">
												{t.name}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					) : (
						<p className="promptTemplatesPanel-empty">
							{t('无模板（异常）。')}
						</p>
					)}
					<div className="promptTemplatesPanel-sidebarFoot">
						<button
							type="button"
							className="promptTemplatesPanel-btn promptTemplatesPanel-btnBlock"
							onClick={onAdd}
						>
							＋ {t('新建模板')}
						</button>
					</div>
				</aside>

				{active ? (
					<div className="promptTemplatesPanel-main">
						<div className="promptTemplatesPanel-editorSticky">
							<div className="promptTemplatesPanel-editorStickyText">
								<span className="promptTemplatesPanel-editorStickyLabel">
									{t('正在编辑')}
								</span>
								<span
									className="promptTemplatesPanel-editorStickyName"
									title={draftName || active.name}
								>
									{draftName || active.name}
								</span>
							</div>
							<div className="promptTemplatesPanel-editorStickyActions">
								<button
									type="button"
									className="promptTemplatesPanel-btn promptTemplatesPanel-btnPrimary"
									onClick={onSave}
								>
									{t('保存')}
								</button>
								<button
									type="button"
									className="promptTemplatesPanel-btn"
									onClick={onDelete}
								>
									{t('删除')}
								</button>
							</div>
						</div>

						<div className="promptTemplatesPanel-editor">
							<label
								className="promptTemplatesPanel-label"
								htmlFor="prompt-tpl-name"
							>
								{t('模板名称')}
							</label>
							<input
								id="prompt-tpl-name"
								className="promptTemplatesPanel-input"
								value={draftName}
								onChange={(e) => setDraftName(e.target.value)}
								autoComplete="off"
							/>
							<label
								className="promptTemplatesPanel-label"
								htmlFor="prompt-tpl-content"
							>
								{t('模板正文（system）')}
							</label>
							<textarea
								id="prompt-tpl-content"
								className="promptTemplatesPanel-textarea"
								rows={10}
								value={draftContent}
								onChange={(e) =>
									setDraftContent(e.target.value)
								}
								spellCheck={false}
							/>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

PromptTemplatesPanel.propTypes = {
	templates: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			content: PropTypes.string.isRequired,
			isBuiltIn: PropTypes.bool,
		})
	).isRequired,
	addPromptTemplate: PropTypes.func.isRequired,
	reorderPromptTemplates: PropTypes.func.isRequired,
	updatePromptTemplate: PropTypes.func.isRequired,
	removePromptTemplate: PropTypes.func.isRequired,
};

export default PromptTemplatesPanel;
