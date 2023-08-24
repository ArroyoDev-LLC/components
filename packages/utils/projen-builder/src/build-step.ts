import { type Project, type ProjectOptions } from 'projen'
import { type TypedPropertyDescriptorMap } from './types.ts'

export type AnyBuildStep = BuildStep<any, any>
export type BuildOutput<T extends BuildStep<any, any>> = T['_output']
export type BuildOptions<T extends BuildStep<any, any>> = T['_outputOptions']

/**
 * Represents a build step. */
export abstract class BuildStep<Options = any, Output = any> {
	/**
	 * Options type to merge with project options.
	 */
	readonly _outputOptions!: Options

	/**
	 * Additional project property types to merge with resulting project type.
	 */
	readonly _output!: Output

	/**
	 * Apply modifications to project options prior to instantiation.
	 * @param options Input project options.
	 */
	abstract applyOptions(
		options: ProjectOptions,
	): ProjectOptions & BuildOptions<this>

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
		project: Project,
	): TypedPropertyDescriptorMap<BuildOutput<this>>
}

export class BaseBuildStep<
	OutputOptions extends object = {},
	OutputProps extends object = {},
> extends BuildStep<OutputOptions, OutputProps> {
	applyOptions(
		options: ProjectOptions & this['_outputOptions'],
	): ProjectOptions & this['_outputOptions'] {
		return options
	}

	applyProject(
		_project: Project,
	): TypedPropertyDescriptorMap<BuildOutput<this>> {
		return {} as TypedPropertyDescriptorMap<BuildOutput<this>>
	}
}
