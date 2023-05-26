import path from 'node:path'
import { PnpmWorkspace } from '@arroyodev-llc/projen.component.pnpm-workspace'
import { TypescriptConfigContainer } from '@arroyodev-llc/projen.component.tsconfig-container'
import {
	cwdRelativePath,
	findComponent,
	replaceTask,
} from '@arroyodev-llc/utils.projen'
import {
	NodePackageUtils,
	NxMonorepoProject,
} from '@aws-prototyping-sdk/nx-monorepo'
import {
	github,
	javascript,
	JsonFile,
	type Project,
	type Task,
	type TaskStep,
	typescript,
} from 'projen'
import { secretToString } from 'projen/lib/github/util'
import { NodePackage, TypeScriptModuleResolution } from 'projen/lib/javascript'
import { deepMerge } from 'projen/lib/util'
import type { NxMonorepoProjectOptions } from './nx-monorepo-project-options'
import { TypeDocGithubPages } from './typedoc-workflow.ts'

const arroyoBot = github.GithubCredentials.fromApp({
	appIdSecret: 'AD_BOT_APP_ID',
	privateKeySecret: 'AD_BOT_PRIVATE_KEY',
})

export const CONFIG_DEFAULTS = {
	name: '',
	defaultReleaseBranch: 'main',
	packageManager: javascript.NodePackageManager.PNPM,
	pnpmVersion: '8',
	npmAccess: javascript.NpmAccess.PUBLIC,
	release: false,
	releaseToNpm: true,
	jest: false,
	projenDevDependency: false,
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
	githubOptions: {
		mergify: true,
		workflows: true,
		projenCredentials: arroyoBot,
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
		const { workspaceDeps, tsconfigBase, tsconfig, ...rest } = options
		const mergedOptions = deepMerge(
			[Object.assign({}, CONFIG_DEFAULTS), rest],
			true
		) as NxMonorepoProjectOptions
		super({
			defaultReleaseBranch: 'main',
			...mergedOptions,
			releaseToNpm: false,
			projenDevDependency: true,
		})
		this.options = mergedOptions
		this.pnpm = new PnpmWorkspace(this)
		this.pnpm.addWorkspaceDeps(...(workspaceDeps ?? []))
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
			TSConfig.BUNDLER
		)
		const tsconfigExtends = this.tsconfigContainer.buildExtends(
			TSConfig.BASE,
			TSConfig.ESM
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
				new javascript.NpmConfig(this)
		)
			.applyGithub(this.github)
			.applyPackage(this.package)
			.applyDefaultTask()
			.applyNx()
			.applyUpgradeTask(this.tasks.tryFind('upgrade-deps'))
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
				NodePackageUtils.command.exec(this.package.packageManager, 'typedoc')
			)
		this.applyPreSynth(() => {
			this.tsconfig.file.addOverride('typedocOptions', {
				entryPoints: this.sortedSubProjects.map((subproj) =>
					cwdRelativePath(this.outdir, subproj.outdir)
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
			{ immediate: false, includeSelf: false }
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
				noEmit: true,
				jsx: javascript.TypeScriptJsxMode.PRESERVE,
			})
	}

	protected applyUpgradeTask(task?: Task): this {
		if (!task) return this
		// fix invalid install step.
		const mergeUpdate = task.steps.map((step) =>
			step.exec === 'pnpm exec install'
				? { exec: 'pnpm exec projen install' }
				: undefined
		) as TaskStep[]
		replaceTask(this, task.name, mergeUpdate)
		return this
	}

	protected applyNx(): this {
		this.nx.autoInferProjectTargets = true
		return this
	}

	protected applyDefaultTask(): this {
		this.addDevDeps('tsx')
		this.defaultTask!.reset('tsx .projenrc.ts')
		this.tasks.tryFind('eslint')?.exec?.('eslint', {
			name: 'Lint Root',
			cwd: this.outdir,
			args: ['--cache', '--ext=.ts', '--fix', '.projenrc.ts', 'projenrc'],
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
						NodePackageUtils.command.projen(nodePackage.packageManager, 'clean')
					)
				}
				const cleanTask =
					project.tasks.tryFind('clean') ?? project.tasks.addTask('clean')
				cleanTask.exec(
					NodePackageUtils.command.exec(
						this.package.packageManager,
						'rimraf dist'
					)
				)
				cleanTask.exec(
					NodePackageUtils.command.exec(
						this.package.packageManager,
						'rimraf lib'
					)
				)
			},
			{ immediate: false, includeSelf: false }
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
		this.addNxRunManyTask('stub', {
			skipCache: true,
			target: 'stub',
			parallel: 5,
			noBail: true,
			ignoreCycles: true,
			outputStyle: 'stream',
		})
		const postInstall =
			this.tasks.tryFind('post-install') ?? this.tasks.addTask('post-install')
		postInstall.exec(
			NodePackageUtils.command.projen(this.package.packageManager, 'stub')
		)
		this.addScripts({
			postinstall: NodePackageUtils.command.projen(
				this.package.packageManager,
				'post-install'
			),
		})
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
		options?: ApplyRecursiveOptions
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
			secretToString('NPM_AUTH_TOKEN')
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

	addWorkspaceDeps(...dependency: (javascript.NodeProject | string)[]) {
		return this.pnpm.addWorkspaceDeps(...dependency)
	}

	preSynthesize() {
		super.preSynthesize()
		while (this.#presynthCallbacks.length) {
			this.#presynthCallbacks.pop()!.apply(this)
		}
	}
}
