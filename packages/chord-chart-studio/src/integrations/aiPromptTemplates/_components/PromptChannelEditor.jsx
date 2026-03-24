import './PromptTemplatesPanel.scss';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { useI18n } from '../../../ui/i18n/I18nProvider';

/**
 * 单一导入场景下的提示词编辑器：直接编辑该场景已绑定模板。
 */
function PromptChannelEditor(props) {
	const {
		channelKey,
		title,
		hint,
		templates,
		boundTemplateId,
		onBindTemplate,
		addPromptTemplate,
		updatePromptTemplate,
		removePromptTemplate,
	} = props;

	const { t } = useI18n();

	const [draftName, setDraftName] = useState('');
	const [draftContent, setDraftContent] = useState('');

	const bound =
		templates.find((t) => t.id === boundTemplateId) ?? templates[0] ?? null;

	useEffect(() => {
		if (bound) {
			setDraftName(bound.name);
			setDraftContent(bound.content);
		} else {
			setDraftName('');
			setDraftContent('');
		}
	}, [bound]);

	const onSave = () => {
		if (!bound || !draftName.trim()) {
			return;
		}
		updatePromptTemplate(bound.id, {
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
		onBindTemplate(id);
	};

	const onDelete = () => {
		if (!bound || bound.isBuiltIn) {
			return;
		}
		if (
			!window.confirm(
				t('确定删除模板「{{name}}」？', { name: bound.name })
			)
		) {
			return;
		}
		removePromptTemplate(bound.id);
	};

	return (
		<div className="promptTemplatesPanel promptChannelEditor">
			<div className="promptTemplatesPanel-title">{title}</div>
			<p className="promptTemplatesPanel-hint">{hint}</p>

			<div className="promptTemplatesPanel-toolbar">
				<button
					type="button"
					className="promptTemplatesPanel-btn"
					onClick={onAdd}
				>
					{t('新建模板并切换到本场景')}
				</button>
			</div>

			{bound ? (
				<div className="promptTemplatesPanel-editor">
					<label
						className="promptTemplatesPanel-label"
						htmlFor={`prompt-channel-name-${channelKey}`}
					>
						{t('模板名称')}
					</label>
					<input
						id={`prompt-channel-name-${channelKey}`}
						className="promptTemplatesPanel-input"
						value={draftName}
						onChange={(e) => setDraftName(e.target.value)}
						autoComplete="off"
					/>
					<label
						className="promptTemplatesPanel-label"
						htmlFor={`prompt-channel-content-${channelKey}`}
					>
						{t('模板正文（system）')}
					</label>
					<textarea
						id={`prompt-channel-content-${channelKey}`}
						className="promptTemplatesPanel-textarea"
						rows={12}
						value={draftContent}
						onChange={(e) => setDraftContent(e.target.value)}
						spellCheck={false}
					/>
					<div className="promptTemplatesPanel-actions">
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
							disabled={!!bound.isBuiltIn}
							title={
								bound.isBuiltIn
									? t('内置模板不可删除，可新建后删除副本')
									: undefined
							}
						>
							{t('删除此模板')}
						</button>
					</div>
				</div>
			) : (
				<p className="promptTemplatesPanel-empty">{t('无可用模板。')}</p>
			)}
		</div>
	);
}

PromptChannelEditor.propTypes = {
	channelKey: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	hint: PropTypes.string.isRequired,
	templates: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			content: PropTypes.string.isRequired,
			isBuiltIn: PropTypes.bool,
		})
	).isRequired,
	boundTemplateId: PropTypes.string,
	onBindTemplate: PropTypes.func.isRequired,
	addPromptTemplate: PropTypes.func.isRequired,
	updatePromptTemplate: PropTypes.func.isRequired,
	removePromptTemplate: PropTypes.func.isRequired,
};

PromptChannelEditor.defaultProps = {
	boundTemplateId: '',
};

export default PromptChannelEditor;
