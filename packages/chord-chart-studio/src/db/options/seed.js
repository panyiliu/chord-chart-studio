export default {
	// editorPreferences are identical for all songs
	editorPreferences: {
		values: {
			theme: 'dark1',
			chartFormat: 'chordmark',
			/** @type {'system' | 'light' | 'dark'} */
			uiColorScheme: 'system',
		},
		defaults: {
			theme: 'dark1',
			chartFormat: 'chordmark',
			uiColorScheme: 'system',
		},
		//userDefaults: {},
	},
	// songPreferences are identical for all song rendering modes
	// therefore, they are only saved once for each song
	songPreferences: {
		values: {
			transposeValue: 0,
			preferredAccidentals: 'auto',
			symbolType: 'chord',
		},
		defaults: {
			transposeValue: 0,
			preferredAccidentals: 'auto',
			symbolType: 'chord',
		},
		//userDefaults: {},
	},
	// songFormatting options are specific to a given mode (print, export...)
	// they are saved separately for each song
	songFormatting: {
		values: {
			chartType: 'all',
			alignChordsWithLyrics: true,
			alignBars: true,
			autoRepeatChords: true,
			expandSectionCopy: true,

			fontSize: 0,
			columnsCount: 1,
			columnBreakOnSection: true,
			documentMargins: 3,

			printChordColor: 'blue',
			printChordSizePercent: 115,
			printChordBold: true,
			printChordShadowStrength: 0,
		},
		defaults: {
			chartType: 'all',
			alignChordsWithLyrics: true,
			alignBars: true,
			autoRepeatChords: true,
			expandSectionCopy: true,

			fontSize: 0,
			columnsCount: 1,
			columnBreakOnSection: true,
			documentMargins: 3,

			printChordColor: 'blue',
			printChordSizePercent: 115,
			printChordBold: true,
			printChordShadowStrength: 0,
		},
		//userDefaults: {},
	},
};
