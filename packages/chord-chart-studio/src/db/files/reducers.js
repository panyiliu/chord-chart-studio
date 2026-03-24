import _pick from 'lodash/pick';
import clock from '../../core/clock';

import * as actionTypes from './actionsTypes';

import {
	DB_CATALOG_REMOVE_GENRE,
	DB_CATALOG_REMOVE_TAG,
} from '../catalog/actionsTypes';
import { DB_OPTION_SET_OPTION_VALUE } from '../options/actionsTypes';
import { UI_LAYOUT_APP_SET_EDITOR_MODE } from '../../ui/layout/app/_state/actionsTypes';
import { getEditorMode } from '../../ui/layout/app/_state/selectors';
import { getSelectedId } from '../../fileManager/_state/selectors';
import { getLatestModeOptions, getCategoryOptions } from './selectors';
import editorModeOptions from '../options/editorModeOptions';

const initialState = {
	allFiles: {},
};

function createFile(state, action) {
	const { id, title, content, author, genreId, tagIds } = action.payload;

	const allFiles = { ...state.allFiles };
	allFiles[id] = {
		id,
		title,
		content,
		author: author ?? '',
		genreId: genreId ?? null,
		tagIds: Array.isArray(tagIds) ? tagIds : [],
	};

	return {
		...state,
		allFiles,
	};
}

function updateFile(state, action) {
	const { id, title, content, author, genreId, tagIds } = action.payload;

	if (!state.allFiles[id]) {
		return state;
	}

	const hasChange =
		title !== undefined ||
		content !== undefined ||
		author !== undefined ||
		genreId !== undefined ||
		tagIds !== undefined;

	if (!hasChange) {
		return state;
	}

	const allFiles = { ...state.allFiles };

	allFiles[id] = { ...allFiles[id] };

	if (title !== undefined) {
		allFiles[id].title = title;
	}
	if (content !== undefined) {
		allFiles[id].content = content;
	}
	if (author !== undefined) {
		allFiles[id].author = author;
	}
	if (genreId !== undefined) {
		allFiles[id].genreId = genreId;
	}
	if (tagIds !== undefined) {
		allFiles[id].tagIds = Array.isArray(tagIds) ? tagIds : [];
	}
	return {
		...state,
		allFiles,
	};
}

function deleteFile(state, action) {
	const { id } = action.payload;

	if (!id || !state.allFiles[id]) {
		return state;
	}

	const allFiles = { ...state.allFiles };
	delete allFiles[id];

	return {
		...state,
		allFiles,
	};
}

/**
 * 目录中删除某类型后，引用该类型的曲目 genreId 置空。
 * @param {typeof initialState} state
 * @param {string} genreId
 */
function clearGenreIdFromAllFiles(state, genreId) {
	if (!genreId) {
		return state;
	}
	let changed = false;
	const allFiles = { ...state.allFiles };
	Object.keys(allFiles).forEach((fid) => {
		if (allFiles[fid].genreId === genreId) {
			allFiles[fid] = { ...allFiles[fid], genreId: null };
			changed = true;
		}
	});
	return changed ? { ...state, allFiles } : state;
}

/**
 * 目录中删除某标签后，从所有曲目的 tagIds 中移除该 id。
 * @param {typeof initialState} state
 * @param {string} tagId
 */
function removeTagIdFromAllFiles(state, tagId) {
	if (!tagId) {
		return state;
	}
	let changed = false;
	const allFiles = { ...state.allFiles };
	Object.keys(allFiles).forEach((fid) => {
		const cur = allFiles[fid].tagIds;
		const list = Array.isArray(cur) ? cur : [];
		if (!list.includes(tagId)) {
			return;
		}
		allFiles[fid] = {
			...allFiles[fid],
			tagIds: list.filter((t) => t !== tagId),
		};
		changed = true;
	});
	return changed ? { ...state, allFiles } : state;
}

/**
 * Whenever the user set an option, we save it in the song entity, either:
 * - for the current editing mode if it is a formatting option
 * - in the preferences otherwise
 */
function updateFileOption(state, action, fullState) {
	const { context, key, value } = action.payload;
	const id = getSelectedId(fullState);
	const allFiles = { ...state.allFiles };

	if (
		['songFormatting', 'songPreferences'].includes(context) &&
		allFiles[id]
	) {
		const editorMode = getEditorMode(fullState);
		const optionCategory =
			context === 'songPreferences' ? 'preferences' : editorMode;

		allFiles[id] = addOption(allFiles[id], optionCategory, key, value);
		return {
			...state,
			allFiles,
		};
	}
	return state;
}

function addOption(fileState, category, key, value) {
	return {
		...fileState,
		options: {
			...fileState.options,
			[category]: {
				...(fileState.options || {})[category],
				updatedAt: clock(),
				[key]: value,
			},
		},
	};
}

/**
 * When a user switch mode and the target mode does not have any saved settings yet,
 * we apply the latest saved settings (all modes merged) for a better user flow
 */
function setEditorMode(state, action, fullState) {
	const fileId = getSelectedId(fullState);
	const nextMode = action.payload.mode;

	const hasOptionsForNextMode = !!getCategoryOptions(
		fullState,
		fileId,
		nextMode
	);

	if (!hasOptionsForNextMode) {
		const previousModeOptions = _pick(
			getLatestModeOptions(fullState, fileId) || {},
			editorModeOptions[nextMode]
		);

		if (Object.keys(previousModeOptions).length) {
			previousModeOptions.updatedAt = clock();
			const allFiles = { ...state.allFiles };

			allFiles[fileId] = {
				...allFiles[fileId],
				options: {
					...allFiles[fileId].options,
					[nextMode]: previousModeOptions,
				},
			};

			return {
				...state,
				allFiles,
			};
		}
	}
	return state;
}

export default (state = initialState, action = {}, fullState = {}) => {
	switch (action.type) {
		case actionTypes.DB_FILES_CREATE:
		case actionTypes.DB_FILES_IMPORT:
			return createFile(state, action);
		case actionTypes.DB_FILES_UPDATE:
			return updateFile(state, action);
		case actionTypes.DB_FILES_DELETE:
			return deleteFile(state, action);
		case DB_CATALOG_REMOVE_GENRE:
			return clearGenreIdFromAllFiles(state, action.payload.id);
		case DB_CATALOG_REMOVE_TAG:
			return removeTagIdFromAllFiles(state, action.payload.id);
		case DB_OPTION_SET_OPTION_VALUE:
			return updateFileOption(state, action, fullState);
		case UI_LAYOUT_APP_SET_EDITOR_MODE:
			return setEditorMode(state, action, fullState);
	}
	return state;
};
