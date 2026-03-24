import './PrintPreview.scss';

import _pick from 'lodash/pick';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
	getExportPdfFilename,
	sanitizeForPrintFilename,
} from '../../../fileManager/getPrintPdfDocumentTitle';
import {
	PRINT_PREVIEW_READY_SELECTOR,
	runBrowserPrintWithPdfTitle,
} from '../../../fileManager/runBrowserPrintWithPdfTitle';
import { renderAsHtml } from '../../../core/renderSong';
import { exportPrintPreviewToPdf } from '../helpers/exportPrintPreviewToPdf';
import { getPrintChordStyleVars } from '../helpers/printChordStyle';
import AllPages from './AllPages';

const PREVIEW_LAYOUT_WAIT_MS = 12000;

function PrintPreview(props) {
	const { selectedFile, pendingBrowserSystemPrint, clearBrowserSystemPrint } =
		props;
	const previewRootRef = useRef(null);
	const [isExportingPdf, setIsExportingPdf] = useState(false);
	const [systemPrintPagesReady, setSystemPrintPagesReady] = useState(false);

	const renderOptions = _pick(props, [
		'transposeValue',
		'accidentalsType',
		'symbolType',

		'chartType',
		'alignChordsWithLyrics',
		'alignBars',
		'autoRepeatChords',
		'expandSectionCopy',
	]);

	const rendered = renderAsHtml(selectedFile.content || '', {
		...renderOptions,
	});
	const allLines = rendered.match(/(<p.*?>.*?<\/p>)/gm) || [];

	const classNames = ['printPreview', 'cmTheme-print'];

	const chordStyle = getPrintChordStyleVars({
		printChordColor: props.printChordColor,
		printChordSizePercent: props.printChordSizePercent,
		printChordBold: props.printChordBold,
		printChordShadowStrength: props.printChordShadowStrength,
	});

	const handleExportPdf = useCallback(async () => {
		const root = previewRootRef.current;
		const pages = root?.querySelectorAll('.printPreview-page');
		if (!pages || pages.length === 0) {
			return;
		}

		setIsExportingPdf(true);
		try {
			await exportPrintPreviewToPdf(
				Array.from(pages),
				getExportPdfFilename(selectedFile.title)
			);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			window.alert('导出 PDF 失败，请稍后重试。');
		} finally {
			setIsExportingPdf(false);
		}
	}, [selectedFile.title]);

	useEffect(() => {
		setSystemPrintPagesReady(false);
		const root = previewRootRef.current;
		if (!root) {
			return undefined;
		}

		let cancelled = false;
		const deadline =
			(typeof performance !== 'undefined' &&
			typeof performance.now === 'function'
				? performance.now()
				: Date.now()) + PREVIEW_LAYOUT_WAIT_MS;

		const tick = () => {
			if (cancelled) {
				return;
			}
			if (root.querySelector(PRINT_PREVIEW_READY_SELECTOR)) {
				setSystemPrintPagesReady(true);
				return;
			}

			const now =
				typeof performance !== 'undefined' &&
				typeof performance.now === 'function'
					? performance.now()
					: Date.now();

			if (now >= deadline) {
				return;
			}

			requestAnimationFrame(tick);
		};

		requestAnimationFrame(tick);

		return () => {
			cancelled = true;
		};
	}, [
		selectedFile.content,
		selectedFile.title,
		props.columnsCount,
		props.columnBreakOnSection,
		props.documentSize,
		props.documentMargins,
		props.fontSize,
		props.transposeValue,
		props.accidentalsType,
		props.symbolType,
		props.chartType,
		props.alignChordsWithLyrics,
		props.alignBars,
		props.autoRepeatChords,
		props.expandSectionCopy,
	]);

	const handleSystemPrint = useCallback(() => {
		const pdfDocumentTitle =
			pendingBrowserSystemPrint?.pdfDocumentTitle ??
			`${sanitizeForPrintFilename(selectedFile.title)}+PDF`;

		runBrowserPrintWithPdfTitle({ pdfDocumentTitle });
		clearBrowserSystemPrint();
	}, [
		pendingBrowserSystemPrint,
		selectedFile.title,
		clearBrowserSystemPrint,
	]);

	return (
		<div className={'printPreviewShell'}>
			<div className={'printPreviewShell-scroll'}>
				<div
					ref={previewRootRef}
					className={classNames.join(' ')}
					data-testid={'printPreview'}
					style={chordStyle}
				>
					<AllPages
						title={selectedFile.title || ''}
						allLines={allLines}
						columnsCount={props.columnsCount}
						columnBreakOnSection={props.columnBreakOnSection}
						documentSize={props.documentSize || 'a4'}
						documentMargins={props.documentMargins}
						fontSize={props.fontSize}
					/>
				</div>
			</div>
			<aside
				className={'printPreviewShell-aside'}
				aria-label={'Print and PDF export'}
			>
				<div className={'printPreviewShell-asideStack'}>
					<div className={'printPreviewShell-systemPrintBlock'}>
						{pendingBrowserSystemPrint ? (
							<p className={'printPreviewShell-systemPrintHint'}>
								从侧栏进入时：请等左侧出现分页，再点下方按钮。Chrome
								要求在此点击才会打开打印/保存对话框。
							</p>
						) : null}
						<button
							type={'button'}
							className={'printPreviewShell-exportBtn'}
							onClick={handleSystemPrint}
							disabled={!systemPrintPagesReady}
							data-testid={'printPreview-systemPrint'}
						>
							打开打印 / 另存为 PDF
						</button>
						<p className={'printPreviewShell-exportHint'}>
							矢量排版、文字可选中；在打印目标中选「另存为
							PDF」并可改文件名。
						</p>
					</div>
					<div className={'printPreviewShell-exportBlock'}>
						<button
							type={'button'}
							className={'printPreviewShell-exportBtn'}
							onClick={handleExportPdf}
							disabled={isExportingPdf}
							data-testid={'printPreview-exportPdf'}
						>
							{isExportingPdf ? '导出中…' : '导出 PDF'}
						</button>
						<p className={'printPreviewShell-exportHint'}>
							高清图片版，便于一键保存。
						</p>
					</div>
				</div>
			</aside>
		</div>
	);
}
PrintPreview.propTypes = {
	pendingBrowserSystemPrint: PropTypes.shape({
		pdfDocumentTitle: PropTypes.string.isRequired,
	}),
	clearBrowserSystemPrint: PropTypes.func,

	chartType: PropTypes.string.isRequired,
	selectedFile: PropTypes.object.isRequired,
	columnsCount: PropTypes.number.isRequired,
	columnBreakOnSection: PropTypes.bool.isRequired,
	documentSize: PropTypes.string,
	documentMargins: PropTypes.number.isRequired,
	fontSize: PropTypes.number.isRequired,

	printChordColor: PropTypes.string,
	printChordSizePercent: PropTypes.number,
	printChordBold: PropTypes.bool,
	printChordShadowStrength: PropTypes.number,
};

PrintPreview.defaultProps = {
	pendingBrowserSystemPrint: null,
	clearBrowserSystemPrint: () => {},
};

export default PrintPreview;
