import path from 'node:path'
import { defu } from 'defu'
import { type Component, type Project, type TaskStep } from 'projen'

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
export const isComponent = <T extends new (...args: any[]) => Component>(
	ctor: T,
	component: any,
): component is InstanceType<T> => component instanceof ctor

/**
 * Find component of type in a project.
 * @param project Project to search through.
 * @param component Component type to look for.
 */
export const findComponent = <T extends new (...args: any[]) => Component>(
	project: Project,
	component: T,
): InstanceType<T> | undefined => {
	return project.components.find((c) => isComponent(component, c)) as
		| InstanceType<T>
		| undefined
}

/**
 * Merge a list of steps into an existing task.
 * @param project Owner of task.
 * @param taskId Id of target task.
 * @param steps Array of task steps to merge.
 */
export const replaceTask = (
	project: Project,
	taskId: string,
	steps: TaskStep[],
) => {
	const task = project.tasks.tryFind(taskId)
	if (!task) {
		throw new Error(`Could not find task ${taskId}`)
	}
	const spec = task._renderSpec()
	// @ts-expect-error workaround dependant tasks.
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	delete project.tasks._tasks[taskId]
	const numSteps = Math.max(steps.length, spec.steps?.length ?? 0)
	const newSteps = Array.from(
		{ length: numSteps },
		(_, i) => i + 1,
	).map<TaskStep>((idx) => ({
		...(spec.steps?.[idx - 1] ?? {}),
		...(steps[idx - 1] ?? {}),
	}))
	const newTask = project.tasks.addTask(taskId, {
		...spec,
		steps: newSteps,
	})
	newTask.lock()
	return newTask
}

/**
 * Find absolute root project.
 * @param project source project.
 */
export const findRootProject = (project: Project): Project => {
	if (project.parent) return findRootProject(project.parent)
	return project
}

/**
 * Return callback result from first ancestor that returns a truthy value.
 * @param project - Project to search upwards from.
 * @param callback
 */
export const firstAncestor = <
	T extends (project: Project, ...args: any[]) => unknown,
>(
	project: Project,
	callback: T,
): ReturnType<T> | undefined => {
	const result = callback(project)
	if (result) return result as ReturnType<T>
	if (!project.parent) return undefined
	return firstAncestor(project.parent, callback)
}

export interface ProjectNameSchemeOptions {
	/**
	 * Package name scope.
	 */
	scope?: string
	/**
	 * Root packages directory.
	 * @default 'packages/'
	 */
	packagesDir?: string
}

export interface SupportsNameScheme {
	readonly namingScheme: ProjectNameSchemeOptions

	nameScheme(name: string): ProjectName
}

/**
 * Project name utility.
 */
export class ProjectName {
	public static supportsNameScheme<ProjectT extends Project>(
		project: ProjectT,
	): project is ProjectT & SupportsNameScheme {
		return 'namingScheme' in project && 'nameScheme' in project
	}

	public static fromScheme(
		scheme: ProjectNameSchemeOptions,
	): (name: string) => ProjectName {
		return (name) => new ProjectName(name, scheme)
	}

	public static ensureScheme(
		name: string,
		parent?: Project,
		defaultOptions?: ProjectNameSchemeOptions,
	) {
		let projectName = new ProjectName(name, defaultOptions)
		if (parent) {
			projectName =
				firstAncestor(parent, (project) =>
					ProjectName.supportsNameScheme(project)
						? project.nameScheme(name)
						: undefined,
				) ?? projectName
		}
		return projectName
	}

	constructor(
		readonly name: string,
		readonly scheme?: ProjectNameSchemeOptions,
	) {}

	get path(): string {
		return this.name.split('.').join('/')
	}

	get outDir(): string {
		return path.join(this.scheme?.packagesDir ?? 'packages', this.path)
	}

	get packageName(): string {
		return [this.scheme?.scope, this.name].filter(Boolean).join('/')
	}
}

/**
 * Create a function that deeply merges a source object with a list of defaults.
 * @param defaults list of default values to use as fallbacks.
 */
export const withDefaults = <T extends object>(
	...defaults: Array<Partial<T>>
): ((source: Partial<T>) => T) => {
	return (source: Partial<T>) => defu(source, ...(defaults as T[])) as T
}
