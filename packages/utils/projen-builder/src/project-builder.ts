import type { Project, ProjectOptions } from 'projen'
import { deepMerge } from 'projen/lib/util'
import {
	type AnyBuildStep,
	type BuildOptions,
	type BuildOutput,
	type BuildStep,
} from './build-step.ts'
import type {
	ExtendShape,
	Flatten,
	GConstructor,
	GenericProjectConstructor,
	ProjectConstructorOptions,
} from './types.ts'

export type AnyProjectBuilder = ProjectBuilder<any, any, any>
export type ProjectBuilderOptions<T extends AnyProjectBuilder> = T['_options']
export type ProjectBuilderInput<T extends AnyProjectBuilder> = T['_input']
export type ProjectBuilderProps<T extends AnyProjectBuilder> = T['_props']

export type ProjectBuilderOutput<T extends AnyProjectBuilder> = InstanceType<
	ProjectBuilderInput<T>
> &
	Flatten<ProjectBuilderProps<T>>

/**
 * Represents a projen project builder.
 * This can be utilized to apply reusable build logic implemented through {@link BuildStep} instances.
 */
export class ProjectBuilder<
	T extends GConstructor<any, any[]> = GenericProjectConstructor,
	Options extends object = ProjectConstructorOptions<T>,
	Props = {}
> {
	/**
	 * Input project constructor.
	 */
	readonly _input!: T

	/**
	 * Current project options type.
	 */
	readonly _options!: Options

	/**
	 * Current build step properties to merge.
	 */
	readonly _props!: Props

	/**
	 * Construct a new builder instance.
	 * @param projectConstructor Projen project type to wrap.
	 * @param steps Build steps to apply (in order) on build.
	 */
	constructor(
		readonly projectConstructor: T,
		readonly steps: Array<AnyBuildStep> = []
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
	add<StepT extends AnyBuildStep>(
		step: StepT,
		options: { prepend?: boolean } = { prepend: false }
	): ProjectBuilder<
		T,
		ExtendShape<this['_options'], BuildOptions<StepT>>,
		this['_props'] & BuildOutput<StepT>
	> {
		const builder = new ProjectBuilder<
			T,
			ExtendShape<this['_options'], BuildOptions<StepT>>,
			this['_props'] & BuildOutput<StepT>
		>(
			this.projectConstructor,
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
	build(options: ProjectBuilderOptions<this>): ProjectBuilderOutput<this> {
		const finalOptions = this.buildOptions(options)
		const finalConstructor = this.projectConstructor as GConstructor<
			ProjectBuilderOutput<this>,
			[options: ProjectBuilderOptions<this>]
		>
		const project = new finalConstructor(finalOptions)

		const properties = this.steps.reduce(
			(acc, step) => ({ ...acc, ...step.applyProject(project as Project) }),
			{} as PropertyDescriptorMap
		)
		Object.defineProperties(project, properties)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return project
	}
}
