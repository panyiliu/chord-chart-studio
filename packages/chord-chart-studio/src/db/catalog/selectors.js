export const getCatalog = (state) => state.db.catalog;

export const getGenres = (state) => getCatalog(state).genres;

export const getTags = (state) => getCatalog(state).tags;

export const getAuthors = (state) => getCatalog(state).authors;

export const getAuthorsFromCatalogOnly = (state) =>
	getCatalog(state).authorsFromCatalogOnly;

export const getGenreById = (state, id) =>
	getGenres(state).find((g) => g.id === id);

export const getGenreIdSet = (state) =>
	new Set(getGenres(state).map((g) => g.id));

export const getTagIdSet = (state) => new Set(getTags(state).map((t) => t.id));

export const getAuthorIdSet = (state) =>
	new Set(getAuthors(state).map((a) => a.id));
