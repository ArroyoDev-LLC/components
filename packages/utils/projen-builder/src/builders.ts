import {
	ProjectName,
	type ProjectNameSchemeOptions,
	withDefaults,
} from '@arroyodev-llc/utils.projen'
import { type Project, type ProjectOptions } from 'projen'
import type { PartialDeep } from 'type-fest'
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

/**
 * Add default options.
 */
export class DefaultOptionsBuilder<
	Options extends object
> extends BaseBuildStep<PartialDeep<Options>, {}> {
	constructor(readonly defaultOptions: PartialDeep<Options>) {
		super()
	}

	applyOptions(
		options: ProjectOptions & this['outputOptionsType']
	): ProjectOptions & this['outputOptionsType'] {
		return super.applyOptions(
			withDefaults(this.defaultOptions)(options) as ProjectOptions &
				this['outputOptionsType']
		)
	}
}
