import { useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';

import { getOptionValue } from '../../db/options/selectors';

function subscribePreferredDark(cb) {
	const mql = window.matchMedia('(prefers-color-scheme: dark)');
	mql.addEventListener('change', cb);
	return () => mql.removeEventListener('change', cb);
}

function getPreferredIsDark() {
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Resolved UI theme for `.theme-light` / `.theme-dark` (SCSS themify).
 * @returns {'light' | 'dark'}
 */
export function useEffectiveUiTheme() {
	const scheme =
		useSelector((state) =>
			getOptionValue(state, 'editorPreferences', 'uiColorScheme')
		) ?? 'system';

	const systemIsDark = useSyncExternalStore(
		scheme === 'system' ? subscribePreferredDark : () => () => {},
		scheme === 'system' ? getPreferredIsDark : () => false,
		() => false
	);

	if (scheme === 'light') {
		return 'light';
	}
	if (scheme === 'dark') {
		return 'dark';
	}
	return systemIsDark ? 'dark' : 'light';
}
