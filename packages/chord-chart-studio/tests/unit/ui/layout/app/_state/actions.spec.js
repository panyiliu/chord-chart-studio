import * as actions from '../../../../../../src/ui/layout/app/_state/actions';
import * as actionsTypes from '../../../../../../src/ui/layout/app/_state/actionsTypes';

describe('ui/layout/app: actions creators', () => {
	describe('toggleLeftBar()', () => {
		test('should return a valid action', () => {
			const expected = {
				type: actionsTypes.UI_LAYOUT_APP_TOGGLE_LEFT_BAR,
			};

			const actual = actions.toggleLeftBar();

			expect(actual).toEqual(expected);
		});
	});

	describe('toggleRightBar()', () => {
		test('should return a valid action', () => {
			const expected = {
				type: actionsTypes.UI_LAYOUT_APP_TOGGLE_RIGHT_BAR,
			};

			const actual = actions.toggleRightBar();

			expect(actual).toEqual(expected);
		});
	});

	describe('setEditorMode()', () => {
		test('should return a valid action', () => {
			const expected = {
				type: actionsTypes.UI_LAYOUT_APP_SET_EDITOR_MODE,
				payload: {
					mode: 'myMode',
				},
			};

			const actual = actions.setEditorMode('myMode');

			expect(actual).toEqual(expected);
		});
	});

	describe('requestBrowserSystemPrint()', () => {
		test('should return a valid action', () => {
			const expected = {
				type: actionsTypes.UI_LAYOUT_APP_REQUEST_BROWSER_SYSTEM_PRINT,
				payload: {
					pdfDocumentTitle: 'Song+PDF',
				},
			};

			const actual = actions.requestBrowserSystemPrint({
				pdfDocumentTitle: 'Song+PDF',
			});

			expect(actual).toEqual(expected);
		});
	});

	describe('clearBrowserSystemPrint()', () => {
		test('should return a valid action', () => {
			const actual = actions.clearBrowserSystemPrint();

			expect(actual.type).toBe(
				actionsTypes.UI_LAYOUT_APP_CLEAR_BROWSER_SYSTEM_PRINT
			);
		});
	});
});
