import deepFreeze from 'deep-freeze';

import reducers from '../../../../src/db/catalog/reducers';
import * as actions from '../../../../src/db/catalog/actions';

describe('db/catalog: reducers', () => {
	const initial = deepFreeze(reducers());

	test('addGenre', () => {
		const s = reducers(initial, actions.addGenre('g_folk', '民谣'));
		expect(s.genres.some((g) => g.id === 'g_folk')).toBe(true);
	});

	test('removeGenre', () => {
		const s = reducers(initial, actions.removeGenre('genre_pop'));
		expect(s.genres.find((g) => g.id === 'genre_pop')).toBeUndefined();
	});

	test('updateGenre', () => {
		const s = reducers(initial, actions.updateGenre('genre_pop', '流行乐'));
		expect(s.genres.find((g) => g.id === 'genre_pop')?.name).toBe('流行乐');
	});

	test('updateTag', () => {
		const s = reducers(initial, actions.updateTag('tag_live', '现场'));
		expect(s.tags.find((t) => t.id === 'tag_live')?.name).toBe('现场');
	});

	test('setAuthorsFromCatalogOnly', () => {
		const s = reducers(initial, actions.setAuthorsFromCatalogOnly(true));
		expect(s.authorsFromCatalogOnly).toBe(true);
	});
});
