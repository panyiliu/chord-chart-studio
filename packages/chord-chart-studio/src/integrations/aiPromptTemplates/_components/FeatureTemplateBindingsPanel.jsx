import './PromptTemplatesPanel.scss';

import React from 'react';
import PropTypes from 'prop-types';

import { useI18n } from '../../../ui/i18n/I18nProvider';

function buildAutoConnectivityMessage(templates, bindings, t) {
	const pickOrder = [
		bindings.metadataBoundId,
		bindings.pasteBoundId,
		bindings.fileBoundId,
		bindings.urlBoundId,
	].filter(Boolean);
	const chosen =
		pickOrder
			.map((id) => templates.find((t) => t.id === id))
			.find((t) => t && t.content) || templates.find((t) => t.content);
	if (!chosen) {
		return t('你好，请只回复「测试成功」。');
	}
	const firstLine = String(chosen.content)
		.split(/\r?\n/)
		.map((x) => x.trim())
		.find(Boolean);
	const preview = (firstLine || '').slice(0, 80);
	return t(
		'连通性测试：请只回复「测试成功」。当前模板：{{name}}。模板首行：{{preview}}',
		{ name: chosen.name, preview: preview || t('(空)') }
	);
}

function FeatureTemplateBindingsPanel(props) {
	const {
		templates,
		urlBoundId,
		fileBoundId,
		pasteBoundId,
		metadataBoundId,
		connectivityTestUserMessage,
		onBindUrl,
		onBindFile,
		onBindPaste,
		onBindMetadata,
		setAiPrompts,
	} = props;

	const { t } = useI18n();

	const getTemplatePreview = (id) => {
		const tpl = templates.find((x) => x.id === id);
		if (!tpl || !tpl.content) {
			return t('未指定模板');
		}
		const lines = String(tpl.content)
			.split(/\r?\n/)
			.map((x) => x.trim())
			.filter(Boolean)
			.slice(0, 2);
		return lines.length ? lines.join(' / ') : t('模板内容为空');
	};

	const applyBinding = (kind, value) => {
		if (kind === 'url') onBindUrl(value);
		if (kind === 'file') onBindFile(value);
		if (kind === 'paste') onBindPaste(value);
		if (kind === 'metadata') onBindMetadata(value);

		const next = {
			urlBoundId: kind === 'url' ? value : urlBoundId,
			fileBoundId: kind === 'file' ? value : fileBoundId,
			pasteBoundId: kind === 'paste' ? value : pasteBoundId,
			metadataBoundId: kind === 'metadata' ? value : metadataBoundId,
		};
		setAiPrompts({
			connectivityTestUserMessage: buildAutoConnectivityMessage(
				templates,
				next,
				t
			),
		});
	};

	const renderSelect = (id, value, kind) => (
		<div className="featureTemplateBindingsPanel-field">
			<select
				id={id}
				className="promptTemplatesPanel-input"
				value={value || ''}
				onChange={(e) => applyBinding(kind, e.target.value)}
				disabled={!templates.length}
			>
				<option value="">{t('（未指定）')}</option>
				{templates.map((tpl) => (
					<option key={tpl.id} value={tpl.id}>
						{tpl.name}
						{tpl.isBuiltIn ? t('（内置）') : ''}
					</option>
				))}
			</select>
			<div className="featureTemplateBindingsPanel-preview">
				{getTemplatePreview(value)}
			</div>
		</div>
	);

	return (
		<div className="promptTemplatesPanel">
			<div className="promptTemplatesPanel-title">{t('功能选模板')}</div>
			<p className="promptTemplatesPanel-hint">
				{t(
					'模板在「模板管理」统一增删改；这里仅为每个功能选择要使用的模板。<strong>系统提示正文以这里的绑定为准</strong>（含元数据识别）。'
				)}
			</p>

			<label
				className="promptTemplatesPanel-label"
				htmlFor="tpl-bind-url"
			>
				{t('URL 导入')}
			</label>
			{renderSelect('tpl-bind-url', urlBoundId, 'url')}

			<label
				className="promptTemplatesPanel-label"
				htmlFor="tpl-bind-file"
			>
				{t('文件导入')}
			</label>
			{renderSelect('tpl-bind-file', fileBoundId, 'file')}

			<label
				className="promptTemplatesPanel-label"
				htmlFor="tpl-bind-paste"
			>
				{t('粘贴导入')}
			</label>
			{renderSelect('tpl-bind-paste', pasteBoundId, 'paste')}

			<label
				className="promptTemplatesPanel-label"
				htmlFor="tpl-bind-metadata"
			>
				{t('元数据识别')}
			</label>
			{renderSelect('tpl-bind-metadata', metadataBoundId, 'metadata')}

			<div className="featureTemplateBindingsPanel-connectivity">
				<div className="promptTemplatesPanel-label">
					{t('连通性测试（自动生成）')}
				</div>
				<textarea
					className="promptTemplatesPanel-textarea"
					rows={3}
					value={connectivityTestUserMessage || ''}
					readOnly
				/>
				<button
					type="button"
					className="promptTemplatesPanel-btn"
					onClick={() =>
						setAiPrompts({
							connectivityTestUserMessage:
								buildAutoConnectivityMessage(templates, {
									urlBoundId,
									fileBoundId,
									pasteBoundId,
									metadataBoundId,
								}),
						})
					}
				>
					{t('按当前模板重新生成')}
				</button>
			</div>
		</div>
	);
}

FeatureTemplateBindingsPanel.propTypes = {
	templates: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			isBuiltIn: PropTypes.bool,
		})
	).isRequired,
	urlBoundId: PropTypes.string,
	fileBoundId: PropTypes.string,
	pasteBoundId: PropTypes.string,
	metadataBoundId: PropTypes.string,
	connectivityTestUserMessage: PropTypes.string,
	onBindUrl: PropTypes.func.isRequired,
	onBindFile: PropTypes.func.isRequired,
	onBindPaste: PropTypes.func.isRequired,
	onBindMetadata: PropTypes.func.isRequired,
	setAiPrompts: PropTypes.func.isRequired,
};

FeatureTemplateBindingsPanel.defaultProps = {
	urlBoundId: '',
	fileBoundId: '',
	pasteBoundId: '',
	metadataBoundId: '',
	connectivityTestUserMessage: '',
};

export default FeatureTemplateBindingsPanel;
