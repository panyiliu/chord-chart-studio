import { connect } from 'react-redux';

import { importChordSheetFromAi } from '../../integrations/importChordSheetFromAi';
import {
	getAllAiEngines,
	getSelectedAiEngineId,
} from '../../integrations/aiEngines/selectors';
import { getAiPrompts } from '../../integrations/aiPrompts/selectors';
import {
	getPromptTemplates,
	getSelectedFileImportTemplateId,
	getSelectedImportTemplateId,
	getSelectedUrlImportTemplateId,
} from '../../integrations/aiPromptTemplates/selectors';

import AiImportModal from '../_components/AiImportModal';

export default connect(
	(state) => {
		const ap = getAiPrompts(state) || {};
		return {
			engines: getAllAiEngines(state),
			selectedEngineId: getSelectedAiEngineId(state) || '',
			connectivityTestUserMessage:
				ap.connectivityTestUserMessage ||
				'你好，请只回复「测试成功」。',
			selectedPasteTemplateId: getSelectedImportTemplateId(state) || '',
			selectedFileTemplateId:
				getSelectedFileImportTemplateId(state) || '',
			selectedUrlTemplateId: getSelectedUrlImportTemplateId(state) || '',
			promptTemplates: getPromptTemplates(state),
			hideAiImportEngineSelector: ap.hideAiImportEngineSelector === true,
			urlImportEngineId: ap.urlImportEngineId || '',
			fileImportEngineId: ap.fileImportEngineId || '',
			pasteImportEngineId: ap.pasteImportEngineId || '',
		};
	},
	{
		importChordSheetFromAi,
	}
)(AiImportModal);
