import { convertRawChordSheet } from '../../../../../src/editor/songEditor/rawChordToChordMark/convertRawChordSheet';

describe('convertRawChordSheet', () => {
	test('maps section labels and chord+lyric pairs', () => {
		const input = [
			'Verse 1',
			'C    G     Am',
			'Hello there world',
			'',
			'Chorus',
			'F  C',
			'La la la',
		].join('\n');

		const out = convertRawChordSheet(input);
		expect(out).toBe(
			[
				'#v',
				'C G Am',
				'_Hello_ there_ world',
				'',
				'#c',
				'F C',
				'_La _la la',
			].join('\n')
		);
	});

	test('single-line chord row stays as chord line', () => {
		const input = 'C  G  D';
		expect(convertRawChordSheet(input)).toBe('C G D');
	});

	test('plain lyric line passes through', () => {
		const input = 'just some words';
		expect(convertRawChordSheet(input)).toBe('just some words');
	});

	test('section mapping matching is case-insensitive for mapping keys', () => {
		const input = ['Verse 1', 'Hello world'].join('\n');
		const out = convertRawChordSheet(input, {
			sectionMapping: {
				// Intentionally mixed case to verify case-insensitive mapping keys
				'VeRsE': '#v',
			},
		});
		expect(out).toBe(['#v', 'Hello world'].join('\n'));
	});

	test('extracts key metadata into standard key line', () => {
		const input = 'Tuning: E A D G B EKey: CCapo: No capo';
		expect(convertRawChordSheet(input)).toBe(
			['Tuning: E A D G B E Capo: No capo', '', 'key C'].join('\n')
		);
	});

	test('supports minor key extraction', () => {
		const input = 'Song Info Key: f#m  Artist: demo';
		expect(convertRawChordSheet(input)).toBe(
			['Song Info Artist: demo', '', 'key F#m'].join('\n')
		);
	});

	test('does not treat monkey:/turkey: as key metadata', () => {
		const input = ['monkey: see', 'turkey: day', 'hockey: night'].join(
			'\n'
		);
		expect(convertRawChordSheet(input)).toBe(input);
	});

	test('prepends artist after rules; capture from raw before trim (UG-style)', () => {
		const input = [
			'Tabs',
			'',
			'Iloveitiloveitiloveit Chords by Bella Kay',
			'',
			'149,200 views15,433 saves5 comments',
			'',
			'Author: c4zr5jhhb9',
			'Tuning: E A D G B EKey: CCapo: No capo',
			'C    G',
			'Hello',
		].join('\n');

		const out = convertRawChordSheet(input);
		const lines = out.split('\n');
		expect(lines[0]).toBe('Artist: Bella Kay');
		expect(lines[1]).toBe('');
		expect(out).toContain('key C');
		expect(out).not.toContain('Chords by Bella Kay');
		expect(out).not.toContain('149,200 views');
		expect(out.startsWith('Artist: ')).toBe(true);
		expect(out.split('\n').some((l) => /^title\s+/i.test(l))).toBe(false);
	});

	test('artist line uses options.artistLinePrefix when provided', () => {
		const input = ['X Chords by Y', '1 views 2 saves 3 comments', 'C'].join(
			'\n'
		);
		const out = convertRawChordSheet(input, { artistLinePrefix: '歌手：' });
		expect(out.split('\n')[0]).toBe('歌手：Y');
	});

	test('can disable lyric chord marker insertion', () => {
		const input = ['C    G', 'Hello there'].join('\n');
		const out = convertRawChordSheet(input, {
			lyricChordMarkerEnabled: false,
		});
		expect(out).toBe(['C G', 'Hello there'].join('\n'));
	});

	test('supports custom lyric chord marker text', () => {
		const input = ['C    G', 'Hello there'].join('\n');
		const out = convertRawChordSheet(input, {
			lyricChordMarkerEnabled: true,
			lyricChordMarker: '|',
		});
		expect(out).toBe(['C G', '|Hello| there'].join('\n'));
	});

	test('multiline trim keyword: \\n escape, delete after Last update line (keep that line)', () => {
		const input = [
			'Tab content below',
			'X',
			'Last update: 2020',
			'noise footer',
			'more',
		].join('\n');
		const out = convertRawChordSheet(input, {
			trimRules: [
				{
					keyword: 'X\\nLast update:',
					position: 'after',
					includeMatchedLine: false,
				},
			],
		});
		expect(out).toContain('Tab content below');
		expect(out).toContain('Last update:');
		expect(out).not.toContain('noise footer');
		expect(out).not.toContain('more');
	});

	test('multiline + 包含命中行：从块首删起（123 与 456 及之后都不要）', () => {
		const input = ['keep header', '123', '456', 'noise'].join('\n');
		const out = convertRawChordSheet(input, {
			trimRules: [
				{
					keyword: '123\n456',
					position: 'after',
					includeMatchedLine: true,
				},
			],
		});
		expect(out).toContain('keep header');
		expect(out).not.toContain('123');
		expect(out).not.toContain('456');
		expect(out).not.toContain('noise');
	});

	test('multiline trim keyword: blank line between X and Last update:', () => {
		const input = ['verse line', 'X', '', 'Last update: 2020', 'junk'].join(
			'\n'
		);
		const out = convertRawChordSheet(input, {
			trimRules: [
				{
					keyword: 'X\n\nLast update:',
					position: 'after',
					includeMatchedLine: false,
				},
			],
		});
		expect(out).toContain('Last update:');
		expect(out).not.toContain('junk');
	});
});
