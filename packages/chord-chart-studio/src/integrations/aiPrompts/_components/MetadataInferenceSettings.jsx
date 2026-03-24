import './MetadataInferenceSettings.scss';

import React from 'react';
import PropTypes from 'prop-types';

import { METADATA_INFERENCE_KEYS } from '../../../personalLibrary/ai/validateAiMetadataInferenceJson';
import { useI18n } from '../../../ui/i18n/I18nProvider';

function MetadataInferenceSettings(props) {
	const {
		metadataInferencePromptAppend,
		metadataInferenceUserPreamble,
		metadataInferenceRuntimePromptAppend,
		setAiPrompts,
		onDraftChange,
	} = props;

	const { t } = useI18n();

	const keyList = METADATA_INFERENCE_KEYS.join('、');

	const applyChange = (patch) => {
		if (typeof onDraftChange === 'function') {
			onDraftChange(patch);
			return;
		}
		setAiPrompts(patch);
	};

	return (
		<div className="promptTemplatesPanel metadataInferenceSettings">
			<p className="promptTemplatesPanel-hint metadataInferenceSettings-hint">
				<strong>{t('曲库元数据')}</strong>
				{t('即标题、作者、类型、标签等曲目档案。流程会取当前谱面')}
				<strong>{t('前若干行')}</strong>
				{t('发给模型，返回 JSON 后')}
				<strong>{t('自动写入当前曲目')}</strong>。
				<strong>{t('引擎与系统模板')}</strong>
				{t('请在「AI 引擎」分页的「曲库元数据」一行配置。')}
			</p>

			<p className="metadataInferenceSettings-note">
				{t('此处仅配置')}
				<strong>{t('附加系统说明')}</strong>、{t('user 前置与应用级约束。')}
			</p>

			<label
				className="metadataInferenceSettings-label"
				htmlFor="ai-metadata-append"
			>
				{t('附加系统说明（可选，接在上述内容之后）')}
			</label>
			<textarea
				id="ai-metadata-append"
				className="metadataInferenceSettings-textarea promptTemplatesPanel-textarea"
				rows={3}
				value={metadataInferencePromptAppend || ''}
				onChange={(e) =>
					applyChange({
						metadataInferencePromptAppend: e.target.value,
					})
				}
				placeholder={t('例如：优先使用中文标题；标签宁缺毋滥')}
			/>
			<label
				className="metadataInferenceSettings-label"
				htmlFor="ai-metadata-user-preamble"
			>
				{t('user 前置说明（前端可改，位于摘录正文之前）')}
			</label>
			<textarea
				id="ai-metadata-user-preamble"
				className="metadataInferenceSettings-textarea promptTemplatesPanel-textarea"
				rows={4}
				value={metadataInferenceUserPreamble || ''}
				onChange={(e) =>
					applyChange({
						metadataInferenceUserPreamble: e.target.value,
					})
				}
				placeholder={t('例如：请结合标题行、by 行、站点标题推断歌曲名与作者；只输出 JSON')}
			/>
			<label
				className="metadataInferenceSettings-label"
				htmlFor="ai-metadata-runtime-append"
			>
				{t('应用级补充约束（前端可改，默认追加在 system 末尾）')}
			</label>
			<textarea
				id="ai-metadata-runtime-append"
				className="metadataInferenceSettings-textarea promptTemplatesPanel-textarea"
				rows={5}
				value={metadataInferenceRuntimePromptAppend || ''}
				onChange={(e) =>
					applyChange({
						metadataInferenceRuntimePromptAppend: e.target.value,
					})
				}
				placeholder={t('例如：title 必须非空；author 优先输出主唱名；可结合自动检索候选进行核对')}
			/>

			<div
				className="metadataInferenceSettings-keys"
				aria-label={t('允许的 JSON 键名')}
			>
				<div className="metadataInferenceSettings-keysTitle">
					{t('模型允许输出的字段名（程序会校验并忽略未知键）')}
				</div>
				<code className="metadataInferenceSettings-keysCode">
					{keyList}
				</code>
			</div>
		</div>
	);
}

MetadataInferenceSettings.propTypes = {
	metadataInferencePromptAppend: PropTypes.string,
	metadataInferenceUserPreamble: PropTypes.string,
	metadataInferenceRuntimePromptAppend: PropTypes.string,
	setAiPrompts: PropTypes.func,
	onDraftChange: PropTypes.func,
};

MetadataInferenceSettings.defaultProps = {
	metadataInferencePromptAppend: '',
	metadataInferenceUserPreamble: '',
	metadataInferenceRuntimePromptAppend: '',
	onDraftChange: undefined,
};

export default MetadataInferenceSettings;
