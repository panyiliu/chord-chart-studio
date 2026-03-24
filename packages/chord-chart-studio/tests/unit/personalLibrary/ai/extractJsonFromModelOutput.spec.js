import extractJsonFromModelOutput from '../../../../src/personalLibrary/ai/extractJsonFromModelOutput';

describe('extractJsonFromModelOutput', () => {
	test('parses fenced json', () => {
		const out = extractJsonFromModelOutput('```json\n{"a":1}\n```');
		expect(out).toEqual({ a: 1 });
	});

	test('parses raw object', () => {
		const out = extractJsonFromModelOutput('prefix {"x":"y"} suffix');
		expect(out).toEqual({ x: 'y' });
	});
});
