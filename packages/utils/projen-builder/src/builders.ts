import {
	ProjectName,
	type ProjectNameSchemeOptions,
} from '@arroyodev-llc/utils.projen'
import { type Project, type ProjectOptions } from 'projen'
import { type BuildStep } from './index.ts'
import { type TypedPropertyDescriptorMap } from './types.ts'

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
