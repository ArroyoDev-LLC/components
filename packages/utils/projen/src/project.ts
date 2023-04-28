import path from 'node:path'

/**
 * Ensures a relative path is prefixed from cwd.
 * @param from Path relative from.
 * @param to  Path relative to.
 */
export const cwdRelativePath = (from: string, to: string): string => {
	const relPath = path.relative(from, to)
	const { dir, ...pathParts } = path.parse(relPath)
	const parentDir = dir
		? path.format({ dir: dir.startsWith('..') ? '' : '.', base: dir })
		: '.'
	return path.format({
		...pathParts,
		dir: parentDir,
	})
}
