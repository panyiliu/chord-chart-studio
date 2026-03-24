import { spawn } from 'node:child_process';

const isWin = process.platform === 'win32';
const yarnCmd = isWin ? 'yarn.cmd' : 'yarn';

function run(name, args) {
	const child = spawn(yarnCmd, args, {
		stdio: 'inherit',
		shell: isWin,
		env: process.env,
		cwd: process.cwd(),
	});
	child.on('exit', (code) => {
		if (code && code !== 0) {
			process.exitCode = code;
		}
	});
	return child;
}

const children = [
	run('backup-proxy', ['workspace', 'backup-proxy', 'dev']),
	run('chord-chart-studio', ['workspace', 'chord-chart-studio', 'dev']),
];

function shutdown() {
	for (const c of children) {
		try {
			c.kill('SIGINT');
		} catch {
			// ignore
		}
	}
}

process.on('SIGINT', () => {
	shutdown();
	process.exit(130);
});
process.on('SIGTERM', () => {
	shutdown();
	process.exit(143);
});

