import { getExportCanvasScale } from '../../../../../src/songRenderers/printPreview/helpers/exportPrintPreviewToPdf';

describe('getExportCanvasScale', () => {
	const originalDpr = window.devicePixelRatio;

	afterEach(() => {
		Object.defineProperty(window, 'devicePixelRatio', {
			configurable: true,
			value: originalDpr,
		});
	});

	test('uses higher scale for few pages', () => {
		Object.defineProperty(window, 'devicePixelRatio', {
			configurable: true,
			value: 2,
		});
		expect(getExportCanvasScale(1)).toBe(4);
		expect(getExportCanvasScale(3)).toBe(4);
	});

	test('reduces cap for many pages', () => {
		Object.defineProperty(window, 'devicePixelRatio', {
			configurable: true,
			value: 2,
		});
		expect(getExportCanvasScale(4)).toBe(3.25);
		expect(getExportCanvasScale(7)).toBe(2.75);
	});

	test('respects minimum scale', () => {
		Object.defineProperty(window, 'devicePixelRatio', {
			configurable: true,
			value: 1,
		});
		expect(getExportCanvasScale(1)).toBe(2.5);
	});
});
