import './HeaderQuickActions.scss';

import React, { useRef, useState, useCallback } from 'react';

import Icon from '../../../_components/Icon.jsx';
import { useI18n } from '../../../i18n/I18nProvider';
import { useCloseOnOutsidePress } from './useCloseOnOutsidePress';

function LanguageIconDropdown() {
	const { lang, setLang, t } = useI18n();
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);

	const close = useCallback(() => setOpen(false), []);
	useCloseOnOutsidePress(rootRef, open, close);

	const options = [
		{ value: 'zh', label: t('Chinese') },
		{ value: 'en', label: t('English') },
	];

	return (
		<div className="headerQuickActionWrap" ref={rootRef}>
			<button
				type="button"
				className={
					open
						? 'headerQuickAction headerQuickAction--open'
						: 'headerQuickAction'
				}
				aria-label={t('Language')}
				aria-expanded={open}
				aria-haspopup="listbox"
				onClick={() => setOpen((v) => !v)}
			>
				<span className="headerQuickAction-glyph" aria-hidden>
					<Icon iconName="translate" />
				</span>
			</button>
			{open ? (
				<ul
					className="headerQuickActionPanel"
					role="listbox"
					aria-label={t('Language')}
				>
					{options.map((opt) => (
						<li key={opt.value} role="none">
							<button
								type="button"
								className={
									lang === opt.value
										? 'headerQuickActionOption headerQuickActionOption--active'
										: 'headerQuickActionOption'
								}
								role="option"
								aria-selected={lang === opt.value}
								onClick={() => {
									setLang(opt.value);
									close();
								}}
							>
								{opt.label}
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

export default React.memo(LanguageIconDropdown);
