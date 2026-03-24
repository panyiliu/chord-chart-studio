import combineSectionReducers from 'combine-section-reducers';
import catalog from './catalog/reducers';
import files from './files/reducers';
import options from './options/reducers';

export default combineSectionReducers({
	catalog,
	files,
	options,
});
