import _defaultsDeep from 'lodash/defaultsDeep';

import { createStore as createReduxStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

import mergeAiEnvIntoInitialState from '../core/mergeAiEnvIntoInitialState';
import applyBuiltInPromptTemplatesFromSeed from './applyBuiltInPromptTemplatesFromSeed';
import { loadState, saveState } from './localStorage';
import allReducers from './reducers';
import seed from './seed';

let store;

export function createStore() {
	const storeEnhancers = composeWithDevTools(
		applyMiddleware(thunkMiddleware)
	);

	const persistedState = loadState();

	// store migrations
	if (persistedState && persistedState.db && persistedState.db.options) {
		delete persistedState.db.options.rendering; // remove old options before the options refactor in v0.9.0
		const ep = persistedState.db.options.editorPreferences;
		if (ep && ep.values && typeof ep.values.uiColorScheme === 'undefined') {
			ep.values.uiColorScheme = 'system';
		}
	}

	/* Reset all options * /
	Object.keys(persistedState.db.files.allFiles).forEach((fileId) => {
		delete persistedState.db.files.allFiles[fileId].options;
	});
	delete persistedState.db.options;
	/**/
	/* misc * /
	delete persistedState.songImporter;
	delete persistedState.fileManager.selected;
	/**/

	let initialState = _defaultsDeep(persistedState, seed);
	initialState = applyBuiltInPromptTemplatesFromSeed(initialState);
	initialState = mergeAiEnvIntoInitialState(initialState);

	store = createReduxStore(allReducers, initialState, storeEnhancers);

	store.subscribe(() => {
		saveState(store.getState());
	});
}

export function getStore() {
	return store;
}
