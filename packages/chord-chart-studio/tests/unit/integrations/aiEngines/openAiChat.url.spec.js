import { resolveChatCompletionsUrl } from '../../../../src/integrations/aiEngines/openAiChat';

describe('resolveChatCompletionsUrl', () => {
	test('Volcengine Ark api/v3 root appends chat/completions not v1', () => {
		expect(
			resolveChatCompletionsUrl(
				'https://ark.cn-beijing.volces.com/api/v3'
			)
		).toBe('https://ark.cn-beijing.volces.com/api/v3/chat/completions');
	});

	test('responses endpoint maps to chat/completions', () => {
		expect(
			resolveChatCompletionsUrl(
				'https://ark.cn-beijing.volces.com/api/v3/responses'
			)
		).toBe('https://ark.cn-beijing.volces.com/api/v3/chat/completions');
	});

	test('full chat/completions unchanged', () => {
		const u = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
		expect(resolveChatCompletionsUrl(u)).toBe(u);
	});

	test('OpenAI v1 root', () => {
		expect(resolveChatCompletionsUrl('https://api.openai.com/v1')).toBe(
			'https://api.openai.com/v1/chat/completions'
		);
	});
});
