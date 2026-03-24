import deepFreeze from 'deep-freeze';

import reducers from '../../../../src/integrations/aiPromptTemplates/reducers';
import {
	addPromptTemplate,
	removePromptTemplate,
	reorderPromptTemplates,
	selectFileImportPromptTemplate,
	selectImportPromptTemplate,
	selectUrlImportPromptTemplate,
} from '../../../../src/integrations/aiPromptTemplates/actions';

describe('integrations/aiPromptTemplates: reducers', () => {
	const initial = deepFreeze(reducers());

	test('add and select import', () => {
		let s = reducers(
			initial,
			addPromptTemplate({
				id: 't2',
				name: 'B',
				content: 'x\n{{CATALOG}}',
				isBuiltIn: false,
			})
		);
		expect(s.templates).toHaveLength(initial.templates.length + 1);
		s = reducers(s, selectImportPromptTemplate('t2'));
		expect(s.selectedImportTemplateId).toBe('t2');
	});

	test('select url / file import template', () => {
		let s = reducers(
			initial,
			selectUrlImportPromptTemplate('tmpl_default')
		);
		expect(s.selectedUrlImportTemplateId).toBe('tmpl_default');
		s = reducers(s, selectFileImportPromptTemplate('tmpl_default'));
		expect(s.selectedFileImportTemplateId).toBe('tmpl_default');
	});

	test('cannot remove last template', () => {
		const s = reducers(initial, removePromptTemplate('tmpl_default'));
		expect(s.templates).toHaveLength(initial.templates.length);
	});

	test('cannot remove built-in when multiple exist', () => {
		let s = reducers(
			initial,
			addPromptTemplate({
				id: 't2',
				name: 'B',
				content: 'x',
				isBuiltIn: false,
			})
		);
		s = reducers(s, removePromptTemplate('tmpl_default'));
		expect(s.templates.some((t) => t.id === 'tmpl_default')).toBe(true);
	});

	test('reorder templates by id list', () => {
		let s = reducers(
			initial,
			addPromptTemplate({
				id: 't2',
				name: 'B',
				content: 'x',
				isBuiltIn: false,
			})
		);
		const ids = s.templates.map((t) => t.id);
		const rotated = [...ids.slice(1), ids[0]];
		s = reducers(s, reorderPromptTemplates(rotated));
		expect(s.templates.map((t) => t.id)).toEqual(rotated);
	});
});
