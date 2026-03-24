import { saveAs } from 'file-saver';

/**
 * html2canvas scale: higher = sharper PDF (larger files / more memory).
 * Capped so multi-page exports stay usable on typical laptops.
 *
 * @param {number} pageCount
 * @returns {number}
 */
export function getExportCanvasScale(pageCount) {
	const dpr =
		typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
	// ~2.5–4×: noticeably sharper than 2×; tone down when many pages
	let cap = 4;
	if (pageCount > 3) {
		cap = 3.25;
	}
	if (pageCount > 6) {
		cap = 2.75;
	}
	return Math.min(cap, Math.max(2.5, dpr * 2));
}

/**
 * Rasterize print preview page nodes to a multi-page A4 PDF and trigger download.
 * Output is image-based (text is not selectable). For vector / selectable text,
 * use the sidebar “打印” flow and Save as PDF in the browser.
 *
 * @param {HTMLElement[]} pageEls - Elements with class `.printPreview-page`
 * @param {string} filename - e.g. `MySong+PDF.pdf`
 * @returns {Promise<void>}
 */
export async function exportPrintPreviewToPdf(pageEls, filename) {
	if (!pageEls || pageEls.length === 0) {
		throw new Error('exportPrintPreviewToPdf: no pages');
	}

	const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
		import('html2canvas'),
		import('jspdf'),
	]);

	const scale = getExportCanvasScale(pageEls.length);

	const pdf = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4',
		compress: true,
	});

	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();

	for (let i = 0; i < pageEls.length; i++) {
		const el = pageEls[i];

		const canvas = await html2canvas(el, {
			scale,
			useCORS: true,
			backgroundColor: '#ffffff',
			logging: false,
			scrollX: 0,
			scrollY: 0,
			onclone: (clonedDoc) => {
				const root = clonedDoc.documentElement;
				if (root) {
					root.style.setProperty(
						'-webkit-font-smoothing',
						'antialiased'
					);
					root.style.setProperty(
						'text-rendering',
						'optimizeLegibility'
					);
				}
			},
		});

		// PNG keeps glyph edges sharp; JPEG smears small text at similar file sizes.
		const imgData = canvas.toDataURL('image/png');

		if (i > 0) {
			pdf.addPage();
		}

		const cw = canvas.width;
		const ch = canvas.height;
		const ratio = cw / ch;

		let drawW = pageWidth;
		let drawH = pageWidth / ratio;
		let x = 0;
		let y = 0;

		if (drawH > pageHeight) {
			drawH = pageHeight;
			drawW = pageHeight * ratio;
			x = (pageWidth - drawW) / 2;
		} else {
			y = (pageHeight - drawH) / 2;
		}

		pdf.addImage(imgData, 'PNG', x, y, drawW, drawH, undefined, 'FAST');
	}

	const blob = pdf.output('blob');
	saveAs(blob, filename);
}
