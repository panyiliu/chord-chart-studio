import buildUrlImportUserPayload from '../../../../src/personalLibrary/ai/buildUrlImportUserPayload';

describe('buildUrlImportUserPayload', () => {
	test('includes url and body', () => {
		const s = buildUrlImportUserPayload('https://a.com/x', 'hello');
		expect(s).toContain('https://a.com/x');
		expect(s).toContain('hello');
		expect(s).toContain('页面正文');
	});
});
