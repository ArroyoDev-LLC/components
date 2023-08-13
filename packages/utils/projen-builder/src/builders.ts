import {
	ProjectName,
	type ProjectNameSchemeOptions,
	withDefaults,
} from '@arroyodev-llc/utils.projen'
import { type Project, type ProjectOptions } from 'projen'
import { BaseBuildStep } from './build-step'
import { type TypedPropertyDescriptorMap } from './types.ts'

/**
 * Store the options used to create a project under an `options` property.
 */
export class OptionsPropertyBuilder<
	InputT extends ProjectOptions
> extends BaseBuildStep<{}, { readonly options: InputT }> {
	private _options!: InputT

	applyOptions(options: InputT): InputT {
		this._options = options
		return options
	}

	applyProject(_project: Project): TypedPropertyDescriptorMap<this['_output']> {
		return {
			options: {
				value: this._options,
				writable: false,
			},
		} as TypedPropertyDescriptorMap<this['_output']>
	}
}

/**
 * Utilize a naming scheme for a project.
 */
export class NameSchemeBuilder extends BaseBuildStep<
	{
		readonly packageName?: string
		readonly outdir?: string
	},
	{ readonly projectName: ProjectName }
> {
	constructor(readonly options?: ProjectNameSchemeOptions) {
		super()
	}

	applyOptions<Options extends ProjectOptions>(
		options: Options
	): Options & this['_outputOptions'] {
		const { name, parent, ...rest } = options
		const nameScheme = ProjectName.ensureScheme(name, parent, this.options)
		return {
			...rest,
			...(parent && { parent }),
			name: nameScheme.name,
			outdir: nameScheme.outDir,
			packageName: nameScheme.packageName,
		} as Options & this['_outputOptions']
	}

	applyProject(project: Project): TypedPropertyDescriptorMap<this['_output']> {
		return {
			projectName: {
				value: ProjectName.ensureScheme(
					project.name,
					project.parent,
					this.options
				),
				writable: false,
			},
		} as TypedPropertyDescriptorMap<this['_output']>
	}
}

/**
 * Add default options.
 */
export class DefaultOptionsBuilder<
	Options extends object
> extends BaseBuildStep<Partial<Options>, {}> {
	constructor(readonly defaultOptions: Partial<Options>) {
		super()
	}

	applyOptions(
		options: ProjectOptions & this['_outputOptions']
	): ProjectOptions & this['_outputOptions'] {
		return super.applyOptions(
			withDefaults(this.defaultOptions)(options) as ProjectOptions &
				this['_outputOptions']
		)
	}
}
