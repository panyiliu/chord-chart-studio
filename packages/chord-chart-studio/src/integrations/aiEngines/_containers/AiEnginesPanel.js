import { connect } from 'react-redux';

import {
	addAiEngine,
	removeAiEngine,
	selectAiEngine,
	updateAiEngine,
} from '../actions';
import { getAllAiEngines, getSelectedAiEngineId } from '../selectors';
import { getAiPrompts } from '../../aiPrompts/selectors';

import AiEnginesPanel from '../_components/AiEnginesPanel';

export default connect(
	(state) => ({
		engines: getAllAiEngines(state),
		selectedEngineId: getSelectedAiEngineId(state) || '',
		connectivityTestUserMessage:
			getAiPrompts(state)?.connectivityTestUserMessage ||
			'你好，请只回复「测试成功」。',
	}),
	{ addAiEngine, removeAiEngine, selectAiEngine, updateAiEngine }
)(AiEnginesPanel);
