import type { ProjectOptions } from 'projen'
import { deepMerge } from 'projen/lib/util'
import { type BuildStep } from './build-step.ts'
import {
	type GConstructor,
	type GenericProjectConstructor,
	type MergeBuildConstructor,
	type MergeBuildOptions,
	type ProjectConstructorOptions,
} from './types.ts'

/**
 * Represents a projen project builder.
 * This can be utilized to apply reusable build logic implemented through {@link BuildStep} instances.
 */
export class ProjectBuilder<
	T extends GenericProjectConstructor = GenericProjectConstructor,
	Options extends object = ProjectConstructorOptions<T>
> {
	/**
	 * Current project constructor output type.
	 */
	declare __outputType: T

	/**
	 * Current project options type.
	 */
	declare __optionsType: Options

	/**
	 * Construct a new builder instance.
	 * @param projectConstructor Projen project type to wrap.
	 * @param steps Build steps to apply (in order) on build.
	 */
	constructor(
		readonly projectConstructor: T,
		readonly steps: Array<BuildStep> = []
	) {}

	/**
	 * Add a build step to the builder.
	 *
	 * @remarks
	 * This will create a new builder instance and will not mutate the caller.
	 *
	 * @param step Build step to add.
	 * @param options Step options.
	 * @returns A new builder instance with the added step and merged types.
	 */
	add<StepT extends BuildStep>(
		step: StepT,
		options: { prepend?: boolean } = { prepend: false }
	): ProjectBuilder<
		GConstructor<
			InstanceType<T> & StepT['outputType'],
			[options: MergeBuildOptions<T, StepT>]
		>,
		MergeBuildOptions<T, StepT>
	> {
		const builder = new ProjectBuilder<
			GConstructor<InstanceType<T> & StepT['outputType']>,
			MergeBuildOptions<T, StepT>
		>(
			this.projectConstructor as unknown as MergeBuildConstructor<T, StepT>,
			options.prepend ? [step, ...this.steps] : [...this.steps, step]
		)
		return builder
	}

	/**
	 * Build the final project options.
	 * @param options Source options to use.
	 */
	buildOptions(options: Options): Options {
		// waterfall deeply merged options
		let mappedOptions = Object.assign({}, options) as Options
		this.steps.forEach((step) => {
			mappedOptions = deepMerge(
				[
					mappedOptions as ProjectOptions,
					step.applyOptions(mappedOptions as ProjectOptions) as Options,
				],
				true
			) as Options
		})

		return mappedOptions
	}

	/**
	 * Build the project.
	 * @param options Source options to use.
	 */
	build(options: Options): InstanceType<T> {
		const finalOptions = this.buildOptions(options)
		const project = new this.projectConstructor(finalOptions)

		const properties = this.steps.reduce(
			(acc, step) => ({ ...acc, ...step.applyProject(project) }),
			{} as PropertyDescriptorMap
		)
		return Object.defineProperties(project, properties) as InstanceType<T>
	}
}
