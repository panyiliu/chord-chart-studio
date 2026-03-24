import combineSectionReducers from 'combine-section-reducers';

import aiEngines from './aiEngines/reducers';
import aiPrompts from './aiPrompts/reducers';
import aiPromptTemplates from './aiPromptTemplates/reducers';

export default combineSectionReducers({
	aiEngines,
	aiPrompts,
	aiPromptTemplates,
});
