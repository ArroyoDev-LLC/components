import { type Project } from 'projen'
import type { BuildStep } from './build-step.ts'

/**
 * Represents a class constructor.
 */
export type Constructor = new (...args: any[]) => {}

/**
 * Represents a generic constructor.
 */
export type GConstructor<T, Args extends any[] = any[]> = new (
	...args: Args
) => T

/**
 * Represents a projen project constructor.
 */
export type GenericProjectConstructor = GConstructor<Project>

/**
 * Retrieve the options type from a projen project constructor.
 */
export type ProjectConstructorOptions<T extends Constructor> =
	ConstructorParameters<T> extends [options: infer O]
		? O extends object
			? O
			: never
		: never

/**
 * Typed variant of {@link PropertyDescriptorMap}.
 */
export type TypedPropertyDescriptorMap<T> = {
	[P in keyof T]: TypedPropertyDescriptor<T[P]>
}

/**
 * Merge builder options with step.
 */
export type MergeBuildOptions<
	Ctor extends GenericProjectConstructor,
	Step extends BuildStep
> = Omit<ProjectConstructorOptions<Ctor>, keyof Step['outputOptionsType']> &
	Step['outputOptionsType']

/**
 * Merge constructor output of step.
 */
export type MergeBuildConstructor<
	Ctor extends GenericProjectConstructor,
	Step extends BuildStep
> = GConstructor<
	InstanceType<Ctor> & Step['outputType'],
	[options: MergeBuildOptions<Ctor, Step>]
>
