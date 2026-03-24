import integrationsReducer from '../../../src/integrations/reducers';
import { addAiEngine } from '../../../src/integrations/aiEngines/actions';

describe('integrations root reducer', () => {
	test('routes aiEngines actions', () => {
		const s = integrationsReducer(undefined, {
			type: '@@INIT',
		});
		expect(s.aiEngines.engines).toEqual([]);

		const s2 = integrationsReducer(
			s,
			addAiEngine({
				id: 'x',
				name: 'X',
				provider: 'openai',
				model: 'gpt-4',
			})
		);
		expect(s2.aiEngines.engines).toHaveLength(1);
	});

	test('includes aiPromptTemplates initial state', () => {
		const s = integrationsReducer(undefined, { type: '@@INIT' });
		expect(s.aiPromptTemplates.templates.length).toBeGreaterThan(0);
		expect(s.aiPromptTemplates.selectedImportTemplateId).toBeTruthy();
		expect(s.aiPromptTemplates.selectedUrlImportTemplateId).toBeTruthy();
		expect(s.aiPromptTemplates.selectedFileImportTemplateId).toBeTruthy();
	});
});
