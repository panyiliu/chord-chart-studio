import { connect } from 'react-redux';

import { getPromptTemplates } from '../selectors';
import {
	addPromptTemplate,
	removePromptTemplate,
	updatePromptTemplate,
	reorderPromptTemplates,
} from '../actions';
import { getAiPrompts } from '../../aiPrompts/selectors';
import { setAiPrompts } from '../../aiPrompts/actions';
import { getAllAiEngines } from '../../aiEngines/selectors';

import SettingsPromptsTab from '../../../fileManager/_components/SettingsPromptsTab';

export default connect(
	(state) => {
		const ap = getAiPrompts(state) || {};
		return {
			engines: getAllAiEngines(state),
			templates: getPromptTemplates(state),
			metadataBoundId: ap.metadataInferenceTemplateId || '',
			metadataInferenceEngineId: ap.metadataInferenceEngineId || '',
			metadataInferencePromptAppend:
				ap.metadataInferencePromptAppend || '',
			metadataInferenceUserPreamble:
				ap.metadataInferenceUserPreamble || '',
			metadataInferenceRuntimePromptAppend:
				ap.metadataInferenceRuntimePromptAppend || '',
			connectivityTestUserMessage: ap.connectivityTestUserMessage || '',
		};
	},
	{
		addPromptTemplate,
		updatePromptTemplate,
		removePromptTemplate,
		reorderPromptTemplates,
		selectMetadataPromptTemplate: (id) =>
			setAiPrompts({ metadataInferenceTemplateId: id }),
		setAiPrompts,
	}
)(SettingsPromptsTab);
