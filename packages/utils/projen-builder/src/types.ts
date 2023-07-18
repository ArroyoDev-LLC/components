import { type Project, type ProjectOptions } from 'projen'

export type Constructor = new (...args: any[]) => {}
export type GConstructor<T, Args extends any[] = any[]> = new (
	...args: Args
) => T

export type GenericProjectConstructor = GConstructor<Project>

export type ProjectConstructorOptions<T extends Constructor> =
	ConstructorParameters<T> extends [options: infer O]
		? O extends ProjectOptions
			? O
			: never
		: never

export type TypedPropertyDescriptorMap<T> = {
	[P in keyof T]: TypedPropertyDescriptor<T[P]>
}
