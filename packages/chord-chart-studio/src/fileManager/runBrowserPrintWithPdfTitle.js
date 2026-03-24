/** DOM marker for paginated print preview (see Page.jsx). */
export const PRINT_PREVIEW_READY_SELECTOR = '.printPreview .printPreview-page';

/**
 * Opens the system print dialog after the next frames paint, so React can
 * commit the print preview first. Restores document.title when print ends
 * (afterprint + matchMedia fallback for browsers with incomplete afterprint).
 *
 * @param {object} opts
 * @param {string} opts.pdfDocumentTitle - Value for document.title during print
 */
export function runBrowserPrintWithPdfTitle({ pdfDocumentTitle }) {
	const previousTitle = document.title;
	document.title = pdfDocumentTitle;

	let restored = false;
	let mql = null;
	let onMqlChange = null;

	const restoreTitle = () => {
		if (restored) {
			return;
		}
		restored = true;
		document.title = previousTitle;
		if (mql && onMqlChange) {
			if (typeof mql.removeEventListener === 'function') {
				mql.removeEventListener('change', onMqlChange);
			} else if (typeof mql.removeListener === 'function') {
				mql.removeListener(onMqlChange);
			}
			mql = null;
			onMqlChange = null;
		}
	};

	window.addEventListener('afterprint', restoreTitle, { once: true });

	try {
		mql = window.matchMedia('print');
		onMqlChange = () => {
			if (!mql.matches) {
				restoreTitle();
			}
		};
		if (typeof mql.addEventListener === 'function') {
			mql.addEventListener('change', onMqlChange);
		} else if (typeof mql.addListener === 'function') {
			mql.addListener(onMqlChange);
		} else {
			mql = null;
			onMqlChange = null;
		}
	} catch {
		mql = null;
		onMqlChange = null;
	}

	window.print();
}
