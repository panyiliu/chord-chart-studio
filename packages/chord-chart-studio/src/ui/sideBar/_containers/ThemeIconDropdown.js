import { connect } from 'react-redux';

import { setOptionValue } from '../../../db/options/actions';
import { getOptionValue } from '../../../db/options/selectors';

import ThemeIconDropdownView from '../_components/ThemeIconDropdownView';

export default connect(
	(state) => ({
		uiColorScheme:
			getOptionValue(state, 'editorPreferences', 'uiColorScheme') ||
			'system',
	}),
	(dispatch) => ({
		setUiColorScheme: (value) =>
			dispatch(
				setOptionValue('editorPreferences', 'uiColorScheme', value)
			),
	})
)(ThemeIconDropdownView);
