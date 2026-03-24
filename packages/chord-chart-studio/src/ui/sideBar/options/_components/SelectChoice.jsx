import './Select.scss';

import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../../../_components/Icon';
import { useI18n } from '../../../i18n/I18nProvider';

function SelectChoice(props) {
	const { isSelected, isInteractable, label, onClick } = props;
	const { t } = useI18n();

	let checkIcon;
	const classNames = ['sb-optionSelectChoice'];

	if (isSelected) {
		classNames.push('sb-optionSelectChoice-isSelected');
		checkIcon = (
			<span className={'sb-optionSelectChoice-checkIcon'}>
				<Icon iconName={'check'} />
			</span>
		);
	}

	if (!isInteractable) {
		classNames.push('sb-optionSelectChoice-isNotInteractable');
	}

	function handleClick() {
		if (isInteractable) {
			onClick();
		}
	}

	return (
		<div className={classNames.join(' ')} onClick={handleClick}>
			<div className={'sb-optionSelectChoice-check'}>
				{isSelected && checkIcon}
			</div>
			<div className={'sb-optionSelectChoice-label'}>{t(label)}</div>
		</div>
	);
}

SelectChoice.propTypes = {
	isSelected: PropTypes.bool.isRequired,
	isInteractable: PropTypes.bool.isRequired,
	label: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
};

export default React.memo(SelectChoice);
