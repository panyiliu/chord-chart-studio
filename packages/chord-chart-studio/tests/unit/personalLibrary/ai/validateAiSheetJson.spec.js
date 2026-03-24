import validateAiSheetJson from '../../../../src/personalLibrary/ai/validateAiSheetJson';
import renderImportSystemPrompt from '../../../../src/personalLibrary/ai/renderImportSystemPrompt';
import { DEFAULT_IMPORT_TEMPLATE_CONTENT } from '../../../../src/integrations/aiPromptTemplates/seed';

const catalog = {
	genres: [{ id: 'genre_pop', name: '流行' }],
	tags: [{ id: 'tag_live', name: '现场版' }],
	authorsFromCatalogOnly: false,
	authors: [],
};

describe('validateAiSheetJson', () => {
	test('accepts valid payload', () => {
		const out = validateAiSheetJson(catalog, {
			title: '测试歌',
			author: '某人',
			genreId: 'genre_pop',
			tagIds: ['tag_live'],
			chordMark: 'Verse\n|C | G |',
		});
		expect(out.title).toBe('测试歌');
		expect(out.genreId).toBe('genre_pop');
		expect(out.tagIds).toEqual(['tag_live']);
	});

	test('rejects bad genreId', () => {
		expect(() =>
			validateAiSheetJson(catalog, {
				title: 'x',
				genreId: 'nope',
				chordMark: '|C |',
			})
		).toThrow(/genreId/);
	});
});

describe('renderImportSystemPrompt (default template)', () => {
	test('includes genre ids and ChordMark', () => {
		const p = renderImportSystemPrompt(
			DEFAULT_IMPORT_TEMPLATE_CONTENT,
			catalog
		);
		expect(p).toContain('genre_pop');
		expect(p).toContain('ChordMark');
		expect(p).toContain('ALLOWED_GENRE_IDS');
		expect(p).toContain('ALLOWED_TAG_IDS');
		expect(p).not.toContain('{{ALLOWED_GENRES}}');
		expect(p).toContain('最高优先级');
		expect(p).toContain('主歌常见错误');
	});

	test('{{CATALOG}} expands to full injected block', () => {
		const p = renderImportSystemPrompt('Intro\n{{CATALOG}}', catalog);
		expect(p).toContain('ALLOWED_GENRE_IDS');
		expect(p).toContain('__APP_INJECT_ALLOWED_TAGS__');
		expect(p).not.toContain('{{CATALOG}}');
	});
});
