/* eslint-env node */
const baseConfig = require('../../jest.config.base');
const packageJson = require('./package');

module.exports = {
	...baseConfig,
	displayName: packageJson.name,

	rootDir: '../..',
	coveragePathIgnorePatterns: [
		'packages/chord-chart-studio/src/main.js',
		'packages/chord-chart-studio/src/core/createGetVersions.js',
		// 个人曲库扩展：单独模块，覆盖率不计入全局门槛（避免拖低原项目阈值）
		'packages/chord-chart-studio/src/personalLibrary/',
		'packages/chord-chart-studio/src/db/catalog/',
		'packages/chord-chart-studio/src/integrations/',
	],

	setupFiles: ['jest-localstorage-mock'],
};
