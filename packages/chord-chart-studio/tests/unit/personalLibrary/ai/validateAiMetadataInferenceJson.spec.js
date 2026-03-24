import validateAiMetadataInferenceJson, {
	METADATA_INFERENCE_KEYS,
} from '../../../../src/personalLibrary/ai/validateAiMetadataInferenceJson';

describe('validateAiMetadataInferenceJson', () => {
	const catalogFreeAuthor = {
		genres: [{ id: 'g_pop', name: '流行' }],
		tags: [{ id: 't_slow', name: '慢歌' }],
		authors: [],
		authorsFromCatalogOnly: false,
	};

	test('normalizes title author genre tagIds', () => {
		const patch = validateAiMetadataInferenceJson(catalogFreeAuthor, {
			title: '  Hello ',
			author: 'Someone',
			genreId: 'g_pop',
			tagIds: ['t_slow'],
		});
		expect(patch).toEqual({
			title: 'Hello',
			author: 'Someone',
			genreId: 'g_pop',
			tagIds: ['t_slow'],
		});
	});

	test('accepts songTitle / name as title alias', () => {
		expect(
			validateAiMetadataInferenceJson(catalogFreeAuthor, {
				songTitle: '  Alias ',
			}).title
		).toBe('Alias');
		expect(
			validateAiMetadataInferenceJson(catalogFreeAuthor, {
				name: 'Song Name',
			}).title
		).toBe('Song Name');
	});

	test('METADATA_INFERENCE_KEYS is stable for UI', () => {
		expect(METADATA_INFERENCE_KEYS).toContain('title');
		expect(METADATA_INFERENCE_KEYS).toContain('tagIds');
	});

	test('rejects unknown genreId', () => {
		expect(() =>
			validateAiMetadataInferenceJson(catalogFreeAuthor, {
				genreId: 'nope',
			})
		).toThrow(/不在允许列表/);
	});

	test('authorId mode resolves author name', () => {
		const cat = {
			...catalogFreeAuthor,
			authorsFromCatalogOnly: true,
			authors: [{ id: 'a1', name: '张三' }],
		};
		const patch = validateAiMetadataInferenceJson(cat, {
			authorId: 'a1',
			genreId: 'g_pop',
		});
		expect(patch.author).toBe('张三');
		expect(patch).not.toHaveProperty('authorId');
	});
});
