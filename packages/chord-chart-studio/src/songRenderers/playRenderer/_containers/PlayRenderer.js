import { connect } from 'react-redux';

import { getOptionValue } from '../../../db/options/selectors';

import { getPrintChordStyleVars } from '../../printPreview/helpers/printChordStyle';
import PlayRenderer from '../_components/PlayRenderer';

export default connect((state) => ({
	theme: getOptionValue(state, 'editorPreferences', 'theme'),
	fontSize: getOptionValue(state, 'songFormatting', 'fontSize'),
	columnsCount: getOptionValue(state, 'songFormatting', 'columnsCount'),

	printChordColor: getOptionValue(state, 'songFormatting', 'printChordColor'),
	printChordSizePercent: getOptionValue(
		state,
		'songFormatting',
		'printChordSizePercent'
	),
	printChordBold: getOptionValue(state, 'songFormatting', 'printChordBold'),
	printChordShadowStrength: getOptionValue(
		state,
		'songFormatting',
		'printChordShadowStrength'
	),

	chordStyle: getPrintChordStyleVars({
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
	}),
}))(PlayRenderer);
