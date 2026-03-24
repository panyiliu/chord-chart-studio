import './Toggle.scss';

import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../../../_components/Icon';
import { useI18n } from '../../../i18n/I18nProvider';

function Toggle(props) {
	const {
		isInteractable,
		label,
		optionContext,
		optionKey,
		optionValue,
		setOption,
	} = props;
	const { t } = useI18n();

	const classNames = ['sb-optionToggle'];
	classNames.push(
		optionValue === true ? 'sb-optionToggle-isOn' : 'sb-optionToggle-isOff'
	);
	if (!isInteractable) {
		classNames.push('sb-optionToggle-isNotInteractable');
	}

	function handleClick() {
		setOption(optionContext, optionKey, !optionValue);
	}

	return (
		<div
			className={classNames.join(' ')}
			onClick={isInteractable ? handleClick : null}
		>
			<div className={'sb-optionToggle-desc'}>{t(label)}</div>
			<div className={'sb-optionToggle-icon'}>
				<span className={'sb-optionToggle-icon'}>
					<Icon
						iconName={
							optionValue === true ? 'toggle_on' : 'toggle_off'
						}
					/>
				</span>
			</div>
		</div>
	);
}

Toggle.propTypes = {
	isInteractable: PropTypes.bool.isRequired,
	label: PropTypes.string.isRequired,
	optionContext: PropTypes.string.isRequired,
	optionKey: PropTypes.string.isRequired,
	optionValue: PropTypes.bool.isRequired,
	setOption: PropTypes.func.isRequired,
};

export default React.memo(Toggle);
