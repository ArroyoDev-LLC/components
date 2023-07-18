import { type Project, type ProjectOptions } from 'projen'
import { type TypedPropertyDescriptorMap } from './types.ts'

export abstract class BuildStep {
	declare abstract outputOptionsType: {}
	declare abstract outputType: {}

	abstract applyOptions(
		options: ProjectOptions
	): ProjectOptions & this['outputOptionsType']

	abstract applyProject(
		project: Project
	): TypedPropertyDescriptorMap<this['outputType']>
}
