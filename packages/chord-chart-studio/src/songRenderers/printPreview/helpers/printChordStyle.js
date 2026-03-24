/** Preset keys stored in songFormatting.printChordColor */
export const PRINT_CHORD_COLOR_PRESETS = {
	inherit: 'inherit',
	blue: '#1565c0',
	teal: '#0e7490',
	red: '#c0392b',
	purple: '#6c3483',
	black: '#111111',
};

const DEFAULTS = {
	printChordColor: 'blue',
	printChordSizePercent: 115,
	printChordBold: true,
	printChordShadowStrength: 0,
};

/**
 * @param {number|string|undefined} strength 0–100 (0 = no shadow)
 * @returns {string} CSS `text-shadow` value or `none`
 */
export function buildChordTextShadow(strength) {
	const raw =
		strength == null ? DEFAULTS.printChordShadowStrength : Number(strength);
	if (Number.isNaN(raw) || raw <= 0) {
		return 'none';
	}
	const s = Math.min(100, Math.max(0, raw));
	const alpha = (s / 100) * 0.5;
	const blurPx = 1 + (s / 100) * 6;
	const offsetYPx = 0.5 + (s / 100) * 2.5;
	return `0 ${offsetYPx}px ${blurPx}px rgba(0, 0, 0, ${alpha})`;
}

/**
 * CSS custom properties for `.printPreview` chord symbol styling.
 * @param {object} opts
 * @param {string} [opts.printChordColor]
 * @param {number} [opts.printChordSizePercent]
 * @param {boolean} [opts.printChordBold]
 * @param {number} [opts.printChordShadowStrength] 0–100
 * @returns {Record<string, string>}
 */
export function getPrintChordStyleVars(opts = {}) {
	const colorKey = opts.printChordColor ?? DEFAULTS.printChordColor;
	const color =
		PRINT_CHORD_COLOR_PRESETS[colorKey] ??
		PRINT_CHORD_COLOR_PRESETS[DEFAULTS.printChordColor];

	const size = opts.printChordSizePercent ?? DEFAULTS.printChordSizePercent;
	const scale = Math.min(160, Math.max(80, Number(size))) / 100;

	const bold =
		opts.printChordBold !== undefined
			? opts.printChordBold
			: DEFAULTS.printChordBold;
	const weight = bold ? 600 : 400;

	const shadowStrength =
		opts.printChordShadowStrength !== undefined
			? opts.printChordShadowStrength
			: DEFAULTS.printChordShadowStrength;

	return {
		'--print-chord-color': color,
		'--print-chord-scale': String(scale),
		'--print-chord-weight': String(weight),
		'--print-chord-text-shadow': buildChordTextShadow(shadowStrength),
	};
}
