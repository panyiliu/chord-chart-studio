import './Modal.scss';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import { useEffectiveUiTheme } from '../theme/useEffectiveUiTheme';

function Modal(props) {
	const { children, closeModal } = props;
	const uiTheme = useEffectiveUiTheme();
	const themeClass = uiTheme === 'dark' ? 'theme-dark' : 'theme-light';

	useEffect(() => {
		const handleKeyboard = (e) => {
			if (e.key === 'Escape') {
				closeModal();
			}
		};
		window.addEventListener('keyup', handleKeyboard);

		return () => {
			window.removeEventListener('keyup', handleKeyboard);
		};
	});

	// Portal 挂在 body 上，必须在节点上带 theme-*，否则位于 #app 外时 themify 不生效。
	const node = (
		<section className={`mod-ModalContainer ${themeClass}`}>
			<div
				className={'mod-Overlay'}
				onClick={closeModal}
				data-testid={'modal-overlay'}
			></div>
			<div className={'mod-ContentContainer'}>{children}</div>
		</section>
	);

	return createPortal(node, document.body);
}

Modal.propTypes = {
	children: PropTypes.element.isRequired,
	closeModal: PropTypes.func.isRequired,
};

export default Modal;
