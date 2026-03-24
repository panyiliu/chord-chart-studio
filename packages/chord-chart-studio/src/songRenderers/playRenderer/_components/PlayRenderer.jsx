import './PlayRenderer.scss';

import React from 'react';
import PropTypes from 'prop-types';

import SongRenderer from '../../_containers/SongRenderer';

function PlayRenderer(props) {
	const { theme, selectedFile, fontSize, columnsCount, chordStyle } = props;

	const wrapperClassNames = ['playRendererWrapper1'];
	wrapperClassNames.push('cmTheme-' + theme);
	wrapperClassNames.push('cmSong--fontSize' + fontSize);

	const classNames = ['playRenderer'];
	classNames.push('playRenderer--columns-' + columnsCount);

	return (
		<div
			className={wrapperClassNames.join(' ')}
			style={chordStyle}
			data-testid={'playRendererWrapper1'}
		>
			<div className={'playRendererWrapper2'}>
				<div
					className={classNames.join(' ')}
					data-testid={'playRenderer'}
				>
					<SongRenderer content={selectedFile.content} />
				</div>
			</div>
		</div>
	);
}

PlayRenderer.propTypes = {
	theme: PropTypes.string.isRequired,
	fontSize: PropTypes.number.isRequired,
	selectedFile: PropTypes.object.isRequired,
	columnsCount: PropTypes.number.isRequired,
	chordStyle: PropTypes.object,
};

export default PlayRenderer;
