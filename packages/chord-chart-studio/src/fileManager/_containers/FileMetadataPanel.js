import { connect } from 'react-redux';

import {
	addGenre,
	updateGenre,
	removeGenre,
	addTag,
	updateTag,
	removeTag,
} from '../../db/catalog/actions';
import { updateFile } from '../../db/files/actions';
import { getOne } from '../../db/files/selectors';
import { getGenres, getTags } from '../../db/catalog/selectors';
import { getSelectedId } from '../_state/selectors';

import FileMetadataPanel from '../_components/FileMetadataPanel';

export default connect(
	(state) => {
		const selectedId = getSelectedId(state);
		return {
			selectedId,
			file: selectedId ? getOne(state, selectedId) : null,
			genres: getGenres(state),
			tags: getTags(state),
		};
	},
	{
		addGenre,
		updateGenre,
		removeGenre,
		addTag,
		updateTag,
		removeTag,
		updateFile,
	}
)(FileMetadataPanel);
