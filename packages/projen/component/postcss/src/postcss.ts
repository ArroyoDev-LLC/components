import {
	TypeScriptSourceConfig,
	type TypeScriptSourceConfigPlugin,
} from '@arroyodev-llc/projen.component.typescript-source-file'
import { findComponent } from '@arroyodev-llc/utils.projen'
import type { ObjectLiteralMergeSchema } from '@arroyodev-llc/utils.ts-ast'
import type { Config } from 'postcss-load-config'
import { Component, type Project, type typescript } from 'projen'

export interface PostCSSOptions {
	/**
	 * Config file path.
	 */
	readonly filePath?: string
	/**
	 * Postcss Config.
	 */
	readonly config?: Config
}

export class PostCSS extends Component {
	public static of(project: Project): PostCSS | undefined {
		return findComponent(project, PostCSS)
	}

	readonly file: TypeScriptSourceConfig<Config>

	constructor(project: typescript.TypeScriptProject, options?: PostCSSOptions) {
		super(project)

		this.file = new TypeScriptSourceConfig(
			project,
			options?.filePath ?? 'postcss.config.ts',
			{
				marker: true,
				pluginsProperty: 'plugins',
				recreate: true,
				source: `export default {}`,
			}
		)
	}

	/**
	 * Add postcss plugin.
	 * @param plugin Plugin spec.
	 */
	addPlugin(plugin: TypeScriptSourceConfigPlugin): this {
		const spec = {
			...(!plugin.options
				? {
						spec: (writer) => writer.write(plugin.name),
				  }
				: {}),
			...plugin,
		} satisfies TypeScriptSourceConfigPlugin
		this.file.addPlugin(spec)
		return this
	}

	/**
	 * Merge postcss config.
	 * @param config Config to merge.
	 */
	addConfig(config: ObjectLiteralMergeSchema<Config>) {
		this.file.addConfig(config)
		return this
	}
}
