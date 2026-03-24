import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../../ui/_components/Icon';

function FileActionEntry(props) {
	const { icon, text, hint, action, isDisabled } = props;

	const classNames = ['fileManagerAction'];

	if (isDisabled) {
		classNames.push('fileManagerAction-isDisabled');
	}
	const handleClick = () => {
		if (!isDisabled) {
			action();
		}
	};

	return (
		<span className={classNames.join(' ')}>
			<span
				className={'fileManagerAction-row'}
				onClick={handleClick}
				role="button"
				tabIndex={isDisabled ? -1 : 0}
				title={hint || text}
				onKeyDown={(e) => {
					if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
						e.preventDefault();
						action();
					}
				}}
			>
				<span className={'fileManagerAction-icon'}>
					<Icon iconName={icon} />
					<span className={'fileManagerAction-label'}>{text}</span>
				</span>
			</span>
		</span>
	);
}

FileActionEntry.propTypes = {
	icon: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
	hint: PropTypes.string,
	action: PropTypes.func.isRequired,
	isDisabled: PropTypes.bool.isRequired,
};

export default React.memo(FileActionEntry);
