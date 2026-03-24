import validateAiSheetJson from '../../../../src/personalLibrary/ai/validateAiSheetJson';
import {
	looksLikePlainChordMark,
	wrapPlainChordMarkAsSheetJson,
} from '../../../../src/personalLibrary/ai/wrapPlainChordMarkAsSheetJson';

const catalog = {
	genres: [{ id: 'genre_pop', name: '流行' }],
	tags: [],
	authorsFromCatalogOnly: false,
	authors: [],
};

describe('looksLikePlainChordMark', () => {
	test('detects section markers', () => {
		expect(looksLikePlainChordMark('#v\nC G\n')).toBe(true);
		expect(looksLikePlainChordMark('#i Intro\\nG B')).toBe(true);
	});

	test('rejects JSON-looking output', () => {
		expect(looksLikePlainChordMark('{"title":"x"}')).toBe(false);
	});
});

describe('wrapPlainChordMarkAsSheetJson', () => {
	test('wraps and passes validateAiSheetJson', () => {
		const raw = '#v\nC.. G..\n_ line _ one\n';
		const wrapped = wrapPlainChordMarkAsSheetJson(
			catalog,
			'My song title',
			raw
		);
		expect(wrapped).not.toBeNull();
		const v = validateAiSheetJson(catalog, wrapped);
		expect(v.title).toBe('My song title');
		expect(v.genreId).toBe('genre_pop');
		expect(v.chordMark).toContain('#v');
	});

	test('returns null without genres', () => {
		expect(
			wrapPlainChordMarkAsSheetJson(
				{
					genres: [],
					tags: [],
					authorsFromCatalogOnly: false,
					authors: [],
				},
				'',
				'#v\n|C |'
			)
		).toBeNull();
	});
});
