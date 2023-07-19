import type { ProjectOptions } from 'projen'
import type { Simplify } from 'type-fest'
import { type BuildStep } from './build-step.ts'
import {
	type GConstructor,
	type GenericProjectConstructor,
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
	) {
		const builder = new ProjectBuilder<
			GConstructor<
				InstanceType<T> & (typeof step)['outputType'],
				[
					options: Simplify<
						Omit<Options, keyof (typeof step)['outputOptionsType']> &
							(typeof step)['outputOptionsType']
					>
				]
			>,
			Simplify<
				Omit<Options, keyof (typeof step)['outputOptionsType']> &
					(typeof step)['outputOptionsType']
			>
		>(
			this.projectConstructor as unknown as GConstructor<
				InstanceType<T> & (typeof step)['outputType'],
				[
					options: Simplify<
						Omit<Options, keyof (typeof step)['outputOptionsType']> &
							(typeof step)['outputOptionsType']
					>
				]
			>,
			options.prepend ? [step, ...this.steps] : [...this.steps, step]
		)
		return builder
	}

	/**
	 * Build the final project options.
	 * @param options Source options to use.
	 */
	buildOptions(options: Options): Options {
		const mappedOptions = this.steps.reduce(
			(acc, step) =>
				({
					...acc,
					...step.applyOptions(acc as Options & { name: string }),
				} as Options),
			Object.assign({}, options) as object
		) as Options
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
