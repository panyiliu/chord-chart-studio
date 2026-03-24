import { connect } from 'react-redux';

import {
	addPromptTemplate,
	removePromptTemplate,
	reorderPromptTemplates,
	updatePromptTemplate,
} from '../actions';
import { getPromptTemplates } from '../selectors';

import PromptTemplatesPanel from '../_components/PromptTemplatesPanel';

export default connect(
	(state) => ({
		templates: getPromptTemplates(state),
	}),
	{
		addPromptTemplate,
		reorderPromptTemplates,
		updatePromptTemplate,
		removePromptTemplate,
	}
)(PromptTemplatesPanel);
