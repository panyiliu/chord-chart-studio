import React from 'react';

import { useI18n } from '../../i18n/I18nProvider';

export const USER_GUIDE_URL = 'https://chord-chart-studio.netlify.app';

function UserGuideLink() {
	const { t } = useI18n();

	return (
		<a
			href={USER_GUIDE_URL}
			target="_blank"
			rel="noopener noreferrer"
			className="versions-userGuideLink"
		>
			{t('User Guide')}
		</a>
	);
}

export default React.memo(UserGuideLink);
