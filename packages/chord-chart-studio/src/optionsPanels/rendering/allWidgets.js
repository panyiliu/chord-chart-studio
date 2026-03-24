/* eslint-disable max-lines */
export default {
	widgetsOrder: ['editorPreferences', 'key', 'preferences', 'layout'],

	allWidgets: {
		editorPreferences: {
			label: 'Editor preferences',
			type: 'optionsGroup',
			icon: 'tune',

			groupWidgetsOrder: ['theme', 'chartFormat'],
			allGroupWidgets: {
				theme: {
					label: 'Theme',
					type: 'select',
					typeOptions: {
						allChoices: [
							{
								id: 'themeDark1',
								label: 'Dark 1 (default)',
								value: 'dark1',
							},
							{
								id: 'themeDark2',
								label: 'Dark 2',
								value: 'dark2',
							},
							{
								id: 'themeDark3',
								label: 'Dark 3',
								value: 'dark3',
							},
						],
					},
					option: {
						context: 'editorPreferences',
						key: 'theme',
					},
				},
				chartFormat: {
					label: 'Export format',
					type: 'select',
					typeOptions: {
						allChoices: [
							{
								id: 'formatChordMark',
								label: 'ChordMark',
								value: 'chordmark',
							},
							{
								id: 'formatChordMarkSrc',
								label: 'ChordMark (Source)',
								value: 'chordmarkSrc',
							},
							{
								id: 'formatChordpro',
								label: 'ChordPro',
								value: 'chordpro',
							},
							{
								id: 'formatUG',
								label: 'UltimateGuitar',
								value: 'ultimateGuitar',
							},
						],
					},
					option: {
						context: 'editorPreferences',
						key: 'chartFormat',
					},
				},
			},
		},

		key: {
			label: 'Key',
			type: 'optionsGroup',
			icon: 'music_note',

			groupWidgetsOrder: [
				'transposeValue',
				'transposeStepButtons',
				'preferredAccidentals',
				'symbolType',
			],
			allGroupWidgets: {
				transposeValue: {
					label: 'Transpose',
					type: 'slider',
					typeOptions: {
						min: -11,
						max: 11,
						showPlusSymbol: true,
					},
					option: {
						context: 'songPreferences',
						key: 'transposeValue',
					},
				},

				transposeStepButtons: {
					label: '',
					type: 'transposeStepButtons',
					typeOptions: {
						min: -11,
						max: 11,
						step: 1,
					},
					option: {
						context: 'songPreferences',
						key: 'transposeValue',
					},
				},

				preferredAccidentals: {
					label: 'Preferred accidentals',
					type: 'select',
					typeOptions: {
						allChoices: [
							{
								id: 'preferredAccidentalsAuto',
								label: 'Auto',
								value: 'auto',
							},
							{
								id: 'preferredAccidentalsSharp',
								label: '♯',
								value: 'sharp',
							},
							{
								id: 'preferredAccidentalsFlat',
								label: '♭',
								value: 'flat',
							},
						],
					},
					option: {
						context: 'songPreferences',
						key: 'preferredAccidentals',
					},
				},

				symbolType: {
					label: 'Symbols type',
					type: 'select',
					typeOptions: {
						allChoices: [
							{
								id: 'symbolTypeChord',
								label: 'Chord symbols',
								value: 'chord',
							},
							{
								id: 'symbolTypeRoman',
								label: 'Roman numerals',
								value: 'roman',
							},
						],
					},
					option: {
						context: 'songPreferences',
						key: 'symbolType',
					},
				},
			},
		},

		preferences: {
			label: 'Chart settings',
			type: 'optionsGroup',
			icon: 'tune',

			groupWidgetsOrder: [
				'chartType',
				'alignChordsWithLyrics',
				'alignBars',
				'autoRepeatChords',
				'expandSectionCopy',
			],
			allGroupWidgets: {
				chartType: {
					label: 'Type',
					type: 'select',
					typeOptions: {
						allChoices: [
							{
								id: 'typedisplayAll',
								label: 'Show everything',
								value: 'all',
							},
							{
								id: 'typedisplayLyrics',
								label: 'Lyrics only',
								value: 'lyrics',
							},
							{
								id: 'typedisplayChords',
								label: 'Chords only',
								value: 'chords',
							},
							{
								id: 'typedisplayChordsFirstLyricLine',
								label: 'Chords + First lyric line',
								value: 'chordsFirstLyricLine',
							},
						],
					},
					option: {
						context: 'songFormatting',
						key: 'chartType',
					},
				},
				alignChordsWithLyrics: {
					label: 'Align chords with lyrics',
					type: 'toggle',
					option: {
						context: 'songFormatting',
						key: 'alignChordsWithLyrics',
					},
				},
				alignBars: {
					label: 'Align bars',
					type: 'toggle',
					option: {
						context: 'songFormatting',
						key: 'alignBars',
					},
				},
				autoRepeatChords: {
					label: 'Auto repeat chords',
					type: 'toggle',
					option: {
						context: 'songFormatting',
						key: 'autoRepeatChords',
					},
				},
				expandSectionCopy: {
					label: 'Expand copied sections',
					type: 'toggle',
					option: {
						context: 'songFormatting',
						key: 'expandSectionCopy',
					},
				},
			},
		},

		layout: {
			type: 'optionsGroup',
			label: 'Layout',
			icon: 'view_compact',

			groupWidgetsOrder: [
				'printPdfChordSection',
				'printChordColor',
				'printChordSizePercent',
				'printChordBold',
				'printChordShadowStrength',
				'pageLayoutSection',
				'fontSize',
				'columnsCount',
				'columnBreakOnSection',
				'documentMargins',
			],

			allGroupWidgets: {
				printPdfChordSection: {
					label: 'Print / PDF — chord style',
					type: 'sectionHeading',
				},

				printChordColor: {
					label: 'Chord color',
					type: 'select',
					typeOptions: {
						allChoices: [
							{
								id: 'printChordColorInherit',
								label: 'Same as lyrics',
								value: 'inherit',
							},
							{
								id: 'printChordColorBlue',
								label: 'Blue',
								value: 'blue',
							},
							{
								id: 'printChordColorTeal',
								label: 'Teal',
								value: 'teal',
							},
							{
								id: 'printChordColorRed',
								label: 'Red',
								value: 'red',
							},
							{
								id: 'printChordColorPurple',
								label: 'Purple',
								value: 'purple',
							},
							{
								id: 'printChordColorBlack',
								label: 'Black',
								value: 'black',
							},
						],
					},
					option: {
						context: 'songFormatting',
						key: 'printChordColor',
					},
				},

				printChordSizePercent: {
					label: 'Chord size',
					type: 'slider',
					typeOptions: {
						min: 80,
						max: 140,
						step: 5,
						valueSuffix: '%',
						showPlusSymbol: false,
					},
					option: {
						context: 'songFormatting',
						key: 'printChordSizePercent',
					},
				},

				printChordBold: {
					label: 'Bold chord symbols',
					type: 'toggle',
					option: {
						context: 'songFormatting',
						key: 'printChordBold',
					},
				},

				printChordShadowStrength: {
					label: 'Chord shadow',
					type: 'slider',
					typeOptions: {
						min: 0,
						max: 100,
						step: 5,
						showPlusSymbol: false,
					},
					option: {
						context: 'songFormatting',
						key: 'printChordShadowStrength',
					},
				},

				pageLayoutSection: {
					label: 'Page',
					type: 'sectionHeading',
				},

				fontSize: {
					label: 'Font size',
					type: 'slider',
					typeOptions: {
						min: -5,
						max: +5,
						showPlusSymbol: true,
					},
					option: {
						context: 'songFormatting',
						key: 'fontSize',
					},
				},

				columnsCount: {
					label: 'Columns',
					type: 'slider',
					typeOptions: {
						min: 1,
						max: 4,
					},
					option: {
						context: 'songFormatting',
						key: 'columnsCount',
					},
				},

				columnBreakOnSection: {
					label: 'Column Break on section',
					type: 'toggle',
					option: {
						context: 'songFormatting',
						key: 'columnBreakOnSection',
					},
				},

				documentMargins: {
					label: 'Margins',
					type: 'slider',
					typeOptions: {
						min: 1,
						max: 5,
					},
					option: {
						context: 'songFormatting',
						key: 'documentMargins',
					},
				},
			},
		},
	},
};
