import reducers from '../../../../src/integrations/aiPrompts/reducers';
import { setAiPrompts } from '../../../../src/integrations/aiPrompts/actions';

describe('integrations/aiPrompts reducers', () => {
	test('setAiPrompts merges patch', () => {
		const s = reducers(
			undefined,
			setAiPrompts({ systemPromptAppend: 'x' })
		);
		expect(s.systemPromptAppend).toBe('x');
	});
});
