import { type Project, type ProjectOptions } from 'projen'
import {
	ProjectName,
	type ProjectNameSchemeOptions,
	withDefaults,
} from './project.ts'

type Constructor = new (...args: any[]) => {}
type GConstructor<T, Args extends any[] = any[]> = new (...args: Args) => T
type GenericProjectConstructor = GConstructor<Project>
type ProjectConstructorOptions<T extends Constructor> =
	ConstructorParameters<T> extends [options: infer O]
		? O extends ProjectOptions
			? O
			: never
		: never

type TypedPropertyDescriptorMap<T> = {
	[P in keyof T]: TypedPropertyDescriptor<T[P]>
}

export abstract class BuilderStep {
	declare abstract outputOptionsType: {}
	declare abstract outputType: {}

	abstract applyOptions(
		options: ProjectOptions
	): ProjectOptions & this['outputOptionsType']

	abstract applyProject(
		project: Project
	): TypedPropertyDescriptorMap<this['outputType']>
}

