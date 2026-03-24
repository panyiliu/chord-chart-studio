import { useLayoutEffect } from 'react';

import { useEffectiveUiTheme } from './useEffectiveUiTheme';

/**
 * Applies `theme-light` / `theme-dark` on `#app` and `color-scheme` on `<html>`.
 */
export default function UiThemeRootSync() {
	const theme = useEffectiveUiTheme();

	useLayoutEffect(() => {
		const el = document.getElementById('app');
		if (!el) {
			return;
		}
		el.classList.remove('theme-light', 'theme-dark');
		el.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
		document.documentElement.style.colorScheme =
			theme === 'dark' ? 'dark' : 'light';
	}, [theme]);

	return null;
}
