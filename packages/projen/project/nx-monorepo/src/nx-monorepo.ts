import { PnpmWorkspace } from '@arroyodev-llc/projen.component.pnpm-workspace'
import { findComponent, replaceTask } from '@arroyodev-llc/utils.projen'
import {
	NodePackageUtils,
	NxMonorepoProject,
} from '@aws-prototyping-sdk/nx-monorepo'
import {
	type github,
	javascript,
	JsonFile,
	type Project,
	type Task,
	type TaskStep,
} from 'projen'
import { secretToString } from 'projen/lib/github/util'
import { NodePackage, TypeScriptModuleResolution } from 'projen/lib/javascript'
import type { NxMonorepoProjectOptions } from './nx-monorepo-project-options'

const projectDefaults = {
	name: '',
	// defaultReleaseBranch: 'main',
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
} satisfies NxMonorepoProjectOptions

export class MonorepoProject extends NxMonorepoProject {
	public readonly esmBundledTsconfigExtends: javascript.TypescriptConfigExtends
	public readonly pnpm: PnpmWorkspace

	constructor(options: NxMonorepoProjectOptions) {
		const { workspaceDeps, tsconfigBase, tsconfig, ...rest } = options
		super({
			defaultReleaseBranch: 'main',
			...projectDefaults,
			releaseToNpm: false,
			projenDevDependency: true,
			tsconfig,
			...rest,
		})
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
		this.esmBundledTsconfigExtends = this.buildEsmBundledTsConfig()
		this.applyNpmConfig(
			findComponent(this, javascript.NpmConfig) ??
				new javascript.NpmConfig(this)
		)
			.applyGithub(this.github!)
			.applyPackage(this.package)
			.applyDefaultTask()
			.applyNx()
			.applyUpgradeTask(this.tasks.tryFind('upgrade-deps'))
		this.tsconfigDev!.addExtends(this.tsconfig!)
	}

	protected applyUpgradeTask(task?: Task): this {
		if (!task) return this
		// fix invalid install step.
		const mergeUpdate = task.steps.map((step) =>
			step.exec === 'pnpm exec install' ? { exec: 'pnpm install' } : undefined
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
		return this
	}

	protected applyCleanTask(): this {
		this.addDevDeps('rimraf')
		const cleanAllTask =
			this.tasks.tryFind('clean') ?? this.tasks.addTask('clean')
		cleanAllTask.exec('pnpm -r --parallel run clean')
		return this.applyRecursive((project) => {
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
				NodePackageUtils.command.exec(this.package.packageManager, 'rimraf lib')
			)
		})
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

	protected buildEsmBundledTsConfig() {
		const base = this.buildExtendableTypeScriptConfig('tsconfig.base.json', {
			skipLibCheck: true,
			strict: true,
			strictNullChecks: true,
			resolveJsonModule: true,
			isolatedModules: true,
			noImplicitThis: true,
			noUnusedLocals: true,
			noUnusedParameters: true,
			noFallthroughCasesInSwitch: true,
			forceConsistentCasingInFileNames: true,
		})
		base.file.addOverride('compilerOptions.useDefineForClassFields', true)
		const esm = this.buildExtendableTypeScriptConfig('tsconfig.esm.json', {
			module: 'ESNext',
			target: 'ES2022',
			lib: ['ES2022'],
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
		})
		const bundler = this.buildExtendableTypeScriptConfig(
			'tsconfig.bundler.json',
			{
				moduleResolution: TypeScriptModuleResolution.BUNDLER,
				allowImportingTsExtensions: true,
				allowArbitraryExtensions: true,
				resolveJsonModule: true,
				isolatedModules: true,
				verbatimModuleSyntax: true,
				noEmit: true,
				jsx: javascript.TypeScriptJsxMode.PRESERVE,
			}
		)
		return javascript.TypescriptConfigExtends.fromTypescriptConfigs([
			base,
			esm,
			bundler,
		])
	}

	/**
	 * Apply callback to all child projects.
	 * @param cb Function to execute on all subprojects.
	 * @param includeSelf Also execute on monorepo root if true.
	 */
	applyRecursive(
		cb: (project: Project, monorepo: this) => void,
		includeSelf: boolean = false
	): this {
		if (includeSelf) cb(this, this)
		this.sortedSubProjects.forEach((proj) => cb(proj, this))
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

	/**
	 * Build tsconfig primed for extending.
	 * @param fileName File name of tsconfig.
	 * @param options Compiler options.
	 */
	buildExtendableTypeScriptConfig(
		fileName: string,
		options: javascript.TypeScriptCompilerOptions
	): javascript.TypescriptConfig {
		const config = new javascript.TypescriptConfig(this, {
			fileName,
			compilerOptions: options,
		})
		config.file.addDeletionOverride('include')
		config.file.addDeletionOverride('exclude')
		return config
	}

	addWorkspaceDeps(...dependency: (javascript.NodeProject | string)[]) {
		return this.pnpm.addWorkspaceDeps(...dependency)
	}

	preSynthesize() {
		super.preSynthesize()
		this.applyCleanTask()
	}
}
