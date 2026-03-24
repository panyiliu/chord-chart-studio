import './FeatureEnginesAndTemplatesPanel.scss';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import MetadataInferenceSettings from '../../aiPrompts/_components/MetadataInferenceSettings';
import { useI18n } from '../../../ui/i18n/I18nProvider';

function buildAutoConnectivityMessage(templates, bindings, t) {
	const pickOrder = [bindings.metadataBoundId].filter(Boolean);
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

function FeatureEnginesAndTemplatesPanel(props) {
	const {
		engines,
		templates,
		metadataBoundId,
		metadataInferenceEngineId,
		metadataInferencePromptAppend,
		metadataInferenceUserPreamble,
		metadataInferenceRuntimePromptAppend,
		connectivityTestUserMessage,
		setAiPrompts,
	} = props;

	const { t } = useI18n();

	const [draftMetadataBoundId, setDraftMetadataBoundId] = useState(
		metadataBoundId || ''
	);
	const [draftMetadataInferenceEngineId, setDraftMetadataInferenceEngineId] =
		useState(metadataInferenceEngineId || '');
	const [
		draftConnectivityTestUserMessage,
		setDraftConnectivityTestUserMessage,
	] = useState(connectivityTestUserMessage || '');

	const [
		draftMetadataInferencePromptAppend,
		setDraftMetadataInferencePromptAppend,
	] = useState(metadataInferencePromptAppend || '');
	const [
		draftMetadataInferenceUserPreamble,
		setDraftMetadataInferenceUserPreamble,
	] = useState(metadataInferenceUserPreamble || '');
	const [
		draftMetadataInferenceRuntimePromptAppend,
		setDraftMetadataInferenceRuntimePromptAppend,
	] = useState(metadataInferenceRuntimePromptAppend || '');

	useEffect(() => {
		setDraftMetadataBoundId(metadataBoundId || '');
		setDraftMetadataInferenceEngineId(metadataInferenceEngineId || '');
		setDraftConnectivityTestUserMessage(connectivityTestUserMessage || '');
		setDraftMetadataInferencePromptAppend(
			metadataInferencePromptAppend || ''
		);
		setDraftMetadataInferenceUserPreamble(
			metadataInferenceUserPreamble || ''
		);
		setDraftMetadataInferenceRuntimePromptAppend(
			metadataInferenceRuntimePromptAppend || ''
		);
	}, [
		metadataBoundId,
		metadataInferenceEngineId,
		connectivityTestUserMessage,
		metadataInferencePromptAppend,
		metadataInferenceUserPreamble,
		metadataInferenceRuntimePromptAppend,
	]);

	const isDirty =
		(draftMetadataBoundId || '') !== (metadataBoundId || '') ||
		(draftMetadataInferenceEngineId || '') !==
			(metadataInferenceEngineId || '') ||
		(draftMetadataInferencePromptAppend || '') !==
			(metadataInferencePromptAppend || '') ||
		(draftMetadataInferenceUserPreamble || '') !==
			(metadataInferenceUserPreamble || '') ||
		(draftMetadataInferenceRuntimePromptAppend || '') !==
			(metadataInferenceRuntimePromptAppend || '') ||
		(draftConnectivityTestUserMessage || '') !==
			(connectivityTestUserMessage || '');

	useEffect(() => {
		// 未保存草稿：离开页面/刷新时给出浏览器确认提示。
		if (typeof window === 'undefined') return;
		const prev = window.onbeforeunload;
		if (!isDirty)
			return () => {
				window.onbeforeunload = prev;
			};

		window.onbeforeunload = () => true;
		return () => {
			window.onbeforeunload = prev;
		};
	}, [isDirty]);

	const onSave = () => {
		setAiPrompts({
			metadataInferenceTemplateId: draftMetadataBoundId,
			metadataInferenceEngineId: draftMetadataInferenceEngineId,
			connectivityTestUserMessage: draftConnectivityTestUserMessage,
			metadataInferencePromptAppend: draftMetadataInferencePromptAppend,
			metadataInferenceUserPreamble: draftMetadataInferenceUserPreamble,
			metadataInferenceRuntimePromptAppend:
				draftMetadataInferenceRuntimePromptAppend,
		});
	};

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

	const applyTemplateBinding = (kind, value) => {
		if (kind === 'metadata') {
			setDraftMetadataBoundId(value);
			setDraftConnectivityTestUserMessage(
				buildAutoConnectivityMessage(
					templates,
					{ metadataBoundId: value },
					t
				)
			);
		}
	};

	const setEngine = (field, value) => {
		if (field === 'metadataInferenceEngineId') {
			setDraftMetadataInferenceEngineId(value);
		}
	};

	const renderEngineSelect = (id, field, value) => (
		<select
			id={id}
			className="promptTemplatesPanel-input featureEnginesAndTemplatesPanel-engineSelect"
			value={value || ''}
			onChange={(e) => setEngine(field, e.target.value)}
			disabled={!engines.length}
		>
			<option value="">{t('与全局「当前选中引擎」相同')}</option>
			{engines.map((en) => (
				<option key={en.id} value={en.id}>
					{en.name} · {en.model}
				</option>
			))}
		</select>
	);

	const renderTemplateSelect = (id, value, kind) => (
		<div className="featureEnginesAndTemplatesPanel-templateWrap">
			<select
				id={id}
				className="promptTemplatesPanel-input"
				value={value || ''}
				onChange={(e) => applyTemplateBinding(kind, e.target.value)}
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

	const renderRow = (
		labelMain,
		engineId,
		engineField,
		tplId,
		tplKind,
		tplHtmlId,
		labelSub
	) => (
		<div className="featureEnginesAndTemplatesPanel-row" key={tplKind}>
			<div className="featureEnginesAndTemplatesPanel-rowLabel">
				<span className="featureEnginesAndTemplatesPanel-rowLabelMain">
					{t(labelMain)}
				</span>
				{labelSub ? (
					<span className="featureEnginesAndTemplatesPanel-rowLabelSub">
						{t(labelSub)}
					</span>
				) : null}
			</div>
			<div className="featureEnginesAndTemplatesPanel-rowEngines">
				<label
					className="featureEnginesAndTemplatesPanel-sublabel"
					htmlFor={`eng-${tplKind}`}
				>
					{t('AI引擎')}
				</label>
				{renderEngineSelect(`eng-${tplKind}`, engineField, engineId)}
			</div>
			<div className="featureEnginesAndTemplatesPanel-rowTemplates">
				<label
					className="featureEnginesAndTemplatesPanel-sublabel"
					htmlFor={tplHtmlId}
				>
					{t('提示模板')}
				</label>
				{renderTemplateSelect(tplHtmlId, tplId, tplKind)}
			</div>
		</div>
	);

	return (
		<div className="promptTemplatesPanel featureEnginesAndTemplatesPanel">
			<div className="promptTemplatesPanel-title">
				{t('功能引擎与模板')}
			</div>
			<div
				className={
					isDirty
						? 'featureEnginesAndTemplatesPanel-saveRow featureEnginesAndTemplatesPanel-saveRow--dirty'
						: 'featureEnginesAndTemplatesPanel-saveRow'
				}
				role="status"
				aria-live="polite"
			>
				<span
					className={
						isDirty
							? 'featureEnginesAndTemplatesPanel-saveHint featureEnginesAndTemplatesPanel-saveHint--dirty'
							: 'featureEnginesAndTemplatesPanel-saveHint'
					}
				>
					{isDirty
						? t('未保存更改：点击“保存”使配置生效。')
						: t('当前为最新配置。')}
				</span>
				<button
					type="button"
					className="promptTemplatesPanel-btn promptTemplatesPanel-btnPrimary"
					disabled={!isDirty}
					onClick={onSave}
				>
					{t('保存')}
				</button>
			</div>
			<p
				className="promptTemplatesPanel-hint"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{
					__html: t(
						'各功能可分别指定<strong>AI 引擎</strong>与<strong>提示模板</strong>；引擎留空则沿用「AI 引擎」分页的<strong>当前选中</strong>。模板正文在「模板管理」编辑。'
					),
				}}
			/>

			<div className="featureEnginesAndTemplatesPanel-grid">
				{renderRow(
					'曲库元数据',
					draftMetadataInferenceEngineId,
					'metadataInferenceEngineId',
					draftMetadataBoundId,
					'metadata',
					'tpl-bind-metadata',
					'从正文推断标题、歌手、类型等，并写入曲库'
				)}
			</div>

			<details className="featureEnginesAndTemplatesPanel-metadataFold">
				<summary
					className="featureEnginesAndTemplatesPanel-metadataFoldSummary"
					id="metadata-extra-heading"
				>
					{t('曲库元数据 · 补充提示词')}
				</summary>
				<div className="featureEnginesAndTemplatesPanel-metadataFoldBody">
					<p className="promptTemplatesPanel-hint">
						{t(
							'系统模板由上方「曲库元数据」行的模板决定；此处仅填写附加说明、user 前置与约束。'
						)}
					</p>
					<MetadataInferenceSettings
						metadataInferencePromptAppend={
							draftMetadataInferencePromptAppend
						}
						metadataInferenceUserPreamble={
							draftMetadataInferenceUserPreamble
						}
						metadataInferenceRuntimePromptAppend={
							draftMetadataInferenceRuntimePromptAppend
						}
						onDraftChange={(patch) => {
							if (
								Object.prototype.hasOwnProperty.call(
									patch,
									'metadataInferencePromptAppend'
								)
							) {
								setDraftMetadataInferencePromptAppend(
									patch.metadataInferencePromptAppend
								);
							}
							if (
								Object.prototype.hasOwnProperty.call(
									patch,
									'metadataInferenceUserPreamble'
								)
							) {
								setDraftMetadataInferenceUserPreamble(
									patch.metadataInferenceUserPreamble
								);
							}
							if (
								Object.prototype.hasOwnProperty.call(
									patch,
									'metadataInferenceRuntimePromptAppend'
								)
							) {
								setDraftMetadataInferenceRuntimePromptAppend(
									patch.metadataInferenceRuntimePromptAppend
								);
							}
						}}
					/>
				</div>
			</details>

			<div className="featureTemplateBindingsPanel-connectivity">
				<div className="promptTemplatesPanel-label">
					{t('连通性测试（自动生成）')}
				</div>
				<textarea
					className="promptTemplatesPanel-textarea"
					rows={3}
					value={draftConnectivityTestUserMessage || ''}
					readOnly
				/>
				<button
					type="button"
					className="promptTemplatesPanel-btn"
					onClick={() =>
						setDraftConnectivityTestUserMessage(
							buildAutoConnectivityMessage(
								templates,
								{ metadataBoundId: draftMetadataBoundId },
								t
							)
						)
					}
				>
					{t('按当前模板重新生成')}
				</button>
			</div>
		</div>
	);
}

FeatureEnginesAndTemplatesPanel.propTypes = {
	engines: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			model: PropTypes.string.isRequired,
		})
	).isRequired,
	templates: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			isBuiltIn: PropTypes.bool,
		})
	).isRequired,
	metadataBoundId: PropTypes.string,
	metadataInferenceEngineId: PropTypes.string,
	metadataInferencePromptAppend: PropTypes.string,
	metadataInferenceUserPreamble: PropTypes.string,
	metadataInferenceRuntimePromptAppend: PropTypes.string,
	connectivityTestUserMessage: PropTypes.string,
	setAiPrompts: PropTypes.func.isRequired,
};

FeatureEnginesAndTemplatesPanel.defaultProps = {
	metadataBoundId: '',
	metadataInferenceEngineId: '',
	metadataInferencePromptAppend: '',
	metadataInferenceUserPreamble: '',
	metadataInferenceRuntimePromptAppend: '',
	connectivityTestUserMessage: '',
};

export default FeatureEnginesAndTemplatesPanel;
