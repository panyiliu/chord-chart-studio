import {
	getExportPdfFilename,
	getPrintPdfDocumentTitle,
	sanitizeForPrintFilename,
} from '../../../src/fileManager/getPrintPdfDocumentTitle';

describe('getPrintPdfDocumentTitle', () => {
	test('uses selected file title with +PDF suffix', () => {
		expect(
			getPrintPdfDocumentTitle('a', [{ id: 'a', title: 'My Song' }], 'x')
		).toBe('My Song+PDF');
	});

	test('falls back to defaultTitle when no match', () => {
		expect(
			getPrintPdfDocumentTitle(
				'missing',
				[{ id: 'a', title: 'A' }],
				'Fallback'
			)
		).toBe('Fallback+PDF');
	});

	test('sanitizes invalid filename characters', () => {
		expect(
			getPrintPdfDocumentTitle(
				'id1',
				[{ id: 'id1', title: 'Bad/Name:Test' }],
				''
			)
		).toBe('Bad-Name-Test+PDF');
	});
});

describe('sanitizeForPrintFilename', () => {
	test('returns Chord chart for empty input', () => {
		expect(sanitizeForPrintFilename('')).toBe('Chord chart');
	});
});

describe('getExportPdfFilename', () => {
	test('adds .pdf suffix and +PDF in basename', () => {
		expect(getExportPdfFilename('Hello')).toBe('Hello+PDF.pdf');
	});
});
