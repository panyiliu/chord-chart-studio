jest.mock('../../../../src/fileManager/exportSelectedFileAsText');
jest.mock('../../../../src/fileManager/_containers/AiImportModal', () => ({
	__esModule: true,
	default: () => null,
}));
jest.mock('../../../../src/fileManager/_containers/FileMetadataPanel', () => ({
	__esModule: true,
	default: () => null,
}));

import React from 'react';

import {
	render,
	cleanup,
	fireEvent,
	act,
	waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import FileManager from '../../../../src/fileManager/_components/FileManager';
import exportSelectedFileAsText from '../../../../src/fileManager/exportSelectedFileAsText';

afterEach(cleanup);

describe('FileManager', () => {
	let props = {};

	const selectFile = jest.fn();
	const createFile = jest.fn();
	const deleteFile = jest.fn();
	const enableRename = jest.fn();
	const updateFile = jest.fn();
	const startImport = jest.fn();
	const setEditorMode = jest.fn();
	const requestBrowserSystemPrint = jest.fn();

	window.getSelection = () => ({
		removeAllRanges: jest.fn(),
	});

	window.print = jest.fn();

	beforeEach(() => {
		props = {
			allTitles: [
				{ id: 'id1', title: 'title1' },
				{ id: 'id2', title: 'title2' },
				{ id: 'id3', title: 'title3' },
				{ id: 'id4', title: 'title4' },
				{ id: 'id5', title: 'title5' },
			],
			selected: 'id1',
			renamed: '',
			defaultTitle: 'new file',

			selectFile,
			createFile,
			deleteFile,
			enableRename,
			updateFile,
			startImport,
			setEditorMode,
			requestBrowserSystemPrint,
		};

		selectFile.mockReset();
		createFile.mockReset();
		deleteFile.mockReset();
		enableRename.mockReset();
		updateFile.mockReset();
		startImport.mockReset();
		setEditorMode.mockReset();
		requestBrowserSystemPrint.mockReset();
	});

	describe('Action list', () => {
		test('should render files titles as value of input fields', () => {
			const { getByText } = render(<FileManager {...props} />);
			getByText('空白');
			getByText('重命名');
			getByText('删除');
		});
	});

	describe('File list', () => {
		test('should render files titles as value of input fields', () => {
			const { getByDisplayValue } = render(<FileManager {...props} />);
			getByDisplayValue(props.allTitles[0].title);
			getByDisplayValue(props.allTitles[1].title);
			getByDisplayValue(props.allTitles[2].title);
			getByDisplayValue(props.allTitles[3].title);
			getByDisplayValue(props.allTitles[4].title);
		});

		test('input fields should be read only', () => {
			const { getByDisplayValue } = render(<FileManager {...props} />);
			const input1 = getByDisplayValue(props.allTitles[0].title);
			expect(input1).toHaveAttribute('readonly');

			const input2 = getByDisplayValue(props.allTitles[1].title);
			expect(input2).toHaveAttribute('readonly');

			const input3 = getByDisplayValue(props.allTitles[2].title);
			expect(input3).toHaveAttribute('readonly');

			const input4 = getByDisplayValue(props.allTitles[3].title);
			expect(input4).toHaveAttribute('readonly');

			const input5 = getByDisplayValue(props.allTitles[4].title);
			expect(input5).toHaveAttribute('readonly');
		});
	});

	describe('selectFile', () => {
		test('should call selectFile() callback on click', () => {
			const { getByDisplayValue } = render(<FileManager {...props} />);

			const file1 = getByDisplayValue(props.allTitles[1].title);

			fireEvent.click(file1);

			expect(selectFile).toHaveBeenCalledWith(props.allTitles[1].id);

			const file2 = getByDisplayValue(props.allTitles[4].title);

			fireEvent.click(file2);

			expect(selectFile).toHaveBeenCalledWith(props.allTitles[4].id);
		});

		test('should NOT call selectFile() callback on click if already selected', () => {
			const { getByDisplayValue } = render(
				<FileManager {...props} selected={props.allTitles[4].id} />
			);

			const file2 = getByDisplayValue(props.allTitles[4].title);

			fireEvent.click(file2);

			expect(selectFile).toHaveBeenCalledTimes(0);
		});
	});

	describe('enableRename', () => {
		test('should call enableRename() on doubleClick with clicked title id', () => {
			const { getByDisplayValue } = render(<FileManager {...props} />);

			const file1 = getByDisplayValue(props.allTitles[1].title);

			fireEvent.doubleClick(file1);

			expect(enableRename).toHaveBeenCalledWith(props.allTitles[1].id);
		});

		test('should NOT call enableRename() on doubleClick if file is being renamed', () => {
			const { getByDisplayValue } = render(
				<FileManager {...props} renamed={props.allTitles[1].id} />
			);

			const file1 = getByDisplayValue(props.allTitles[1].title);

			fireEvent.doubleClick(file1);

			expect(enableRename).not.toHaveBeenCalled();
		});

		test('should call enableRename() on Rename Action with currently selected title id', () => {
			const { getByText } = render(
				<FileManager {...props} selected={props.allTitles[3].id} />
			);

			const rename = getByText('重命名');

			fireEvent.click(rename);

			expect(enableRename).toHaveBeenCalledWith(props.allTitles[3].id);
		});

		test('input field should reflect changes', () => {
			const { getByDisplayValue } = render(
				<FileManager {...props} renamed={props.allTitles[1].id} />
			);

			const file1 = getByDisplayValue(props.allTitles[1].title);

			act(() => {
				fireEvent.change(file1, { target: { value: 'myNewTitle' } });
			});

			expect(file1.value).toBe('myNewTitle');
		});
	});

	describe('rename', () => {
		test('should not render renamed input file as readonly', () => {
			const { getByDisplayValue } = render(
				<FileManager {...props} renamed={props.allTitles[1].id} />
			);
			const input1 = getByDisplayValue(props.allTitles[0].title);
			expect(input1).toHaveAttribute('readonly');

			const input2 = getByDisplayValue(props.allTitles[1].title);
			expect(input2).not.toHaveAttribute('readonly');

			const input3 = getByDisplayValue(props.allTitles[2].title);
			expect(input3).toHaveAttribute('readonly');

			const input4 = getByDisplayValue(props.allTitles[3].title);
			expect(input4).toHaveAttribute('readonly');

			const input5 = getByDisplayValue(props.allTitles[4].title);
			expect(input5).toHaveAttribute('readonly');
		});

		test('if file is being renamed, should save title on input field blur', () => {
			const { getByDisplayValue } = render(
				<FileManager {...props} renamed={props.allTitles[1].id} />
			);
			const input = getByDisplayValue(props.allTitles[1].title);

			input.value = 'myNewTitle';

			fireEvent.blur(input);

			expect(updateFile).toHaveBeenCalledWith(props.allTitles[1].id, {
				title: 'myNewTitle',
			});
		});

		test('if file is NOT being renamed, should not save title on input field blur', () => {
			const { getByDisplayValue } = render(
				<FileManager
					{...props}
					//renamed={props.allTitles[1].id}
				/>
			);
			const input = getByDisplayValue(props.allTitles[1].title);

			fireEvent.blur(input);

			expect(updateFile).not.toHaveBeenCalled();
		});

		test('if file is being renamed, should save title on enter', () => {
			const { getByDisplayValue } = render(
				<FileManager {...props} renamed={props.allTitles[1].id} />
			);
			const input = getByDisplayValue(props.allTitles[1].title);

			input.value = 'myNewTitle';

			fireEvent.keyPress(input, { charCode: 13, which: 13 });

			expect(updateFile).toHaveBeenCalledWith(props.allTitles[1].id, {
				title: 'myNewTitle',
			});
		});

		test('if file is NOT being renamed, should not save title on enter', () => {
			const { getByDisplayValue } = render(
				<FileManager
					{...props}
					//renamed={props.allTitles[1].id}
				/>
			);
			const input = getByDisplayValue(props.allTitles[1].title);

			fireEvent.keyPress(input, { charCode: 13, which: 13 });

			expect(updateFile).not.toHaveBeenCalled();
		});

		test('should set default title if user tries to save with empty title', () => {
			const { getByDisplayValue } = render(
				<FileManager {...props} renamed={props.allTitles[1].id} />
			);
			const input = getByDisplayValue(props.allTitles[1].title);

			input.value = '';

			fireEvent.keyPress(input, { charCode: 13, which: 13 });

			expect(updateFile).toHaveBeenCalledWith(props.allTitles[1].id, {
				title: props.defaultTitle,
			});
		});
	});

	describe('input focus', () => {
		test('should select input content if file is renamed', () => {
			const { getByDisplayValue } = render(
				<FileManager
					{...props}
					selected={props.allTitles[4].id}
					renamed={props.allTitles[4].id}
				/>
			);

			const file1 = getByDisplayValue(props.allTitles[4].title);

			// we need a mock as jsDom does not support window selection API
			const target = {
				select: jest.fn(),
			};

			fireEvent.focus(file1, { target });

			expect(target.select).toHaveBeenCalledTimes(1);
		});

		test('should NOT select input content if file is not renamed', () => {
			const { getByDisplayValue } = render(
				<FileManager {...props} selected={props.allTitles[4].id} />
			);

			const file1 = getByDisplayValue(props.allTitles[4].title);

			// we need a mock as jsDom does not support window selection API
			const target = {
				select: jest.fn(),
			};

			fireEvent.focus(file1, { target });

			expect(target.select).not.toHaveBeenCalled();
		});
	});

	describe('createFile', () => {
		test('should call createFile() with default title on New Action click', () => {
			const { getByText } = render(<FileManager {...props} />);
			const input = getByText('空白');

			fireEvent.click(input);

			expect(createFile).toHaveBeenCalledWith(props.defaultTitle);
		});
	});

	describe('deleteFile', () => {
		test('should ask for confirmation before deleting a file', () => {
			const { getByText } = render(
				<FileManager {...props} selected={props.allTitles[2].id} />
			);
			const input = getByText('删除');

			fireEvent.click(input);

			expect(deleteFile).toHaveBeenCalledTimes(0);

			const deleteConfirmBtn = getByText('DELETE');

			fireEvent.click(deleteConfirmBtn);

			expect(deleteFile).toHaveBeenCalledTimes(1);
			expect(deleteFile).toHaveBeenCalledWith(props.allTitles[2].id);
		});

		test('should allow to cancel file deletion', () => {
			const { getByText } = render(
				<FileManager {...props} selected={props.allTitles[2].id} />
			);
			const input = getByText('删除');

			fireEvent.click(input);

			expect(deleteFile).toHaveBeenCalledTimes(0);

			const deleteConfirmBtn = getByText('CANCEL');

			fireEvent.click(deleteConfirmBtn);

			expect(deleteFile).toHaveBeenCalledTimes(0);
		});
	});

	describe('import', () => {
		test('should call startImport() on import action', () => {
			const { getByText } = render(<FileManager {...props} />);
			const importButton = getByText('导入');

			fireEvent.click(importButton);

			expect(startImport).toHaveBeenCalledTimes(1);
		});
	});

	describe('export', () => {
		test('should call setEditorMode() and exportSelectedFileAsText() on export action', async () => {
			const { getByText } = render(<FileManager {...props} />);
			const exportButton = getByText('导出');

			act(() => {
				fireEvent.click(exportButton);
			});

			expect(setEditorMode).toHaveBeenCalledTimes(1);
			expect(setEditorMode).toHaveBeenCalledWith('export');
			await waitFor(() =>
				expect(exportSelectedFileAsText).toHaveBeenCalledTimes(1)
			);
		});
	});

	describe('print', () => {
		test('should call setEditorMode(print) and requestBrowserSystemPrint on print action', () => {
			const { getByText } = render(<FileManager {...props} />);
			const printButton = getByText('打印');

			act(() => {
				fireEvent.click(printButton);
			});

			expect(setEditorMode).toHaveBeenCalledTimes(1);
			expect(setEditorMode).toHaveBeenCalledWith('print');
			expect(requestBrowserSystemPrint).toHaveBeenCalledTimes(1);
			expect(requestBrowserSystemPrint).toHaveBeenCalledWith({
				pdfDocumentTitle: 'title1+PDF',
			});
			expect(window.print).not.toHaveBeenCalled();
		});
	});

	describe('disabled actions', () => {
		test('should disable some actions when no file is selected', () => {
			const { getByText } = render(
				<FileManager {...props} selected={''} />
			);
			const importBtn = getByText('导入');
			const newBtn = getByText('空白');
			const renameBtn = getByText('重命名');
			const deleteBtn = getByText('删除');
			const exportBtn = getByText('导出');
			const printBtn = getByText('打印');

			act(() => {
				fireEvent.click(importBtn);
				fireEvent.click(newBtn);
				fireEvent.click(renameBtn);
				fireEvent.click(deleteBtn);
				fireEvent.click(exportBtn);
				fireEvent.click(printBtn);
			});

			expect(startImport).toHaveBeenCalledTimes(1);
			expect(createFile).toHaveBeenCalledTimes(1);
			expect(enableRename).toHaveBeenCalledTimes(0);
			expect(deleteFile).toHaveBeenCalledTimes(0);
			expect(setEditorMode).toHaveBeenCalledTimes(0);
			expect(setEditorMode).toHaveBeenCalledTimes(0);
		});
	});
});
