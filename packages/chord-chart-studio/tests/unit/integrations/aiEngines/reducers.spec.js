import deepFreeze from 'deep-freeze';

import reducers from '../../../../src/integrations/aiEngines/reducers';
import * as actions from '../../../../src/integrations/aiEngines/actions';

describe('integrations/aiEngines: reducers', () => {
	const initial = deepFreeze(reducers());

	const engine = {
		id: 'e1',
		name: 'Test',
		provider: 'openai-compatible',
		baseUrl: 'https://api.example.com/v1',
		model: 'gpt-4o-mini',
		apiKey: 'sk-test',
	};

	test('add and select', () => {
		let s = reducers(initial, actions.addAiEngine(engine));
		expect(s.engines).toHaveLength(1);
		s = reducers(s, actions.selectAiEngine('e1'));
		expect(s.selectedEngineId).toBe('e1');
	});

	test('remove clears selection', () => {
		let s = reducers(initial, actions.addAiEngine(engine));
		s = reducers(s, actions.selectAiEngine('e1'));
		s = reducers(s, actions.removeAiEngine('e1'));
		expect(s.engines).toHaveLength(0);
		expect(s.selectedEngineId).toBeNull();
	});

	test('update patches engine fields', () => {
		let s = reducers(initial, actions.addAiEngine(engine));
		s = reducers(
			s,
			actions.updateAiEngine('e1', {
				model: 'gpt-4o',
				baseUrl: undefined,
			})
		);
		expect(s.engines[0].model).toBe('gpt-4o');
		expect(s.engines[0].baseUrl).toBeUndefined();
	});
});
