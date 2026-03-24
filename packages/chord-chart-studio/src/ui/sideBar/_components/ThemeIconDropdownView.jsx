import '../../layout/app/_components/HeaderQuickActions.scss';

import React, { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import Icon from '../../_components/Icon.jsx';
import { useI18n } from '../../i18n/I18nProvider';
import { useCloseOnOutsidePress } from '../../layout/app/_components/useCloseOnOutsidePress';

const OPTIONS = [
	{ value: 'system', labelKey: '跟随系统', icon: 'brightness_auto' },
	{ value: 'light', labelKey: '浅色', icon: 'light_mode' },
	{ value: 'dark', labelKey: '深色', icon: 'dark_mode' },
];

function ThemeIconDropdownView(props) {
	const { uiColorScheme, setUiColorScheme } = props;
	const value = uiColorScheme || 'system';
	const { t } = useI18n();
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);

	const close = useCallback(() => setOpen(false), []);
	useCloseOnOutsidePress(rootRef, open, close);

	return (
		<div className="headerQuickActionWrap" ref={rootRef}>
			<button
				type="button"
				className={
					open
						? 'headerQuickAction headerQuickAction--open'
						: 'headerQuickAction'
				}
				aria-label={t('界面配色')}
				aria-expanded={open}
				aria-haspopup="listbox"
				onClick={() => setOpen((v) => !v)}
			>
				<span className="headerQuickAction-glyph" aria-hidden>
					<Icon iconName="palette" />
				</span>
			</button>
			{open ? (
				<ul
					className="headerQuickActionPanel"
					role="listbox"
					aria-label={t('界面配色')}
				>
					{OPTIONS.map((opt) => (
						<li key={opt.value} role="none">
							<button
								type="button"
								className={
									value === opt.value
										? 'headerQuickActionOption headerQuickActionOption--active'
										: 'headerQuickActionOption'
								}
								role="option"
								aria-selected={value === opt.value}
								onClick={() => {
									setUiColorScheme(opt.value);
									close();
								}}
							>
								<span
									className="headerQuickActionOptionIcon"
									aria-hidden
								>
									<Icon iconName={opt.icon} />
								</span>
								<span>{t(opt.labelKey)}</span>
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

ThemeIconDropdownView.propTypes = {
	uiColorScheme: PropTypes.oneOf(['system', 'light', 'dark']),
	setUiColorScheme: PropTypes.func.isRequired,
};

ThemeIconDropdownView.defaultProps = {
	uiColorScheme: 'system',
};

export default React.memo(ThemeIconDropdownView);
