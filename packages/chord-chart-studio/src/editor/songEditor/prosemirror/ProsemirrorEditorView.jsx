import './ProsemirrorEditorView.scss';

import React, {
	useEffect,
	useRef,
	forwardRef,
	useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';

import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser as pmDOMParser } from 'prosemirror-model';

import getPlugins from './getPlugins';
import editorSchema from './schema';

import stateToText from './converters/stateToText';
import textToDom from './converters/textToDom';

import 'prosemirror-view/style/prosemirror.css';

/**
 * 将左侧源码区与右侧预览区（ScrollSync 两列）滚到顶部。
 * @param {HTMLElement | null} editorDom - ProseMirror 根节点
 */
function scrollSongEditorPanelsToTop(editorDom) {
	if (!editorDom || typeof editorDom.closest !== 'function') {
		return;
	}
	const source = editorDom.closest('.songEditor-source');
	if (source) {
		source.scrollTop = 0;
	}
	const row = editorDom.closest('.songEditor');
	if (row) {
		const preview = row.querySelector('.songEditor-preview');
		if (preview) {
			preview.scrollTop = 0;
		}
	}
}

function createEditorState(editorContent) {
	return EditorState.create({
		doc: pmDOMParser
			.fromSchema(editorSchema)
			.parse(textToDom(editorContent), { preserveWhitespace: 'full' }),
		plugins: getPlugins(),
	});
}

function createDocFromText(text) {
	return pmDOMParser
		.fromSchema(editorSchema)
		.parse(textToDom(text), { preserveWhitespace: 'full' });
}

function normalizeClipboardText(text) {
	return String(text || '')
		.replace(/\r\n?/g, '\n')
		.replace(/[\u2028\u2029]/g, '\n');
}

function createEditorView(editorState, updateFile, fileId) {
	return new EditorView(null, {
		state: editorState,
		handlePaste(view, event) {
			const raw = event?.clipboardData?.getData('text/plain');
			if (typeof raw !== 'string' || raw.length === 0) {
				return false;
			}
			const normalized = normalizeClipboardText(raw);
			const parser = pmDOMParser.fromSchema(editorSchema);
			const slice = parser.parseSlice(textToDom(normalized), {
				preserveWhitespace: 'full',
			});
			const tr = view.state.tr.replaceSelection(slice).scrollIntoView();
			view.dispatch(tr);
			return true;
		},
		dispatchTransaction: function dispatchTransaction(transaction) {
			const { state, transactions } =
				this.state.applyTransaction(transaction);

			this.updateState(state);

			if (transactions.some((tr) => tr.docChanged)) {
				updateFile(fileId, { content: stateToText(state) });
			}
		},
	});
}

const ProsemirrorEditorView = forwardRef(
	function ProsemirrorEditorViewInner(props, ref) {
		const { selectedFileId, editorContent, updateFile } = props;

		const editorView = useRef();
		const editorDom = useRef();
		const previousFileId = usePrevious(selectedFileId);

		useImperativeHandle(
			ref,
			() => ({
				getPlainText: () => {
					if (!editorView.current) {
						return '';
					}
					return stateToText(editorView.current.state);
				},
				replacePlainText: (text) => {
					if (!editorView.current || !selectedFileId) {
						return;
					}
					const next = createEditorState(text);
					editorView.current.updateState(next);
					updateFile(selectedFileId, { content: text });
				},
				replacePlainTextWithUndo: (text) => {
					if (!editorView.current || !selectedFileId) {
						return;
					}
					const view = editorView.current;
					const nextDoc = createDocFromText(text);
					const tr = view.state.tr;
					tr.replaceWith(
						0,
						view.state.doc.content.size,
						nextDoc.content
					);
					tr.setMeta('addToHistory', true);
					view.dispatch(tr);
				},
				scrollToTop: () => {
					if (!editorView.current) {
						return;
					}
					scrollSongEditorPanelsToTop(editorView.current.dom);
				},
			}),
			[selectedFileId, updateFile]
		);

		/**
		 * Editor is recreated on component mount and on file change.
		 * The later is needed as we need to to re-bind the change handler with the new file id.
		 */
		function shouldCreateEditor() {
			return (
				selectedFileId &&
				(!editorView.current || previousFileId !== selectedFileId)
			);
		}

		// Editor has been previously created, but now no file is selected anymore
		function isEditorOrphan() {
			return editorExists() && !selectedFileId;
		}

		function editorExists() {
			return editorView.current && editorView.current.dom.parentNode;
		}

		function destroyEditor() {
			editorView.current.dom.parentNode.removeChild(
				editorView.current.dom
			);
		}

		useEffect(() => {
			if (shouldCreateEditor()) {
				if (editorExists()) {
					destroyEditor();
				}

				const editorState = createEditorState(editorContent);
				editorView.current = createEditorView(
					editorState,
					updateFile,
					selectedFileId
				);
				editorDom.current.appendChild(editorView.current.dom);

				// expose editor instance as a component property for unit tests
				ProsemirrorEditorView.editorView = editorView.current;
			} else if (isEditorOrphan()) {
				destroyEditor();
			}
		});

		return <div className={'prosemirrorWrapper'} ref={editorDom} />;
	}
);

ProsemirrorEditorView.displayName = 'ProsemirrorEditorView';

ProsemirrorEditorView.defaultProps = {
	selectedFileId: '',
	editorContent: '',
};

ProsemirrorEditorView.propTypes = {
	selectedFileId: PropTypes.string,
	editorContent: PropTypes.string,
	updateFile: PropTypes.func.isRequired,
};

export default ProsemirrorEditorView;

// @see https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
function usePrevious(value) {
	const ref = useRef();
	useEffect(() => {
		ref.current = value;
	});
	return ref.current;
}
