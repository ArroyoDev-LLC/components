import path from 'node:path'
import { type Component } from 'projen'
import { type Class } from 'type-fest'

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

/**
 * Component type guard.
 * @param ctor Component class.
 * @param component Component instance to guard/test.
 */
export const isComponent = <T extends typeof Component>(
	ctor: Class<T>,
	component: any
): component is T => component instanceof ctor
