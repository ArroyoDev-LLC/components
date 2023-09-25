import { type Project } from 'projen'

/**
 * Represents a class constructor.
 */
export type Constructor = new (...args: any[]) => any

/**
 * Represents a generic constructor.
 */
export type GConstructor<T, Args extends any[] = any[]> = new (
	...args: Args
) => T

/**
 * Represents a projen project constructor.
 */
export type GenericProjectConstructor<
	T extends Project = Project,
	Options = [options: any],
> = GConstructor<T, [options: Options]>

export type Identity<T> = T
export type Flatten<T> = Identity<{ [k in keyof T]: T[k] }>
export type ExtendShape<A, B> = Flatten<Omit<A, keyof B> & B>

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
