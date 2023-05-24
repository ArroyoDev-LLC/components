import path from 'node:path'
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

/**
 * Merge a list of steps into an existing task.
 * @param project Owner of task.
 * @param taskId Id of target task.
 * @param steps Array of task steps to merge.
 */
export const replaceTask = (
	project: Project,
	taskId: string,
	steps: TaskStep[]
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
		(_, i) => i + 1
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
 * Project name utility.
 */
export class ProjectName {
	constructor(readonly name: string) {}

	get path(): string {
		return this.name.split('.').join('/')
	}

	get outDir(): string {
		return `packages/${this.path}`
	}

	get packageName(): string {
		return `@arroyodev-llc/${this.name}`
	}
}
