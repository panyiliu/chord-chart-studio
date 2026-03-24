import './SectionHeading.scss';

import React from 'react';
import PropTypes from 'prop-types';

import { useI18n } from '../../../i18n/I18nProvider';

function SectionHeading(props) {
	const { label } = props;
	const { t } = useI18n();

	return (
		<div className={'sb-optionSectionHeading'} role={'presentation'}>
			{t(label)}
		</div>
	);
}

SectionHeading.propTypes = {
	label: PropTypes.string.isRequired,
};

export default React.memo(SectionHeading);
