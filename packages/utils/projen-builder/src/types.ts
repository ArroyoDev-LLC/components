import { type Project, type ProjectOptions } from 'projen'

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
		? O extends ProjectOptions
			? O
			: never
		: never

/**
 * Typed variant of {@link PropertyDescriptorMap}.
 */
export type TypedPropertyDescriptorMap<T> = {
	[P in keyof T]: TypedPropertyDescriptor<T[P]>
}
