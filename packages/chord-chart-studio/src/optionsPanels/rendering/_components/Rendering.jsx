import './Rendering.scss';

import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../../../ui/_components/Icon';
import { useI18n } from '../../../ui/i18n/I18nProvider';

import SidebarOptionPanel from '../../../ui/sideBar/options/_components/SidebarOptionsPanel';
import LanguageIconDropdown from '../../../ui/layout/app/_components/LanguageIconDropdown';
import ThemeIconDropdown from '../../../ui/sideBar/_containers/ThemeIconDropdown';

export default function Rendering(props) {
	const { onOpenSettings } = props;
	const { t } = useI18n();

	return (
		<div className={'renderingOptionsPanel'}>
			<div className={'renderingOptionsPanel-isCollapsed'}>
				<span className={'renderingOptionsPanel-icon'}>
					<Icon iconName={'settings'} />
				</span>
			</div>

			<div className={'renderingOptionsPanel-isExpanded'}>
				<div className={'renderingOptionsPanel-quickActions'}>
					<button
						type="button"
						className="headerQuickAction"
						aria-label={t('设置')}
						onClick={onOpenSettings}
					>
						<span className="headerQuickAction-glyph" aria-hidden>
							<Icon iconName="settings" />
						</span>
					</button>
					<LanguageIconDropdown />
					<ThemeIconDropdown />
				</div>
				<SidebarOptionPanel {...props} id={'rendering'} />
			</div>
		</div>
	);
}

Rendering.propTypes = {
	onOpenSettings: PropTypes.func,
};

Rendering.defaultProps = {
	onOpenSettings: () => {},
};
