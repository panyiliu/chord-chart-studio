import applyBuiltInPromptTemplatesFromSeed from '../../../src/state/applyBuiltInPromptTemplatesFromSeed';
import aiPromptTemplatesSeed from '../../../src/integrations/aiPromptTemplates/seed';

describe('applyBuiltInPromptTemplatesFromSeed', () => {
	test('overwrites built-in tmpl_default content from seed', () => {
		const state = {
			integrations: {
				aiPromptTemplates: {
					templates: [
						{
							id: 'tmpl_default',
							name: '默认（ChordMark JSON）',
							content: 'OLD SHORT STUB',
							isBuiltIn: true,
						},
					],
					selectedImportTemplateId: 'tmpl_default',
				},
			},
		};
		const out = applyBuiltInPromptTemplatesFromSeed(state);
		const t = out.integrations.aiPromptTemplates.templates[0];
		expect(t.content).toBe(
			aiPromptTemplatesSeed.templates.find((x) => x.id === 'tmpl_default')
				.content
		);
		expect(t.content).toContain('最高优先级');
	});

	test('leaves custom templates untouched', () => {
		const state = {
			integrations: {
				aiPromptTemplates: {
					templates: [
						{
							id: 'tmpl_default',
							content: 'x',
							isBuiltIn: true,
						},
						{
							id: 'custom',
							content: 'my custom',
							isBuiltIn: false,
						},
					],
					selectedImportTemplateId: 'custom',
				},
			},
		};
		const out = applyBuiltInPromptTemplatesFromSeed(state);
		expect(out.integrations.aiPromptTemplates.templates[1].content).toBe(
			'my custom'
		);
	});

	test('appends missing built-in templates from seed (e.g. tmpl_from_url)', () => {
		const state = {
			integrations: {
				aiPromptTemplates: {
					templates: [
						{
							id: 'tmpl_default',
							content: 'x',
							isBuiltIn: true,
						},
					],
					selectedImportTemplateId: 'tmpl_default',
				},
			},
		};
		const out = applyBuiltInPromptTemplatesFromSeed(state);
		const ids = out.integrations.aiPromptTemplates.templates.map(
			(t) => t.id
		);
		expect(ids).toContain('tmpl_from_url');
		expect(ids).toContain('tmpl_import_from_file');
		const urlT = out.integrations.aiPromptTemplates.templates.find(
			(t) => t.id === 'tmpl_from_url'
		);
		expect(urlT?.content).toContain('从 URL 导入');
	});
});
