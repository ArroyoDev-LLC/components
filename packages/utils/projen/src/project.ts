import path from 'node:path'
import { type Component, type Project } from 'projen'

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
	ctor: T,
	component: any
): component is InstanceType<T> => component instanceof ctor

/**
 * Find component of type in a project.
 * @param project Project to search through.
 * @param component Component type to look for.
 */
export const findComponent = <T extends typeof Component>(
	project: Project,
	component: T
): InstanceType<T> | undefined => {
	return project.components.find((c) => isComponent(component, c)) as
		| InstanceType<T>
		| undefined
}
