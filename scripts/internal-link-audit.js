#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const docsJsonPath = path.join(root, 'docs.json');
const skipDirs = new Set(['.git', 'node_modules', '.mint', '.next', '.vscode']);
const docExts = new Set(['.mdx', '.md']);

function walk(dir, out = []) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.isDirectory() && skipDirs.has(entry.name)) {
			continue;
		}
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(full, out);
		} else {
			out.push(full);
		}
	}
	return out;
}

function toPosix(relPath) {
	return relPath.split(path.sep).join('/');
}

function hasFileTarget(basePath) {
	if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
		return true;
	}

	const ext = path.extname(basePath).toLowerCase();
	if (!ext) {
		const candidates = [
			`${basePath}.mdx`,
			`${basePath}.md`,
			path.join(basePath, 'index.mdx'),
			path.join(basePath, 'index.md'),
		];
		return candidates.some((candidate) => fs.existsSync(candidate));
	}

	return false;
}

function normalizeHref(rawHref) {
	const href = rawHref.trim();
	if (!href) return null;
	if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(href)) return null;
	if (href.startsWith('#')) return null;
	if (href === '...' || href.toLowerCase() === 'url') return null;
	if (href.includes('{') || href.includes('}')) return null;

	const noAnchor = href.split('#')[0].split('?')[0];
	if (!noAnchor) return null;
	return noAnchor;
}

function lineLinks(content) {
	const out = [];
	const lines = content.split(/\r?\n/);
	let inFence = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (/^\s*```/.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) {
			continue;
		}

		const mdRegex = /\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
		let m;
		while ((m = mdRegex.exec(line)) !== null) {
			out.push({ line: i + 1, href: m[1] });
		}

		const hrefRegex = /\bhref\s*=\s*"([^"]+)"/g;
		while ((m = hrefRegex.exec(line)) !== null) {
			out.push({ line: i + 1, href: m[1] });
		}

		const srcRegex = /\bsrc\s*=\s*"([^"]+)"/g;
		while ((m = srcRegex.exec(line)) !== null) {
			out.push({ line: i + 1, href: m[1] });
		}
	}

	return out;
}

function resolveTarget(fromFile, href) {
	if (href.startsWith('/')) {
		return path.join(root, href.slice(1));
	}
	return path.resolve(path.dirname(fromFile), href);
}

function collectDocsJsonPages(jsonNode, out = [], breadcrumbs = []) {
	if (Array.isArray(jsonNode)) {
		for (const item of jsonNode) {
			if (typeof item === 'string') {
				out.push({ page: item, breadcrumbs: breadcrumbs.join(' > ') });
			} else if (item && typeof item === 'object') {
				collectDocsJsonPages(item, out, breadcrumbs);
			}
		}
		return out;
	}

	if (jsonNode && typeof jsonNode === 'object') {
		const next = breadcrumbs.slice();
		if (typeof jsonNode.tab === 'string') next.push(jsonNode.tab);
		if (typeof jsonNode.group === 'string') next.push(jsonNode.group);

		for (const [key, value] of Object.entries(jsonNode)) {
			if (key === 'pages') {
				collectDocsJsonPages(value, out, next);
			} else if (value && typeof value === 'object') {
				collectDocsJsonPages(value, out, next);
			}
		}
	}

	return out;
}

function main() {
	const allFiles = walk(root);
	const docFiles = allFiles.filter((f) => docExts.has(path.extname(f).toLowerCase()));

	const brokenLinks = [];
	for (const file of docFiles) {
		const content = fs.readFileSync(file, 'utf8');
		for (const found of lineLinks(content)) {
			const normalized = normalizeHref(found.href);
			if (!normalized) continue;

			const resolved = resolveTarget(file, normalized);
			if (!hasFileTarget(resolved)) {
				brokenLinks.push({
					file: toPosix(path.relative(root, file)),
					line: found.line,
					target: found.href,
					resolved: toPosix(path.relative(root, resolved)),
				});
			}
		}
	}

	let brokenNavPages = [];
	if (fs.existsSync(docsJsonPath)) {
		const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, 'utf8'));
		const navPages = collectDocsJsonPages(docsJson.navigation || {});
		brokenNavPages = navPages
			.map((entry) => {
				const resolved = path.join(root, entry.page);
				return {
					page: entry.page,
					context: entry.breadcrumbs,
					exists: hasFileTarget(resolved),
				};
			})
			.filter((entry) => !entry.exists);
	}

	const report = {
		scanned: {
			documentationFiles: docFiles.length,
			docsJsonPresent: fs.existsSync(docsJsonPath),
		},
		summary: {
			brokenInternalTargets: brokenLinks.length,
			brokenDocsJsonPages: brokenNavPages.length,
		},
		brokenInternalTargets: brokenLinks,
		brokenDocsJsonPages: brokenNavPages,
	};

	console.log(JSON.stringify(report, null, 2));
	if (brokenLinks.length > 0 || brokenNavPages.length > 0) {
		process.exitCode = 1;
	}
}

main();
