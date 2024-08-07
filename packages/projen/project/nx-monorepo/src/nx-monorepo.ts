import path from 'node:path'
import { PnpmWorkspace } from '@arroyodev-llc/projen.component.pnpm-workspace'
import { TypescriptConfigContainer } from '@arroyodev-llc/projen.component.tsconfig-container'
import {
	applyOverrides,
	cwdRelativePath,
	findComponent,
	ProjectName,
} from '@arroyodev-llc/utils.projen'
import {
	NodePackageUtils,
	MonorepoTsProject as NxMonorepoProject,
} from '@aws/pdk/monorepo'
import {
	DependencyType,
	type github,
	javascript,
	JsonFile,
	type Project,
	typescript,
} from 'projen'
import { secretToString } from 'projen/lib/github/util'
import { NodePackage, TypeScriptModuleResolution } from 'projen/lib/javascript'
import { deepMerge } from 'projen/lib/util'
import type { NxMonorepoProjectOptions } from './nx-monorepo-project-options'
import { TypeDocGithubPages } from './typedoc-workflow.ts'

export const CONFIG_DEFAULTS = {
	name: '',
	defaultReleaseBranch: 'main',
	packageManager: javascript.NodePackageManager.PNPM,
	pnpmVersion: '8',
	npmAccess: javascript.NpmAccess.PUBLIC,
	release: false,
	releaseToNpm: false,
	jest: false,
	projenDevDependency: true,
	entrypoint: 'dist/index.mjs',
	entrypointTypes: 'dist/index.d.ts',
	libdir: 'dist',
	typescriptVersion: '^5',
	authorEmail: 'support@arroyodev.com',
	authorUrl: 'https://arroyodev.com',
	authorName: 'arroyoDev-LLC',
	authorOrganization: true,
	projenrcTs: true,
	github: true,
	workflowPackageCache: true,
	githubOptions: {
		mergify: true,
		workflows: true,
		pullRequestLintOptions: {
			semanticTitleOptions: {
				types: [
					'feat',
					'fix',
					'perf',
					'revert',
					'docs',
					'style',
					'chore',
					'refactor',
					'test',
					'build',
					'ci',
				],
			},
		},
	},
	autoApproveUpgrades: true,
	autoApproveOptions: {
		allowedUsernames: ['github-actions[bot]', 'arroyobot[bot]'],
	},
	prettier: true,
} satisfies NxMonorepoProjectOptions

export enum TSConfig {
	BASE = 'base',
	ESM = 'esm',
	BUNDLER = 'bundler',
	COMPOSITE = 'composite',
}

export interface ApplyRecursiveOptions {
	/**
	 * Invoke callback on monorepo as well as all children.
	 * @default false
	 */
	readonly includeSelf?: boolean
	/**
	 * Execute callback immediately.
	 * Will queue callback for execution during pre-synth if false.
	 * @default true
	 */
	readonly immediate?: boolean
}

export class MonorepoProject extends NxMonorepoProject {
	/**
	 * @deprecated Use `tsconfigContainer`
	 */
	public readonly esmBundledTsconfigExtends: javascript.TypescriptConfigExtends
	public readonly pnpm: PnpmWorkspace
	public readonly tsconfigContainer: TypescriptConfigContainer
	public readonly tsconfig: javascript.TypescriptConfig
	public readonly tsconfigDev: javascript.TypescriptConfig
	public readonly options: NxMonorepoProjectOptions

	#presynthCallbacks: Array<() => void> = []

	constructor(options: NxMonorepoProjectOptions) {
		const { workspaceDeps, tsconfig, ...rest } = options
		const mergedOptions = deepMerge(
			[Object.assign({}, CONFIG_DEFAULTS), rest],
			true,
		) as NxMonorepoProjectOptions
		super({
			defaultReleaseBranch: 'main',
			...mergedOptions,
		})
		this.options = mergedOptions
		this.pnpm = new PnpmWorkspace(this)
		this.pnpm.addWorkspaceDeps(
			{ addTsPath: true, depType: DependencyType.DEVENV },
			...(workspaceDeps ?? []),
		)
		this.gitignore.addPatterns('.idea', '.idea/**')
		new JsonFile(this, '.ncurc.json', {
			readonly: true,
			marker: false,
			allowComments: false,
			obj: {
				reject: [],
			},
		})
		this.tsconfigContainer = this.buildTsconfigContainer()
		this.esmBundledTsconfigExtends = this.tsconfigContainer.buildExtends(
			TSConfig.BASE,
			TSConfig.ESM,
			TSConfig.BUNDLER,
		)
		const tsconfigExtends = this.tsconfigContainer.buildExtends(
			TSConfig.BASE,
			TSConfig.ESM,
		)
		this.tryRemoveFile('tsconfig.json')
		this.tsconfig = new javascript.TypescriptConfig(this, {
			fileName: 'tsconfig.json',
			extends: tsconfigExtends,
			exclude: tsconfig?.exclude ?? ['packages/**/*'],
			include: tsconfig?.include ?? [
				'.projenrc.ts',
				'**/*.ts',
				'projenrc/*.ts',
			],
			compilerOptions: {
				rootDir: '.',
				outDir: 'dist',
				...(tsconfig?.compilerOptions ?? {}),
			},
		})
		this.tryRemoveFile('tsconfig.dev.json')
		this.tsconfigDev = new javascript.TypescriptConfig(this, {
			fileName: 'tsconfig.dev.json',
			exclude: ['node_modules', 'packages/**/*'],
			include: ['.projenrc.ts', '**/*.ts', 'projenrc/*.ts'],
			compilerOptions: {},
		})
		this.tsconfigDev.addExtends(this.tsconfig)
		this.applyNpmConfig(
			findComponent(this, javascript.NpmConfig) ??
				new javascript.NpmConfig(this),
		)
			.applyGithub(this.github)
			.applyPackage(this.package)
			.applyDefaultTask()
			.applyNx()
			.applyCleanTask()
			.applyTypeDoc(this.github)
	}

	/**
	 * Apply docgen configuration.
	 * @param gh Github component. Applies pages workflow if defined.
	 * @protected
	 */
	protected applyTypeDoc(gh?: github.GitHub): this {
		if (!this.docgen) return this
		if (gh) {
			new TypeDocGithubPages(this)
		}
		this.tasks
			.tryFind('docgen')!
			.reset(
				NodePackageUtils.command.exec(this.package.packageManager, 'typedoc'),
			)
		this.applyPreSynth(() => {
			this.tsconfig.file.addOverride('typedocOptions', {
				entryPoints: this.sortedSubProjects.map((subproj) =>
					cwdRelativePath(this.outdir, subproj.outdir),
				),
				entryPointStrategy: 'packages',
				out: 'docs',
				includeVersion: true,
				json: 'docs/docs.json',
				useTsLinkResolution: true,
				...(this.options.docgenOptions as Record<string, any>),
			})
		})
		this.applyRecursive(
			(project) =>
				project instanceof typescript.TypeScriptProject &&
				project
					.tryFindObjectFile('tsconfig.json')
					?.addOverride?.('typedocOptions', {
						entryPoints: [path.join(project.srcdir, 'index.ts')],
						useTsLinkResolution: true,
						...(this.options.docgenOptions as Record<string, any>),
					}),
			{ immediate: false, includeSelf: false },
		)
		return this
	}

	protected buildTsconfigContainer(): TypescriptConfigContainer {
		return new TypescriptConfigContainer(this, {
			configsDirectory: './tsconfig',
		})
			.defineConfig(TSConfig.BASE, {
				skipLibCheck: true,
				strict: true,
				strictNullChecks: true,
				strictPropertyInitialization: true,
				resolveJsonModule: true,
				isolatedModules: true,
				noImplicitThis: true,
				noImplicitAny: true,
				noUnusedLocals: true,
				noUnusedParameters: true,
				noFallthroughCasesInSwitch: true,
				forceConsistentCasingInFileNames: true,
				moduleResolution: TypeScriptModuleResolution.NODE,
			})
			.defineConfig(TSConfig.ESM, {
				module: 'ESNext',
				target: 'ES2022',
				lib: ['ES2022'],
				allowSyntheticDefaultImports: true,
				esModuleInterop: true,
			})
			.defineConfig(TSConfig.BUNDLER, {
				isolatedModules: false,
				moduleResolution: TypeScriptModuleResolution.BUNDLER,
				allowImportingTsExtensions: true,
				allowArbitraryExtensions: true,
				resolveJsonModule: true,
				verbatimModuleSyntax: true,
				emitDeclarationOnly: true,
				jsx: javascript.TypeScriptJsxMode.PRESERVE,
			})
			.defineConfig(TSConfig.COMPOSITE, {
				declaration: true,
				overrides: {
					composite: true,
					declarationMap: true,
					incremental: true,
					inlineSources: true,
					inlineSourceMap: true,
				},
			})
	}

	protected applyNx(): this {
		this.nx.autoInferProjectTargets = true
		this.nx.npmScope = this.options.namingScheme?.scope ?? this.name
		this.nx.tasksRunnerOptions.local = {
			runner: 'nx/tasks-runners/default',
			options: {
				useDaemonProcess: false,
				cacheableOperations: this.nx.cacheableOperations,
			},
		}
		return this
	}

	protected applyDefaultTask(): this {
		this.addDevDeps('tsx')
		this.defaultTask!.reset(
			NodePackageUtils.command.exec(
				this.package.packageManager,
				'tsx',
				'.projenrc.ts',
			),
		)
		this.tasks.tryFind('eslint')?.exec?.('eslint', {
			name: 'Lint Root',
			args: [
				'--cache',
				'--no-error-on-unmatched-pattern',
				'--ext=.ts',
				'--fix',
				'.projenrc.ts',
				'projenrc',
			],
		})
		return this
	}

	protected applyCleanTask(): this {
		this.addDevDeps('rimraf')
		const cleanAllTask =
			this.tasks.tryFind('clean') ?? this.tasks.addTask('clean')
		cleanAllTask.exec('pnpm -r --parallel run clean')
		return this.applyRecursive(
			(project) => {
				const nodePackage = findComponent(project, NodePackage)
				if (nodePackage) {
					nodePackage.setScript(
						'clean',
						NodePackageUtils.command.projen(
							nodePackage.packageManager,
							'clean',
						),
					)
				}
				const cleanTask =
					project.tasks.tryFind('clean') ?? project.tasks.addTask('clean')
				cleanTask.exec(
					NodePackageUtils.command.exec(
						this.package.packageManager,
						'tsc',
						'--build',
						'--clean',
					),
				)
				cleanTask.exec(
					NodePackageUtils.command.exec(
						this.package.packageManager,
						'rimraf dist lib tsconfig.tsbuildinfo',
					),
				)
			},
			{ immediate: false, includeSelf: false },
		)
	}

	protected applyGithub(gh?: github.GitHub): this {
		if (!gh) return this
		const build = gh.tryFindWorkflow('build')!
		return this.applyGithubBuildFlow(build)
	}

	protected applyGithubBuildFlow(workflow: github.GithubWorkflow): this {
		this.applyGithubJobNxEnv(workflow, 'build')
		return this
	}

	protected applyPackage(nodePackage: javascript.NodePackage): this {
		nodePackage.addField('type', 'module')
		const pnpmVersion = nodePackage.pnpmVersion
		if (pnpmVersion) {
			this.applyRecursive(
				(project) => {
					const projectPackage = findComponent(project, NodePackage)
					if (projectPackage) {
						applyOverrides(projectPackage.file, {
							packageManager: `pnpm@${pnpmVersion}`,
							engines: {
								pnpm: `^${pnpmVersion}`,
							},
						})
						if (!(project instanceof MonorepoProject)) {
							// only root pnpm takes effect.
							projectPackage.file.addDeletionOverride('pnpm')
						}
					}
				},
				{ immediate: false, includeSelf: true },
			)
		}

		// 'postinstall' is intentional here,
		// as that is the name of the npm hook.
		const postInstall =
			this.tasks.tryFind('postinstall') ??
			this.addTask('postinstall', {
				description: 'Post install hook.',
			})
		postInstall.exec(
			NodePackageUtils.command.cmd(
				this.package.packageManager,
				'--no-bail',
				'--recursive',
				'--parallel',
				'--stream',
				'--if-present',
				'run',
				'post-install',
			),
		)
		return this
	}

	protected applyNpmConfig(npmConfig: javascript.NpmConfig): this {
		// default '*' to highest resolution.
		npmConfig.addConfig('resolution-mode', 'highest')
		return this
	}

	/**
	 * Apply callback during pre-synth.
	 * @param cb Callback to apply.
	 */
	applyPreSynth(cb: () => void): this {
		this.#presynthCallbacks.push(cb)
		return this
	}

	/**
	 * Apply callback to all child projects.
	 * @param cb Function to execute on all subprojects.
	 * @param options Execution options.
	 */
	applyRecursive(
		cb: (project: Project, monorepo: this) => void,
		options?: ApplyRecursiveOptions,
	): this {
		const executor = () => {
			if (options?.includeSelf ?? false) cb(this, this)
			this.sortedSubProjects.forEach((proj) => cb(proj, this))
		}
		if (options?.immediate ?? true) {
			executor()
		} else {
			this.applyPreSynth(executor)
		}
		return this
	}

	applyGithubJobNxEnv(workflow: github.GithubWorkflow, jobId: string): this {
		workflow.file!.addOverride(
			'env.NPM_TOKEN',
			secretToString('NPM_AUTH_TOKEN'),
		)
		const job = workflow.getJob(jobId) as github.workflows.Job
		workflow.updateJob(jobId, {
			...job,
			env: {
				...job.env,
				NX_NON_NATIVE_HASHER: 'true',
				NX_BRANCH: '${{ github.event.number }}',
				NX_RUN_GROUP: '${{ github.run_id }}',
				NX_CLOUD_ACCESS_TOKEN: '${{ secrets.NX_CLOUD_ACCESS_TOKEN }}',
				CI: 'true',
			},
		})
		return this
	}

	addWorkspaceDeps(
		...dependency: Parameters<PnpmWorkspace['addWorkspaceDeps']>
	) {
		this.tsconfigContainer.addTsConfigReferences(
			this,
			dependency.filter(
				(i) => i instanceof javascript.NodeProject,
			) as typescript.TypeScriptProject[],
		)
		return this.pnpm.addWorkspaceDeps(...dependency)
	}

	/**
	 * Default project naming scheme.
	 */
	get nameScheme(): (name: string) => ProjectName {
		return ProjectName.fromScheme(this.options.namingScheme ?? {})
	}

	preSynthesize() {
		super.preSynthesize()
		while (this.#presynthCallbacks.length) {
			this.#presynthCallbacks.pop()!.apply(this)
		}
	}
}
