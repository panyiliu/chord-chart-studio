import getVersions from '../../../core/getVersions';
import './Versions.scss';

import React from 'react';
import { useI18n } from '../../i18n/I18nProvider';

import UserGuideLink from './UserGuideLink';

function Versions() {
	const { t } = useI18n();
	const versions = getVersions();
	return (
		<div className={'versions'}>
			<div className={'versions-isExpanded'}>
				<UserGuideLink />
				<br />
				{t('Chord Chart Studio')} {versions['chord-chart-studio']}
				<br />
				{t('ChordSymbol')} {versions['chord-symbol']} <br />
				{t('ChordMark')} {versions['chord-mark']} <br />
				{t('Logo by')}{' '}
				<a
					href={'https://spelling-bee-assistant.app/'}
					target={'_blank'}
					rel={'noreferrer'}
				>
					Dieter Raber
				</a>
			</div>
		</div>
	);
}

export default React.memo(Versions);
