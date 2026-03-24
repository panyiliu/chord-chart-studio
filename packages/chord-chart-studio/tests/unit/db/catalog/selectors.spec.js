import * as selectors from '../../../../src/db/catalog/selectors';

describe('db/catalog: selectors', () => {
	const state = {
		db: {
			catalog: {
				genres: [{ id: 'g1', name: 'A' }],
				tags: [{ id: 't1', name: 'T' }],
				authors: [{ id: 'a1', name: 'Author' }],
				authorsFromCatalogOnly: false,
			},
		},
	};

	test('getGenreIdSet', () => {
		expect(selectors.getGenreIdSet(state).has('g1')).toBe(true);
	});
});
