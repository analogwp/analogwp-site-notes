#!/usr/bin/env node

/**
 * Copy Inter woff2 files from @fontsource/inter into assets/fonts/inter.
 */

const fs = require('fs');
const path = require('path');

const pluginRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(pluginRoot, 'node_modules', '@fontsource', 'inter', 'files');
const destDir = path.join(pluginRoot, 'assets', 'fonts', 'inter');
const weights = [400, 500, 600, 700];
const subsets = ['latin', 'latin-ext'];

if (!fs.existsSync(sourceDir)) {
	console.error('Missing @fontsource/inter. Run: npm install');
	process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });

for (const weight of weights) {
	for (const subset of subsets) {
		const filename = `inter-${subset}-${weight}-normal.woff2`;
		fs.copyFileSync(path.join(sourceDir, filename), path.join(destDir, filename));
	}
}

console.log('Copied Inter font files to assets/fonts/inter/');
