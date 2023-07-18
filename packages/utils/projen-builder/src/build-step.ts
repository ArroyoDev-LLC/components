import { type Project, type ProjectOptions } from 'projen'
import { type TypedPropertyDescriptorMap } from './types.ts'

/**
 * Represents a build step.
 */
export abstract class BuildStep {
	/**
	 * Options type to merge with project options.
	 */
	declare abstract outputOptionsType: {}

	/**
	 * Additional project property types to merge with resulting project type.
	 */
	declare abstract outputType: {}

	/**
	 * Apply modifications to project options prior to instantiation.
	 * @param options Input project options.
	 */
	abstract applyOptions(
		options: ProjectOptions
	): ProjectOptions & this['outputOptionsType']

	/**
	 * Apply modifications to instantiated project.
	 *
	 * @remarks
	 * The property descriptor map returned by this method
	 * will be merged into the project.
	 *
	 * @param project Input project.
	 */
	abstract applyProject(
		project: Project
	): TypedPropertyDescriptorMap<this['outputType']>
}

export class BaseBuildStep<
	OutputOptions extends object = {},
	OutputProps extends object = {}
> implements BuildStep
{
	declare outputOptionsType: OutputOptions
	declare outputType: OutputProps
	applyOptions(
		options: ProjectOptions & this['outputOptionsType']
	): ProjectOptions & this['outputOptionsType'] {
		return options
	}

	applyProject(
		_project: Project
	): TypedPropertyDescriptorMap<this['outputType']> {
		return {} as TypedPropertyDescriptorMap<this['outputType']>
	}
}
