import { connect } from 'react-redux';

import { getOptionValue } from '../../../db/options/selectors';
import { getPendingBrowserSystemPrint } from '../../../ui/layout/app/_state/selectors';
import { clearBrowserSystemPrint } from '../../../ui/layout/app/_state/actions';

import PrintPreview from '../_components/PrintPreview';

export default connect(
	(state) => ({
		// songPreferences
		accidentalsType: getOptionValue(
			state,
			'songPreferences',
			'preferredAccidentals'
		),
		transposeValue: getOptionValue(
			state,
			'songPreferences',
			'transposeValue'
		),
		symbolType: getOptionValue(state, 'songPreferences', 'symbolType'),

		// songFormatting
		chartType: getOptionValue(state, 'songFormatting', 'chartType'),
		alignChordsWithLyrics: getOptionValue(
			state,
			'songFormatting',
			'alignChordsWithLyrics'
		),
		alignBars: getOptionValue(state, 'songFormatting', 'alignBars'),
		autoRepeatChords: getOptionValue(
			state,
			'songFormatting',
			'autoRepeatChords'
		),
		expandSectionCopy: getOptionValue(
			state,
			'songFormatting',
			'expandSectionCopy'
		),

		columnsCount: getOptionValue(state, 'songFormatting', 'columnsCount'),
		columnBreakOnSection: getOptionValue(
			state,
			'songFormatting',
			'columnBreakOnSection'
		),
		documentMargins: getOptionValue(
			state,
			'songFormatting',
			'documentMargins'
		),

		fontSize: getOptionValue(state, 'songFormatting', 'fontSize'),

		printChordColor: getOptionValue(
			state,
			'songFormatting',
			'printChordColor'
		),
		printChordSizePercent: getOptionValue(
			state,
			'songFormatting',
			'printChordSizePercent'
		),
		printChordBold: getOptionValue(
			state,
			'songFormatting',
			'printChordBold'
		),
		printChordShadowStrength: getOptionValue(
			state,
			'songFormatting',
			'printChordShadowStrength'
		),

		pendingBrowserSystemPrint: getPendingBrowserSystemPrint(state),
	}),
	{ clearBrowserSystemPrint }
)(PrintPreview);
