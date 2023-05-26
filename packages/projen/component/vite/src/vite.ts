import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import {
	TypeScriptSourceConfig,
	type TypeScriptSourceConfigPlugin,
} from '@arroyodev-llc/projen.component.typescript-source-file'
import {
	findComponent,
	type ObjectLiteralMergeSchema,
} from '@arroyodev-llc/utils.projen'
import { Component, DependencyType, type Project } from 'projen'
import { type NodePackage } from 'projen/lib/javascript'
import { type TypeScriptProject } from 'projen/lib/typescript'
import { SyntaxKind } from 'ts-morph'
import type { UserConfigExport } from 'vite'

export interface ViteOptions {
	build: UserConfigExport
	plugins?: TypeScriptSourceConfigPlugin[]
}

export class Vite extends Component {
	public static of(project: Project): Vite | undefined {
		return findComponent<typeof Vite>(project, Vite)
	}

	readonly file: TypeScriptSourceConfig<UserConfigExport>

	constructor(
		public readonly project: TypeScriptProject,
		public readonly options?: ViteOptions
	) {
		super(project)
		this.options = options ?? { build: {} }

		this.applyPackage(this.project.package)
		this.file = this.buildFile()
		this.addBuildConfig(this.options.build)
		this.project.tasks
			.tryFind('post-compile')
			?.exec?.('vite', { args: ['build'] })
		this.project
			.tryFindObjectFile('tsconfig.json')
			?.addToArray?.('compilerOptions.types', 'vite/client')
	}

	protected applyPackage(nodePackage: NodePackage): this {
		nodePackage.project.deps.addDependency('vite', DependencyType.BUILD)
		return this
	}

	protected buildFile(): TypeScriptSourceConfig<UserConfigExport> {
		const file = new TypeScriptSourceConfig<UserConfigExport>(
			this.project,
			'vite.config.ts',
			{
				source: `export default defineConfig({})`,
				recreate: true,
				marker: true,
				pluginsProperty: 'plugins',
				configResolver: (cfg, src) =>
					cfg
						.getDefaultExport(src, SyntaxKind.CallExpression)
						.getArguments()[0]!
						.asKindOrThrow(SyntaxKind.ObjectLiteralExpression),
			}
		)
		file.addImport({
			moduleSpecifier: 'vite',
			namedImports: ['defineConfig'],
		})
		LintConfig.of(this.project)?.eslint?.addOverride?.({
			files: ['vite.config.ts'],
			rules: {
				'import/no-extraneous-dependencies': 'off',
			},
		})
		return file
	}

	/**
	 * Add Vite plugin to config.
	 * @param plugin Plugin specification.
	 */
	addPlugin<PluginT>(plugin: TypeScriptSourceConfigPlugin<PluginT>): this {
		this.file.addPlugin(plugin)
		return this
	}

	/**
	 * Add build config. Will be merged into existing.
	 * @param config Config to merge.
	 */
	addBuildConfig(config: ObjectLiteralMergeSchema<UserConfigExport>): this {
		this.file.addConfig(config)
		return this
	}
}
