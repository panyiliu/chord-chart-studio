import { connect } from 'react-redux';

import { getOptionValue } from '../../../db/options/selectors';

import { inferFileMetadataFromAi } from '../../../integrations/inferFileMetadataFromAi';

import EditorLayout from '../_components/EditorLayout';

export default connect(
	(state) => ({
		theme: getOptionValue(state, 'editorPreferences', 'theme'),
	}),
	{ inferFileMetadataFromAi }
)(EditorLayout);
