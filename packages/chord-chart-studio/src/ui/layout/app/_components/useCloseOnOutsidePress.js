import { useEffect } from 'react';

/**
 * @param {React.RefObject<HTMLElement | null>} ref
 * @param {boolean} active
 * @param {() => void} onClose
 */
export function useCloseOnOutsidePress(ref, active, onClose) {
	useEffect(() => {
		if (!active) return undefined;

		function onPointerDown(event) {
			const el = ref?.current;
			if (!el || el.contains(event.target)) return;
			onClose();
		}

		function onKeyDown(event) {
			if (event.key === 'Escape') onClose();
		}

		document.addEventListener('mousedown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('mousedown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [active, onClose, ref]);
}
