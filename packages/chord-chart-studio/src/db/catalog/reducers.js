import * as actionTypes from './actionsTypes';
import seed from './seed';

const initialState = seed;

export default (state = initialState, action = {}) => {
	switch (action.type) {
		case actionTypes.DB_CATALOG_ADD_GENRE: {
			const { id, name } = action.payload;
			if (!id || !name) return state;
			if (state.genres.some((g) => g.id === id)) return state;
			return {
				...state,
				genres: [...state.genres, { id, name }],
			};
		}
		case actionTypes.DB_CATALOG_UPDATE_GENRE: {
			const { id, name } = action.payload;
			if (!id || !name) return state;
			return {
				...state,
				genres: state.genres.map((g) =>
					g.id === id ? { ...g, name } : g
				),
			};
		}
		case actionTypes.DB_CATALOG_REMOVE_GENRE: {
			const { id } = action.payload;
			return {
				...state,
				genres: state.genres.filter((g) => g.id !== id),
			};
		}
		case actionTypes.DB_CATALOG_ADD_TAG: {
			const { id, name } = action.payload;
			if (!id || !name) return state;
			if (state.tags.some((t) => t.id === id)) return state;
			return {
				...state,
				tags: [...state.tags, { id, name }],
			};
		}
		case actionTypes.DB_CATALOG_UPDATE_TAG: {
			const { id, name } = action.payload;
			if (!id || !name) return state;
			return {
				...state,
				tags: state.tags.map((t) => (t.id === id ? { ...t, name } : t)),
			};
		}
		case actionTypes.DB_CATALOG_REMOVE_TAG: {
			const { id } = action.payload;
			return {
				...state,
				tags: state.tags.filter((t) => t.id !== id),
			};
		}
		case actionTypes.DB_CATALOG_ADD_AUTHOR: {
			const { id, name } = action.payload;
			if (!id || !name) return state;
			if (state.authors.some((a) => a.id === id)) return state;
			return {
				...state,
				authors: [...state.authors, { id, name }],
			};
		}
		case actionTypes.DB_CATALOG_REMOVE_AUTHOR: {
			const { id } = action.payload;
			return {
				...state,
				authors: state.authors.filter((a) => a.id !== id),
			};
		}
		case actionTypes.DB_CATALOG_SET_AUTHORS_FROM_CATALOG_ONLY: {
			return {
				...state,
				authorsFromCatalogOnly: action.payload.value,
			};
		}
		default:
			return state;
	}
};
