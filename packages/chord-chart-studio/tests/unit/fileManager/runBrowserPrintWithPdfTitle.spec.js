import { runBrowserPrintWithPdfTitle } from '../../../src/fileManager/runBrowserPrintWithPdfTitle';

describe('runBrowserPrintWithPdfTitle', () => {
	let printSpy;

	beforeEach(() => {
		document.title = 'AppTitle';
		printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});
	});

	afterEach(() => {
		printSpy.mockRestore();
		document.title = '';
	});

	test('sets title, calls print, restores on afterprint', () => {
		runBrowserPrintWithPdfTitle({ pdfDocumentTitle: 'Song+PDF' });

		expect(document.title).toBe('Song+PDF');
		expect(printSpy).toHaveBeenCalledTimes(1);

		window.dispatchEvent(new Event('afterprint'));

		expect(document.title).toBe('AppTitle');
	});
});
