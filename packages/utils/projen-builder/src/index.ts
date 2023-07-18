import {
	ProjectName,
	type ProjectNameSchemeOptions,
	withDefaults,
} from '@arroyodev-llc/utils.projen'
import { type Project, type ProjectOptions } from 'projen'

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

export class OptionsPropertyBuilder<InputT extends ProjectOptions>
	implements BuildStep
{
	declare outputOptionsType: {}
	declare outputType: { readonly options: InputT }

	private _options!: InputT

	constructor() {}

	applyOptions(options: InputT): InputT {
		this._options = options
		return options
	}

	applyProject(
		_project: Project
	): TypedPropertyDescriptorMap<this['outputType']> {
		return {
			options: {
				value: this._options,
				writable: false,
			},
		} as TypedPropertyDescriptorMap<this['outputType']>
	}
}

export class NameSchemeBuilder implements BuildStep {
	declare outputType: { readonly projectName: ProjectName }
	declare outputOptionsType: {
		readonly packageName?: string
		readonly outdir?: string
		readonly useScheme?: boolean
	}

	constructor(readonly options?: ProjectNameSchemeOptions) {}

	applyOptions<Options extends ProjectOptions>(
		options: Options
	): Options & this['outputOptionsType'] {
		const { name, parent, ...rest } = options
		const nameScheme = ProjectName.ensureScheme(name, parent, this.options)
		return {
			...rest,
			...(parent && { parent }),
			name: nameScheme.name,
			outdir: nameScheme.outDir,
			packageName: nameScheme.packageName,
		} as Options & this['outputOptionsType']
	}

	applyProject(
		project: Project
	): TypedPropertyDescriptorMap<this['outputType']> {
		return {
			projectName: {
				value: ProjectName.ensureScheme(
					project.name,
					project.parent,
					this.options
				),
				writable: false,
			},
		} as TypedPropertyDescriptorMap<this['outputType']>
	}
}
