import { withDefaults } from '@arroyodev-llc/utils.projen'
import { type BuildStep } from './build-step.ts'
import type {
	GConstructor,
	GenericProjectConstructor,
	ProjectConstructorOptions,
} from './types.ts'

export class ProjectBuilder<
	T extends GenericProjectConstructor = GenericProjectConstructor,
	Options extends ProjectConstructorOptions<T> = ProjectConstructorOptions<T>
> {
	declare __outputType: T
	declare __optionsType: Options

	constructor(
		readonly projectConstructor: T,
		readonly defaultOptions: Array<Partial<Options>> = [],
		readonly steps: Array<BuildStep> = []
	) {}

	add<StepT extends BuildStep>(step: StepT) {
		const builder = new ProjectBuilder(
			this.projectConstructor as unknown as GConstructor<
				InstanceType<T> & (typeof step)['outputType'],
				[options: Options & (typeof step)['outputOptionsType']]
			>,
			this.defaultOptions as Array<
				Partial<Options & (typeof step)['outputOptionsType']>
			>,
			[...this.steps, step]
		)
		return builder
	}

	buildOptions(options: Options) {
		const mappedOptions = this.steps.reduce(
			(acc, step) =>
				({ ...acc, ...step.applyOptions(acc as Options) } as Options),
			Object.assign({}, options) as object
		) as Options

		return withDefaults(...this.defaultOptions)(mappedOptions)
	}

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
