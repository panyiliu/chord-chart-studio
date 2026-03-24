import createAction from '../../core/createAction';
import * as actionTypes from './actionsTypes';

export const addGenre = (id, name) =>
	createAction(actionTypes.DB_CATALOG_ADD_GENRE, { id, name });

export const updateGenre = (id, name) =>
	createAction(actionTypes.DB_CATALOG_UPDATE_GENRE, { id, name });

export const removeGenre = (id) =>
	createAction(actionTypes.DB_CATALOG_REMOVE_GENRE, { id });

export const addTag = (id, name) =>
	createAction(actionTypes.DB_CATALOG_ADD_TAG, { id, name });

export const updateTag = (id, name) =>
	createAction(actionTypes.DB_CATALOG_UPDATE_TAG, { id, name });

export const removeTag = (id) =>
	createAction(actionTypes.DB_CATALOG_REMOVE_TAG, { id });

export const addAuthor = (id, name) =>
	createAction(actionTypes.DB_CATALOG_ADD_AUTHOR, { id, name });

export const removeAuthor = (id) =>
	createAction(actionTypes.DB_CATALOG_REMOVE_AUTHOR, { id });

export const setAuthorsFromCatalogOnly = (value) =>
	createAction(actionTypes.DB_CATALOG_SET_AUTHORS_FROM_CATALOG_ONLY, {
		value: Boolean(value),
	});
