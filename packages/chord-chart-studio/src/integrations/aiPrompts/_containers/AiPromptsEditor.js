import { connect } from 'react-redux';

import { setAiPrompts } from '../actions';
import { getAiPrompts } from '../selectors';

import AiPromptsEditor from '../_components/AiPromptsEditor';

export default connect(
	(state) => {
		const p = getAiPrompts(state);
		return {
			systemPromptAppend: p.systemPromptAppend,
			importUserPromptPreamble: p.importUserPromptPreamble || '',
			connectivityTestUserMessage: p.connectivityTestUserMessage,
			allowedGenresBlockTemplate: p.allowedGenresBlockTemplate || '',
			allowedTagsBlockTemplate: p.allowedTagsBlockTemplate || '',
			authorBindingBlockTemplate: p.authorBindingBlockTemplate || '',
			catalogInjectionBlockTemplate:
				p.catalogInjectionBlockTemplate || '',
			metadataInferenceRuntimePromptAppend:
				p.metadataInferenceRuntimePromptAppend || '',
		};
	},
	{ setAiPrompts }
)(AiPromptsEditor);
