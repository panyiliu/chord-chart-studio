import { v4 as uuidv4 } from 'uuid';

import createAction from '../../core/createAction';
import * as actionTypes from './actionsTypes';

/**
 * @param {string} title
 * @param {string} [content]
 * @param {{ author?: string, genreId?: string | null, tagIds?: string[] }} [meta]
 */
export const createFile = (title, content = '', meta = {}) => {
	if (!title) {
		throw new TypeError('Cannot create a file without title');
	}
	const payload = {
		id: uuidv4(),
		title,
		content,
		author: meta.author ?? '',
		genreId: meta.genreId ?? null,
		tagIds: Array.isArray(meta.tagIds) ? meta.tagIds : [],
	};
	return createAction(actionTypes.DB_FILES_CREATE, payload);
};

/**
 * @param {string} title
 * @param {string} [content]
 * @param {{ author?: string, genreId?: string | null, tagIds?: string[] }} [meta]
 */
export const importFile = (title, content = '', meta = {}) => {
	if (!title) {
		throw new TypeError('Cannot import a file without title');
	}
	const payload = {
		id: uuidv4(),
		title,
		content,
		author: meta.author ?? '',
		genreId: meta.genreId ?? null,
		tagIds: Array.isArray(meta.tagIds) ? meta.tagIds : [],
	};
	return createAction(actionTypes.DB_FILES_IMPORT, payload);
};

/**
 * @param {string} id
 * @param {{ title?: string, content?: string, author?: string, genreId?: string | null, tagIds?: string[] }} [patch]
 */
export const updateFile = (id, patch = {}) => {
	if (!id) {
		throw new TypeError('Cannot update a file without an id');
	}
	const payload = { id };
	if (patch.title !== undefined) payload.title = patch.title;
	if (patch.content !== undefined) payload.content = patch.content;
	if (patch.author !== undefined) payload.author = patch.author;
	if (patch.genreId !== undefined) payload.genreId = patch.genreId;
	if (patch.tagIds !== undefined) payload.tagIds = patch.tagIds;
	return createAction(actionTypes.DB_FILES_UPDATE, payload);
};

export const deleteFile = (id) => {
	return createAction(actionTypes.DB_FILES_DELETE, { id });
};
