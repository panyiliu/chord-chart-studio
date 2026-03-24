/**
 * Strip characters that are invalid or awkward in OS save dialogs.
 * @param {string} title
 * @returns {string}
 */
export function sanitizeForPrintFilename(title) {
	const cleaned = String(title || '')
		.replace(/[/\\:*?"<>|]/g, '-')
		.replace(/\s+/g, ' ')
		.trim();

	return cleaned || 'Chord chart';
}

/**
 * Title used as the browser's default PDF filename when printing to PDF
 * (Chrome / Edge use document.title for the suggested name).
 *
 * @param {string} selectedId
 * @param {Array<{ id: string, title: string }>} allTitles
 * @param {string} defaultTitle
 * @returns {string}
 */
export function getPrintPdfDocumentTitle(selectedId, allTitles, defaultTitle) {
	const raw =
		selectedId && Array.isArray(allTitles)
			? allTitles.find((f) => f.id === selectedId)?.title
			: '';

	const base = sanitizeForPrintFilename(raw || defaultTitle || '');

	return `${base}+PDF`;
}

/**
 * Filename for client-side PDF download (includes .pdf extension).
 * @param {string} [title]
 * @param {string} [fallbackTitle]
 * @returns {string}
 */
export function getExportPdfFilename(title, fallbackTitle = 'Chord chart') {
	return `${sanitizeForPrintFilename(title || fallbackTitle)}+PDF.pdf`;
}
