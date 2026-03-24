import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import TRANSLATION_MAP from './translations';

const I18N_STORAGE_KEY = 'chordStudio.uiLang';

const SUPPORTED_LANGS = ['zh', 'en'];

function detectBrowserLang() {
	try {
		const raw =
			typeof navigator !== 'undefined'
				? navigator.language || navigator.userLanguage || ''
				: '';
		const s = String(raw).toLowerCase();
		if (s.startsWith('zh') || s.includes('zh-cn') || s.includes('zh-hans')) {
			return 'zh';
		}
		return 'en';
	} catch {
		return 'zh';
	}
}

const LEGACY_TRANSLATIONS = {
	zh: {
		// Nav
		'Edit': '编辑',
		'Screen view': '屏幕视图',
		'Print/PDF Preview': '打印/PDF预览',
		'Export Preview': '导出预览',

		// Right bar (Rendering widgets)
		'Editor preferences': '编辑器偏好',
		'Theme': '主题',
		'Darks 1 (default)': '深色 1（默认）',
		'Dark 1 (default)': '深色 1（默认）',
		'Dark 2': '深色 2',
		'Dark 3': '深色 3',
		'Export format': '导出格式',
		'ChordMark (Source)': 'ChordMark（源码）',
		'ChordPro': 'ChordPro',
		'UltimateGuitar': 'Ultimate Guitar',
		'Key': '调性',
		'Transpose': '移调',
		'Preferred accidentals': '偏好变音符',
		'Auto': '自动',
		'Symbols type': '符号类型',
		'Chord symbols': '和弦符号',
		'Roman numerals': '罗马数字',
		'Chart settings': '谱面设置',
		'Type': '类型',
		'Show everything': '显示全部',
		'Lyrics only': '仅歌词',
		'Chords only': '仅和弦',
		'Chords + First lyric line': '和弦 + 首句歌词',
		'Align chords with lyrics': '和弦与歌词对齐',
		'Align bars': '对齐小节线',
		'Auto repeat chords': '自动重复和弦',
		'Expand copied sections': '展开复制段落',
		'Layout': '版式',
		'Print / PDF — chord style': '打印/PDF — 和弦样式',
		'Chord color': '和弦颜色',
		'Same as lyrics': '与歌词一致',
		'Blue': '蓝色',
		'Teal': '青色',
		'Red': '红色',
		'Purple': '紫色',
		'Black': '黑色',
		'Chord size': '和弦字号',
		'Bold chord symbols': '粗体和弦',
		'Chord shadow': '和弦阴影',
		'Page': '页面',
		'Font size': '字体大小',
		'Columns': '列数',
		'Column Break on section': '按段落分页',
		'Margins': '页边距',

		// Input format selector
		'Input format:': '输入格式：',
		'Detect': '检测',
		'Bracketed chords (ChordPro)': '括号和弦（ChordPro）',
		'Chords over lyrics (Ultimate Guitar...)': '歌词上方和弦（Ultimate Guitar...）',

		// Buttons / tooltips
		'降': '降',
		'升': '升',
		'复原': '复原',
		'已复原': '已复原',
		'Language': '语言',
		'Chinese': '中文',
		'English': '英文',

		// Misc
		'User Guide': '用户指南',
		'ChordMark preview': 'ChordMark 预览',
		'界面配色': '界面配色',
		'跟随系统': '跟随系统',
		'浅色': '浅色',
		'深色': '深色',

		'Logo by': 'Logo 设计：',
		'Chord Chart Studio': '和弦图工作室',
		'ChordSymbol': '和弦符号',
		'ChordMark': '和弦标记',
	},
	en: {
		// Nav
		'Edit': 'Edit',
		'Screen view': 'Screen view',
		'Print/PDF Preview': 'Print/PDF Preview',
		'Export Preview': 'Export Preview',

		// Right bar (Rendering widgets)
		'Editor preferences': 'Editor preferences',
		'Theme': 'Theme',
		'Dark 1 (default)': 'Dark 1 (default)',
		'Dark 2': 'Dark 2',
		'Dark 3': 'Dark 3',
		'Export format': 'Export format',
		'ChordMark (Source)': 'ChordMark (Source)',
		'ChordPro': 'ChordPro',
		'UltimateGuitar': 'UltimateGuitar',
		'Key': 'Key',
		'Transpose': 'Transpose',
		'Preferred accidentals': 'Preferred accidentals',
		'Auto': 'Auto',
		'Symbols type': 'Symbols type',
		'Chord symbols': 'Chord symbols',
		'Roman numerals': 'Roman numerals',
		'Chart settings': 'Chart settings',
		'Type': 'Type',
		'Show everything': 'Show everything',
		'Lyrics only': 'Lyrics only',
		'Chords only': 'Chords only',
		'Chords + First lyric line': 'Chords + First lyric line',
		'Align chords with lyrics': 'Align chords with lyrics',
		'Align bars': 'Align bars',
		'Auto repeat chords': 'Auto repeat chords',
		'Expand copied sections': 'Expand copied sections',
		'Layout': 'Layout',
		'Print / PDF — chord style': 'Print / PDF — chord style',
		'Chord color': 'Chord color',
		'Same as lyrics': 'Same as lyrics',
		'Blue': 'Blue',
		'Teal': 'Teal',
		'Red': 'Red',
		'Purple': 'Purple',
		'Black': 'Black',
		'Chord size': 'Chord size',
		'Bold chord symbols': 'Bold chord symbols',
		'Chord shadow': 'Chord shadow',
		'Page': 'Page',
		'Font size': 'Font size',
		'Columns': 'Columns',
		'Column Break on section': 'Column Break on section',
		'Margins': 'Margins',

		// Input format selector
		'Input format:': 'Input format:',
		'Detect': 'Detect',
		'Bracketed chords (ChordPro)': 'Bracketed chords (ChordPro)',
		'Chords over lyrics (Ultimate Guitar...)':
			'Chords over lyrics (Ultimate Guitar...)',

		// Buttons / tooltips
		'降': 'Down',
		'升': 'Up',
		'复原': 'Reset',
		'已复原': 'Reset applied',
		'Language': 'Language',
		'Chinese': 'Chinese',
		'English': 'English',

		// Misc
		'User Guide': 'User Guide',
		'ChordMark preview': 'ChordMark preview',
		'界面配色': 'UI color scheme',
		'跟随系统': 'Follow system',
		'浅色': 'Light',
		'深色': 'Dark',
		'Logo by': 'Logo by',
		'Chord Chart Studio': 'Chord Chart Studio',
	},
};

function safeGetStoredLang() {
	try {
		if (typeof window === 'undefined' || !window?.localStorage) return null;
		const raw = window.localStorage.getItem(I18N_STORAGE_KEY);
		if (raw && SUPPORTED_LANGS.includes(raw)) {
			return raw;
		}
		return null;
	} catch {
		return null;
	}
}

const I18nContext = createContext({
	lang: 'zh',
	setLang: () => {},
	t: (s) => s,
});

export function I18nProvider(props) {
	const [lang, setLang] = useState(() => {
		return safeGetStoredLang() || detectBrowserLang();
	});

	useEffect(() => {
		try {
			window?.localStorage?.setItem(I18N_STORAGE_KEY, lang);
		} catch {
			// ignore
		}
	}, [lang]);

	const api = useMemo(() => {
		function t(text, vars) {
			if (text == null) return '';
			const s = String(text);
			let out = TRANSLATION_MAP[lang]?.[s] ?? s;
			if (vars && typeof vars === 'object') {
				out = out.replace(/{{\s*(\w+)\s*}}/g, (m, key) =>
					key in vars ? String(vars[key]) : m
				);
			}
			return out;
		}
		return { lang, setLang, t };
	}, [lang]);

	return (
		<I18nContext.Provider value={api}>{props.children}</I18nContext.Provider>
	);
}

export function useI18n() {
	return useContext(I18nContext);
}

