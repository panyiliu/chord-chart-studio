import db from '../db/seed';
import aiPromptTemplatesSeed from '../integrations/aiPromptTemplates/seed';
import aiPromptsSeed from '../integrations/aiPrompts/seed';

export default {
	db,
	integrations: {
		aiEngines: {
			engines: [],
			selectedEngineId: null,
		},
		aiPrompts: { ...aiPromptsSeed },
		aiPromptTemplates: { ...aiPromptTemplatesSeed },
	},
};
