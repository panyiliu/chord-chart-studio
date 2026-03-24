export const getAiEnginesState = (state) => state.integrations.aiEngines;

export const getAllAiEngines = (state) => getAiEnginesState(state).engines;

export const getSelectedAiEngineId = (state) =>
	getAiEnginesState(state).selectedEngineId;

export const getSelectedAiEngine = (state) => {
	const id = getSelectedAiEngineId(state);
	if (!id) return null;
	return getAllAiEngines(state).find((e) => e.id === id) ?? null;
};
