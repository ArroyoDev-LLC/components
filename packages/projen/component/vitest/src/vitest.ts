import path from 'node:path'
import { TypeScriptSourceConfig } from '@arroyodev-llc/projen.component.typescript-source-file'
import { Vite } from '@arroyodev-llc/projen.component.vite'
import { cwdRelativePath } from '@arroyodev-llc/utils.projen'
import { Component, JsonFile, type Project, type Task } from 'projen'
import { type TypeScriptProject } from 'projen/lib/typescript'
import { deepMerge } from 'projen/lib/util'
import { type UserWorkspaceConfig } from 'vitest/config'

export enum VitestConfigType {
	WORKSPACE = 'Workspace',
	PROJECT = 'Project',
	CONFIG = 'Config',
}

export interface VitestOptions {
	/**
	 * Vitest config path.
	 */
	configFilePath?: string
	/**
	 * Configuration type.
	 */
	configType?: VitestConfigType
	/**
	 * Vitest settings.
	 */
	settings?: UserWorkspaceConfig
}

export class Vitest extends Component {
	public static of(project: Project): Vitest | undefined {
		const isVitest = (c: Component): c is Vitest => c instanceof Vitest
		return project.components.find(isVitest)
	}

	readonly configType: VitestConfigType
	readonly configFile: TypeScriptSourceConfig<UserWorkspaceConfig>
	readonly options: Required<VitestOptions>
	readonly vite?: Vite
	readonly testWatchTask: Task
	readonly #workspaceProjects: Map<string, Vitest> = new Map<string, Vitest>()

	constructor(
		public readonly project: TypeScriptProject,
		options: VitestOptions = {
			configFilePath: 'vitest.config.ts',
			configType: VitestConfigType.PROJECT,
			settings: {},
		}
	) {
		super(project)
		this.vite = Vite.of(this.project)
		this.options = deepMerge([
			{
				settings: {
					test: {
						name: project.name,
						include: [`${project.testdir}/\*\*/\*.spec.ts`],
					},
				},
			} as VitestOptions,
			options,
		]) as Required<VitestOptions>
		this.project.addDevDeps('vitest')
		this.configType = this.options.configType ?? VitestConfigType.PROJECT
		const configFilePath = this.options.configFilePath ?? 'vitest.config.ts'

		if (this.configType !== VitestConfigType.WORKSPACE) {
			this.project.testTask.exec('vitest', {
				args: ['--run'],
				receiveArgs: true,
			})
		}
		this.testWatchTask =
			this.project.tasks.tryFind('test:watch') ??
			this.project.addTask('test:watch', {
				receiveArgs: true,
				exec: 'vitest',
				description: 'Run tests on changes.',
			})

		this.project.tsconfigDev?.addInclude?.(configFilePath)
		this.project?.eslint?.addOverride?.({
			files: [
				configFilePath,
				...(this.options.settings?.test?.include ?? [this.project.testdir]),
			],
			rules: {
				'import/no-extraneous-dependencies': ['off'],
			},
		})

		this.configFile =
			TypeScriptSourceConfig.withCallExpressionConfig<UserWorkspaceConfig>(
				this.project,
				configFilePath,
				{
					source: `export default ${this.defineName}({})`,
					recreate: true,
					marker: true,
					config: this.options.settings,
				}
			)

		this.configFile.addImport({
			moduleSpecifier: 'vitest/config',
			namedImports: [this.defineName],
		})

		if (this.configType === VitestConfigType.PROJECT) {
			this.tryFindWorkspace()?.addProjectConfig?.(this)
		}

		if (this.configType === VitestConfigType.WORKSPACE) {
			new JsonFile(this.project, 'vitest.workspace.json', {
				readonly: true,
				allowComments: false,
				obj: () => Array.from(this.#workspaceProjects.keys()),
			})
		}
	}

	/**
	 * Get the define function name.
	 * @protected
	 */
	protected get defineName(): string {
		return this.configType === VitestConfigType.PROJECT
			? 'defineProject'
			: 'defineConfig'
	}

	/**
	 * Merge vite config if applicable.
	 * @protected
	 */
	protected mergeVite(): void {
		if (!this.vite) return
		this.configFile.addImport({
			moduleSpecifier: 'vitest/config',
			namedImports: ['mergeConfig'],
		})
		this.configFile.addImport({
			moduleSpecifier: cwdRelativePath(
				this.project.outdir,
				this.vite.file.absolutePath.split('.').slice(0, -1).join('.')
			),
			defaultImport: 'viteConfig',
		})
		this.configFile.addConfigTransform((cfg, src) => {
			src.addExportAssignment({
				expression: (writer) =>
					writer.write(
						`mergeConfig(viteConfig, ${this.defineName}(${cfg.getFullText()}))`
					),
				isExportEquals: false,
			})
			src.removeDefaultExport()
		})
	}

	/**
	 * Try to find the workspace {@link Vitest} component.
	 */
	tryFindWorkspace(): Vitest | undefined {
		if (this.configType === VitestConfigType.WORKSPACE) return this
		if (this.project.parent) {
			return Vitest.of(this.project.parent)?.tryFindWorkspace?.()
		}
		return
	}

	/**
	 * Add {@link Vitest} component to this workspace.
	 * @param component Target component.
	 */
	addProjectConfig(component: Vitest): this {
		if (this.configType !== VitestConfigType.WORKSPACE)
			throw new Error('No vitest workspace found. Cannot add project config!')
		const relPath = path.format({
			dir: '.',
			base: path.relative(
				path.dirname(this.configFile.absolutePath),
				component.configFile.absolutePath
			),
		})
		this.#workspaceProjects.set(relPath, component)
		return this
	}

	/**
	 * Add config to merge.
	 * @param config Config part.
	 */
	addConfig(config: this['configFile']['__mergeSchema']): this {
		this.configFile.addConfig(config)
		return this
	}

	/**
	 * Add plugin to merge.
	 * @param plugin Plugin part.
	 */
	addPlugin(plugin: this['configFile']['__pluginSchema']) {
		this.configFile.addPlugin(plugin)
		return this
	}

	/**
	 * @inheritDoc
	 */
	preSynthesize() {
		super.preSynthesize()
		this.mergeVite()
	}
}
