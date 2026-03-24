const editorModeOptions = {
	edit: ['theme', 'transposeValue', 'preferredAccidentals', 'symbolType'],
	play: [
		'theme',

		'transposeValue',
		'preferredAccidentals',
		'symbolType',

		'chartType',
		'alignChordsWithLyrics',
		'alignBars',
		'autoRepeatChords',
		'expandSectionCopy',

		'columnsCount',

		'fontSize',

		'printChordColor',
		'printChordSizePercent',
		'printChordBold',
		'printChordShadowStrength',
	],
	print: [
		'transposeValue',
		'preferredAccidentals',
		'symbolType',

		'chartType',
		'alignChordsWithLyrics',
		'alignBars',
		'autoRepeatChords',
		'expandSectionCopy',

		'columnsCount',
		'columnBreakOnSection',
		'documentMargins',

		'fontSize',

		'printChordColor',
		'printChordSizePercent',
		'printChordBold',
		'printChordShadowStrength',
	],
	export: [
		'chartFormat',

		'transposeValue',
		'preferredAccidentals',
		'symbolType',

		'chartType',
		'alignChordsWithLyrics',
		'alignBars',
		'autoRepeatChords',
		'expandSectionCopy',
	],
};

export default editorModeOptions;
