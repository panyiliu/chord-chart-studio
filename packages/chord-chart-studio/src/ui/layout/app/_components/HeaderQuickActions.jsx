import './HeaderQuickActions.scss';

import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../../../_components/Icon.jsx';
import { useI18n } from '../../../i18n/I18nProvider';

function HeaderQuickActions(props) {
	const { onOpenSettings } = props;
	const { t } = useI18n();

	return (
		<div className="headerQuickActions">
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
		</div>
	);
}

HeaderQuickActions.propTypes = {
	onOpenSettings: PropTypes.func.isRequired,
};

export default React.memo(HeaderQuickActions);
