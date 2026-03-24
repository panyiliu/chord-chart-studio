import {
	buildChordTextShadow,
	getPrintChordStyleVars,
	PRINT_CHORD_COLOR_PRESETS,
} from '../../../../../src/songRenderers/printPreview/helpers/printChordStyle';

describe('printChordStyle', () => {
	test('getPrintChordStyleVars maps options to CSS variables', () => {
		const s = getPrintChordStyleVars({
			printChordColor: 'teal',
			printChordSizePercent: 120,
			printChordBold: false,
		});

		expect(s['--print-chord-color']).toBe(PRINT_CHORD_COLOR_PRESETS.teal);
		expect(s['--print-chord-scale']).toBe('1.2');
		expect(s['--print-chord-weight']).toBe('400');
	});

	test('getPrintChordStyleVars clamps chord size', () => {
		const low = getPrintChordStyleVars({ printChordSizePercent: 50 });
		expect(low['--print-chord-scale']).toBe('0.8');

		const high = getPrintChordStyleVars({ printChordSizePercent: 200 });
		expect(high['--print-chord-scale']).toBe('1.6');
	});

	test('getPrintChordStyleVars uses defaults when omitted', () => {
		const s = getPrintChordStyleVars({});
		expect(s['--print-chord-color']).toBe(PRINT_CHORD_COLOR_PRESETS.blue);
		expect(s['--print-chord-scale']).toBe('1.15');
		expect(s['--print-chord-weight']).toBe('600');
		expect(s['--print-chord-text-shadow']).toBe('none');
	});

	test('buildChordTextShadow returns none for zero or negative', () => {
		expect(buildChordTextShadow(0)).toBe('none');
		expect(buildChordTextShadow(-5)).toBe('none');
	});

	test('buildChordTextShadow scales blur and opacity with strength', () => {
		const full = buildChordTextShadow(100);
		expect(full).toContain('rgba(0, 0, 0, 0.5)');
		expect(full).toContain('7px');

		const half = buildChordTextShadow(50);
		expect(half).toContain('rgba(0, 0, 0, 0.25)');
	});

	test('getPrintChordStyleVars passes shadow to CSS var', () => {
		const s = getPrintChordStyleVars({ printChordShadowStrength: 100 });
		expect(s['--print-chord-text-shadow']).toBe(buildChordTextShadow(100));
	});
});
