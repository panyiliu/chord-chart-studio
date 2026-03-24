#!/usr/bin/env node
/* eslint-env node */
/**
 * 从本机 .env / ingredient 项目 .env 读取常见 API 变量，打印为
 * 1) 可粘贴到 packages/chord-chart-studio/.env.local 的 VITE_* 行
 * 2) 可手动在「AI 设置」里填写的对照表（密钥只显示前后各 4 位）
 */
const fs = require('fs');
const path = require('path');

const pkgRoot = path.join(__dirname, '..');

function readEnvFile(filePath) {
	try {
		if (!fs.existsSync(filePath)) {
			return null;
		}
		return fs.readFileSync(filePath, 'utf8');
	} catch {
		return null;
	}
}

function parseEnv(text) {
	const out = {};
	if (!text) {
		return out;
	}
	for (const line of text.split(/\r?\n/)) {
		const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
		if (!m) {
			continue;
		}
		let v = m[2];
		if (
			(v.startsWith('"') && v.endsWith('"')) ||
			(v.startsWith("'") && v.endsWith("'"))
		) {
			v = v.slice(1, -1);
		}
		out[m[1]] = v;
	}
	return out;
}

function mask(s) {
	if (!s || s.length < 12) {
		return '(太短，不显示)';
	}
	return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

const candidates = [
	path.join(pkgRoot, '.env.local'),
	path.join(pkgRoot, '.env'),
	path.join(pkgRoot, '..', '..', 'ingredient_Management', '.env'),
	path.join(pkgRoot, '..', '..', 'ingredient_Management', '.env.local'),
];

const argvPath = process.argv[2];
if (argvPath) {
	candidates.unshift(path.resolve(argvPath));
}

let picked = null;
let pickedPath = null;
for (const p of candidates) {
	const raw = readEnvFile(p);
	if (raw) {
		picked = parseEnv(raw);
		pickedPath = p;
		break;
	}
}

console.log('\n=== Chord Chart Studio → AI 配置（对照） ===\n');
if (!picked) {
	console.log(
		'未找到任何 .env 文件。已尝试路径：\n',
		candidates.map((c) => `  - ${c}`).join('\n'),
		'\n\n可手动指定：',
		'node scripts/printChordStudioAiEnv.js "D:\\path\\to\\.env"'
	);
	console.log(
		'\n\n请在 packages/chord-chart-studio/.env.local 自建文件，例如：\n',
		'VITE_AI_DEFAULT_NAME=我的 OpenAI\n',
		'VITE_AI_DEFAULT_BASE_URL=https://api.openai.com/v1\n',
		'VITE_AI_DEFAULT_MODEL=gpt-4o-mini\n',
		'VITE_AI_DEFAULT_API_KEY=sk-...\n'
	);
	process.exit(0);
}

console.log('读取来源:', pickedPath, '\n');

const vk = picked.VOLCENGINE_API_KEY || picked.VITE_AI_DEFAULT_API_KEY || '';
const openaiKey = picked.OPENAI_API_KEY || '';
const baseUrl =
	picked.VITE_AI_DEFAULT_BASE_URL ||
	picked.VITE_OPENAI_BASE_URL ||
	'https://api.openai.com/v1';
const model =
	picked.VITE_AI_DEFAULT_MODEL || picked.OPENAI_MODEL || 'gpt-4o-mini';

console.log('--- 手动填写「AI 设置」表单 ---');
console.log('显示名称:  Env import 或 我的引擎');
console.log('Base URL: ', baseUrl);
console.log('模型:     ', model);
if (vk) {
	console.log(
		'API Key:  ',
		mask(vk),
		'(VOLCENGINE_API_KEY 或 VITE_AI_DEFAULT_API_KEY)'
	);
}
if (openaiKey) {
	console.log('API Key:  ', mask(openaiKey), '(OPENAI_API_KEY)');
}
if (!vk && !openaiKey) {
	console.log(
		'API Key:  (未在文件中找到 VOLCENGINE_API_KEY / OPENAI_API_KEY / VITE_AI_DEFAULT_API_KEY)'
	);
}

console.log(
	'\n--- 可写入 packages/chord-chart-studio/.env.local（开发时自动注入空引擎列表）---\n'
);
const keyToUse = vk || openaiKey;
if (keyToUse) {
	console.log(`VITE_AI_DEFAULT_NAME=Env import`);
	console.log(`VITE_AI_DEFAULT_BASE_URL=${baseUrl}`);
	console.log(`VITE_AI_DEFAULT_MODEL=${model}`);
	console.log(`VITE_AI_DEFAULT_API_KEY=${keyToUse}`);
} else {
	console.log(
		'# 未解析到密钥，请把密钥填入下方后保存为 .env.local：\nVITE_AI_DEFAULT_API_KEY='
	);
}

console.log(
	'\n说明：火山豆包 / Ark 等若与 OpenAI 路径不同，请把 Base URL 填成「完整 chat completions 前缀」',
	'或确保与 resolveChatCompletionsUrl 逻辑一致（见 src/integrations/aiEngines/openAiChat.js）。\n'
);
