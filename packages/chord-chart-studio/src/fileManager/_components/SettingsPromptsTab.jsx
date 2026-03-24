import React, { useState } from 'react';
import PropTypes from 'prop-types';

import PromptTemplatesPanel from '../../integrations/aiPromptTemplates/_components/PromptTemplatesPanel';
import FeatureEnginesAndTemplatesPanel from '../../integrations/aiPromptTemplates/_components/FeatureEnginesAndTemplatesPanel';
import AiPromptsEditor from '../../integrations/aiPrompts/_containers/AiPromptsEditor';
import { useI18n } from '../../ui/i18n/I18nProvider';

function SettingsPromptsTab(props) {
	const {
		engines,
		templates,
		metadataBoundId,
		metadataInferenceEngineId,
		metadataInferencePromptAppend,
		metadataInferenceUserPreamble,
		metadataInferenceRuntimePromptAppend,
		connectivityTestUserMessage,
		addPromptTemplate,
		updatePromptTemplate,
		removePromptTemplate,
		reorderPromptTemplates,
		selectMetadataPromptTemplate,
		setAiPrompts,
	} = props;

	const { t } = useI18n();

	const [sub, setSub] = useState(
		/** @type {'engines' | 'templates' | 'globals'} */ ('templates')
	);

	return (
		<div className="settingsPromptsTab">
			<div
				className="aiSettingsModal-subTabs"
				role="tablist"
				aria-label={t('提示词分类')}
			>
				<button
					type="button"
					className={
						sub === 'templates'
							? 'aiSettingsModal-subTab aiSettingsModal-subTab--active'
							: 'aiSettingsModal-subTab'
					}
					role="tab"
					aria-selected={sub === 'templates'}
					onClick={() => setSub('templates')}
				>
					{t('模板管理')}
				</button>
				<button
					type="button"
					className={
						sub === 'engines'
							? 'aiSettingsModal-subTab aiSettingsModal-subTab--active'
							: 'aiSettingsModal-subTab'
					}
					role="tab"
					aria-selected={sub === 'engines'}
					onClick={() => setSub('engines')}
				>
					{t('AI引擎')}
				</button>
				<button
					type="button"
					className={
						sub === 'globals'
							? 'aiSettingsModal-subTab aiSettingsModal-subTab--active'
							: 'aiSettingsModal-subTab'
					}
					role="tab"
					aria-selected={sub === 'globals'}
					onClick={() => setSub('globals')}
				>
					{t('全局规则')}
				</button>
			</div>

			<div className="aiSettingsModal-subPanel" role="tabpanel">
				<div hidden={sub !== 'templates'}>
					<PromptTemplatesPanel
						templates={templates}
						addPromptTemplate={addPromptTemplate}
						updatePromptTemplate={updatePromptTemplate}
						removePromptTemplate={removePromptTemplate}
						reorderPromptTemplates={reorderPromptTemplates}
					/>
				</div>
				<div hidden={sub !== 'engines'}>
					<FeatureEnginesAndTemplatesPanel
						engines={engines}
						templates={templates}
						metadataBoundId={metadataBoundId}
						metadataInferenceEngineId={metadataInferenceEngineId}
						metadataInferencePromptAppend={
							metadataInferencePromptAppend
						}
						metadataInferenceUserPreamble={
							metadataInferenceUserPreamble
						}
						metadataInferenceRuntimePromptAppend={
							metadataInferenceRuntimePromptAppend
						}
						connectivityTestUserMessage={
							connectivityTestUserMessage
						}
						onBindMetadata={selectMetadataPromptTemplate}
						setAiPrompts={setAiPrompts}
					/>
				</div>
				<div hidden={sub !== 'globals'}>
					<section
						className="settingsPromptsTab-global"
						aria-labelledby="settings-global-prompts-heading"
					>
						<h4
							className="settingsPromptsTab-globalTitle"
							id="settings-global-prompts-heading"
						>
							{t('全局附加规则')}
						</h4>
						<p className="settingsPromptsTab-globalHint">
							{t(
								'「附加系统提示」追加在<strong>各导入场景</strong>模板与曲库说明之后（不含引擎与模板绑定）。'
							)}
						</p>
						<AiPromptsEditor
							showGlobalFields={true}
							showConnectivityField={false}
						/>
					</section>
				</div>
			</div>
		</div>
	);
}

SettingsPromptsTab.propTypes = {
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
			content: PropTypes.string.isRequired,
			isBuiltIn: PropTypes.bool,
		})
	).isRequired,
	metadataBoundId: PropTypes.string,
	metadataInferenceEngineId: PropTypes.string,
	metadataInferencePromptAppend: PropTypes.string,
	metadataInferenceUserPreamble: PropTypes.string,
	metadataInferenceRuntimePromptAppend: PropTypes.string,
	connectivityTestUserMessage: PropTypes.string,
	addPromptTemplate: PropTypes.func.isRequired,
	updatePromptTemplate: PropTypes.func.isRequired,
	removePromptTemplate: PropTypes.func.isRequired,
	reorderPromptTemplates: PropTypes.func.isRequired,
	selectMetadataPromptTemplate: PropTypes.func.isRequired,
	setAiPrompts: PropTypes.func.isRequired,
};

SettingsPromptsTab.defaultProps = {
	metadataBoundId: '',
	metadataInferenceEngineId: '',
	metadataInferencePromptAppend: '',
	metadataInferenceUserPreamble: '',
	metadataInferenceRuntimePromptAppend: '',
	connectivityTestUserMessage: '',
};

export default SettingsPromptsTab;
