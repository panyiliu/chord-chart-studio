import { connect } from 'react-redux';

import { getAiPrompts } from '../selectors';
import { setAiPrompts } from '../actions';

import MetadataInferenceSettings from '../_components/MetadataInferenceSettings';

export default connect(
	(state) => {
		const p = getAiPrompts(state);
		return {
			metadataInferencePromptAppend: p.metadataInferencePromptAppend,
			metadataInferenceUserPreamble:
				p.metadataInferenceUserPreamble || '',
			metadataInferenceRuntimePromptAppend:
				p.metadataInferenceRuntimePromptAppend || '',
		};
	},
	{ setAiPrompts }
)(MetadataInferenceSettings);
