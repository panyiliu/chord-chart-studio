import React from 'react';

import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import UserGuideLink, {
	USER_GUIDE_URL,
} from '../../../../../../src/ui/sideBar/_components/UserGuideLink';
import { I18nProvider } from '../../../../../../src/ui/i18n/I18nProvider';

afterEach(cleanup);

function renderWithI18n(ui) {
	return render(<I18nProvider>{ui}</I18nProvider>);
}

describe('UserGuideLink', () => {
	test('should link to the user guide site in a new tab', () => {
		const { getByText } = renderWithI18n(<UserGuideLink />);
		const link = getByText('User Guide');

		expect(link).toHaveAttribute('href', USER_GUIDE_URL);
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	});
});
