import child_process from 'node:child_process'
import * as os from 'os'
import * as path from 'path'
import {
	applyOverrides,
	findRootProject,
	replaceTask,
} from '@arroyodev-llc/utils.projen'
import PQueue from 'p-queue'
import {
	Component,
	type ObjectFile,
	type Project,
	type TaskStep,
	typescript,
} from 'projen'
import {
	Biome,
	type BiomeOptions,
	Eslint,
	type NodeProject,
	Prettier,
	type PrettierOptions,
} from 'projen/lib/javascript'
import shellquote from 'shell-quote'

export type LintBackendKind = 'eslint' | 'biome'

export interface LintConfigOptions {
	/**
	 * Which linting/formatting backend to use.
	 * @default 'eslint'
	 */
	readonly backend?: LintBackendKind
	/**
	 * Enable type-enriched linting in eslint (ignored for biome backend).
	 */
	readonly useTypeInformation?: boolean
	/**
	 * Number in seconds to timeout formatting requests.
	 * @default 30
	 */
	readonly formatTimeout?: number
	/**
	 * Options passed to Projen's Biome component when `backend: 'biome'`.
	 */
	readonly biomeOptions?: BiomeOptions
}

export interface FormatRequest {
	/**
	 * Target file path.
	 */
	filePath: string
	/**
	 * Working directory to spawn the formatter from.
	 */
	workingDirectory: string
}

/**
 * Projen's `Biome` constructor unconditionally spawns its task into the project's
 * `testTask`. For this repo we run biome as a dedicated Nx target, so undo that
 * spawn so `pnpm test` doesn't write formatter fixes as a side effect.
 */
function removeBiomeFromTestTask(project: NodeProject, biome: Biome): void {
	const testTask = project.testTask
	const steps = testTask.steps
	for (let i = steps.length - 1; i >= 0; i--) {
		if (steps[i].spawn === biome.task.name) {
			testTask.removeStep(i)
		}
	}
}

abstract class LintBackend {
	abstract readonly kind: LintBackendKind
	abstract ignoreReadOnlyFiles(): void
	abstract applyResolvableExtensions(extensions: readonly string[]): void
	abstract formatFileCommand(filePath: string): string
	abstract lintTaskName(): string
	abstract setLintExec(exec: string, replace?: string): void
	abstract updateLintTask(step: TaskStep): void
}

class EslintBackend extends LintBackend {
	readonly kind = 'eslint' as const
	readonly eslint: Eslint
	readonly eslintFile: ObjectFile
	readonly prettier: Prettier
	readonly prettierFile: ObjectFile

	constructor(
		private readonly project: NodeProject,
		options: LintConfigOptions,
	) {
		super()
		this.eslint =
			Eslint.of(project) ??
			new Eslint(project, {
				dirs: [project.outdir],
				prettier: true,
			})

		const prettierConfig: PrettierOptions['settings'] = {
			singleQuote: true,
			semi: false,
			useTabs: true,
			tabWidth: 2,
		}

		this.prettier =
			Prettier.of(project) ??
			new Prettier(project, {
				settings: prettierConfig,
			})
		this.prettierFile = project.tryFindObjectFile('.prettierrc.json')!
		applyOverrides(this.prettierFile, prettierConfig)

		this.eslint.addRules({
			// let prettier handle:
			'key-spacing': ['off'],
			'no-multiple-empty-lines': ['off'],
			'no-trailing-spaces': ['off'],
			// typescript
			'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports', fixStyle: 'inline-type-imports' },
			],
			'import/no-duplicates': ['error', { 'prefer-inline': true }],
			'@typescript-eslint/no-explicit-any': [
				'warn',
				{ fixToUnknown: false, ignoreRestArgs: true },
			],
		})
		if (this.project instanceof typescript.TypeScriptProject) {
			this.eslint.addOverride({
				files: [`${this.project.testdir}/**`],
				rules: {
					'@typescript-eslint/require-await': ['warn'],
				},
			})
		}

		this.eslintFile = project.tryFindObjectFile('.eslintrc.json')!

		if (options.useTypeInformation) {
			this.enableTypeInformation()
		}
	}

	protected enableTypeInformation(): void {
		this.eslint.addExtends(
			'plugin:@typescript-eslint/recommended-requiring-type-checking',
		)
		this.eslintFile.addOverride('parserOptions.tsconfigRootDir', '.')
	}

	ignoreReadOnlyFiles(): void {
		this.project.files
			.filter((f) => f.readonly)
			.forEach((f) => {
				this.eslint.addIgnorePattern(f.path)
				this.prettier.addIgnorePattern(f.path)
			})
	}

	applyResolvableExtensions(extensions: readonly string[]): void {
		const arr = Array.from(extensions)
		this.eslintFile.addOverride('settings.import/resolver.node.extensions', arr)
		this.eslintFile.addOverride('settings.import/extensions', arr)
	}

	formatFileCommand(filePath: string): string {
		return `eslint --no-ignore --fix ` + shellquote.quote([filePath])
	}

	lintTaskName(): string {
		return 'eslint'
	}

	setLintExec(exec: string, replace: string = 'eslint'): void {
		const task = this.project.tasks.tryFind('eslint')!
		const cmd = task.steps[0].exec!.replace(replace, exec)
		replaceTask(this.project, 'eslint', [{ exec: cmd }])
	}

	updateLintTask(step: TaskStep): void {
		replaceTask(this.project, 'eslint', [step])
	}
}

class BiomeBackend extends LintBackend {
	readonly kind = 'biome' as const
	readonly biome: Biome

	constructor(
		private readonly project: NodeProject,
		options: LintConfigOptions,
	) {
		super()
		this.cleanupForeignConfig()

		// Leaf biome.jsonc extends root; disable default sections locally so
		// inherited rules aren't shadowed by locally re-emitted defaults.
		const userOptions = options.biomeOptions ?? {}
		const root = findRootProject(project)
		const rootRelative = path.relative(project.outdir, root.outdir) || '.'
		const extendsPath = `${rootRelative}/biome.jsonc`
		const leafOptions: BiomeOptions = {
			linter: userOptions.linter ?? false,
			formatter: userOptions.formatter ?? false,
			assist: userOptions.assist ?? false,
			version: userOptions.version,
			mergeArraysInConfiguration: userOptions.mergeArraysInConfiguration,
			ignoreGeneratedFiles: userOptions.ignoreGeneratedFiles,
			biomeConfig: {
				extends: [extendsPath],
				root: false,
				...(userOptions.biomeConfig ?? {}),
			},
		}
		this.biome = new Biome(project, leafOptions)
		// Biome needs at least one positive include pattern when extending, otherwise
		// the inherited all-negative includes list causes every file to be treated
		// as excluded. Prepend `**` so the package's own files match.
		this.biome.addFilePattern('**')
		removeBiomeFromTestTask(project, this.biome)

		if (this.project instanceof typescript.TypeScriptProject) {
			this.biome.addOverride({
				includes: [`${this.project.testdir}/**`],
				linter: {
					rules: {
						suspicious: {
							useAwait: 'warn',
						},
					},
				},
			})
		}
	}

	protected cleanupForeignConfig(): void {
		for (const name of [
			'.eslintrc.json',
			'.prettierrc.json',
			'.prettierignore',
			'.eslintignore',
		]) {
			this.project.tryRemoveFile(name)
		}
	}

	ignoreReadOnlyFiles(): void {
		// Biome's `ignoreGeneratedFiles` default handles this.
	}

	applyResolvableExtensions(): void {
		// No-op; Biome resolves file extensions natively.
	}

	formatFileCommand(filePath: string): string {
		return `biome format --write ` + shellquote.quote([filePath])
	}

	lintTaskName(): string {
		return 'biome'
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setLintExec(_exec: string, _replace?: string): void {
		this.project.logger.debug(
			'LintConfig.setLintExec is a no-op when backend is biome',
		)
	}

	updateLintTask(step: TaskStep): void {
		replaceTask(this.project, 'biome', [step])
	}
}

export class LintConfig extends Component {
	public static of(project: Project): LintConfig | undefined {
		const isLintConfig = (o: Component): o is LintConfig =>
			o instanceof LintConfig
		return project.components.find(isLintConfig)
	}

	readonly backend: LintBackendKind

	#backend: LintBackend
	#formatQueue: PQueue
	#extensions: Set<string> = new Set([
		'.js',
		'.jsx',
		'.mjs',
		'.cjs',
		'.ts',
		'.tsx',
		'.mts',
		'.cts',
	])

	get eslint(): Eslint | undefined {
		return this.#backend instanceof EslintBackend
			? this.#backend.eslint
			: undefined
	}

	get eslintFile(): ObjectFile | undefined {
		return this.#backend instanceof EslintBackend
			? this.#backend.eslintFile
			: undefined
	}

	get prettier(): Prettier | undefined {
		return this.#backend instanceof EslintBackend
			? this.#backend.prettier
			: undefined
	}

	get prettierFile(): ObjectFile | undefined {
		return this.#backend instanceof EslintBackend
			? this.#backend.prettierFile
			: undefined
	}

	get biome(): Biome | undefined {
		return this.#backend instanceof BiomeBackend
			? this.#backend.biome
			: undefined
	}

	constructor(project: NodeProject, options: LintConfigOptions = {}) {
		super(project)
		const {
			backend = 'eslint',
			formatTimeout = 30,
			useTypeInformation = true,
		} = options
		this.backend = backend
		this.#formatQueue = this.buildFormatQueue(formatTimeout)
		this.#backend =
			backend === 'biome'
				? new BiomeBackend(project, options)
				: new EslintBackend(project, { ...options, useTypeInformation })
	}

	/**
	 * Build format queue.
	 * @param timeout Queue timeout.
	 * @protected
	 */
	protected buildFormatQueue(timeout?: number): PQueue {
		const queue = new PQueue({
			throwOnTimeout: true,
			timeout: (timeout ?? 30) * 1000,
			autoStart: false,
			concurrency: Math.round(os.cpus().length * 0.7),
			carryoverConcurrencyCount: true,
		})
		let hasReportedTotal = false
		queue.on('active', () => {
			if (!hasReportedTotal && this.#formatQueue.size) {
				this.project.logger.info(`Formatting ${this.#formatQueue.size} files`)
				hasReportedTotal = true
			}
			if (this.#formatQueue.size === 0) {
				this.project.logger.info('Formatted all generated files.')
			}
		})
		return queue
	}

	/**
	 * Resolve and process queued file format request.
	 * Requests are processed in parallel for speed.
	 * @protected
	 */
	protected resolveFormatRequests() {
		this.#formatQueue.start()
	}

	/**
	 * Add extensions to the lint backend's resolvable settings.
	 * @param extensions Extensions to add.
	 */
	addResolvableExtensions(...extensions: string[]): this {
		extensions.forEach((ext) => this.#extensions.add(ext))
		return this
	}

	/**
	 * Merge a task step into the active lint task.
	 * @param step Task step to merge.
	 */
	updateLintTask(step: TaskStep): this {
		this.#backend.updateLintTask(step)
		return this
	}

	/**
	 * Merge a task step into the eslint task (compat shim).
	 * Use {@link updateLintTask} for backend-neutral code.
	 */
	updateEslintTask(step: TaskStep): this {
		return this.updateLintTask(step)
	}

	/**
	 * Replace the lint task executable command.
	 * @param exec Replacement value.
	 * @param replace Existing value to replace. Defaults to 'eslint'.
	 */
	setLintExec(exec: string, replace: string = 'eslint'): this {
		this.#backend.setLintExec(exec, replace)
		return this
	}

	/**
	 * Compat shim for eslint-only callers. Use {@link setLintExec}.
	 */
	setEslintExec(exec: string, replace: string = 'eslint'): this {
		return this.setLintExec(exec, replace)
	}

	/**
	 * Enqueue file format request to later be formatted in parallel post synth.
	 * @param request format request.
	 */
	enqueueFormatRequest(request: FormatRequest): this {
		const cmd = this.#backend.formatFileCommand(request.filePath)
		void this.#formatQueue.add(async () => {
			this.project.logger.debug(
				`formatting source file: ${request.filePath} (from: ${request.workingDirectory})`,
			)
			return new Promise<void>((resolve) =>
				child_process.exec(
					cmd,
					{
						cwd: request.workingDirectory,
					},
					(err) => {
						if (err) {
							this.project.logger.warn(err)
						}
						resolve()
					},
				),
			)
		})
		return this
	}

	/**
	 * Schedule a file to be formatted post-synthesis.
	 * @param filePath Path to file.
	 */
	formatFile(filePath: string) {
		const root = findRootProject(this.project)
		return LintConfig.of(root)!.enqueueFormatRequest({
			filePath,
			workingDirectory: this.project.outdir,
		})
	}

	/**
	 * Emit a root biome.jsonc when any subproject opts into the biome backend.
	 * Only runs when this LintConfig is attached to a project with children.
	 * @protected
	 */
	protected maybeEmitRootBiomeConfig(): void {
		if (this.project.subprojects.length === 0) return
		if (Biome.of(this.project)) return

		const biomeChildren = this.project.subprojects.filter((p) => {
			const lc = LintConfig.of(p)
			return lc?.backend === 'biome'
		})
		if (biomeChildren.length === 0) return

		const rootBiomeProject = this.project as NodeProject
		const rootBiome = new Biome(rootBiomeProject, {
			biomeConfig: {
				formatter: {
					indentStyle: 'tab' as never,
					indentWidth: 2,
					lineWidth: 80,
				},
				javascript: {
					formatter: {
						quoteStyle: 'single' as never,
						semicolons: 'asNeeded' as never,
					},
				},
			},
		})

		// Scope root biome to opted-in package directories. Running biome from a
		// leaf uses that leaf's config (which extends this root for rules) and
		// the leaf injects its own `**` include so paths match correctly.
		for (const child of biomeChildren) {
			const relPath = path.relative(this.project.outdir, child.outdir)
			rootBiome.addFilePattern(`${relPath}/**`)
		}
		rootBiome.addFilePattern('!**/node_modules/**')
		rootBiome.addFilePattern('!**/dist/**')
		rootBiome.addFilePattern('!**/dist-types/**')

		rootBiome.expandLinterRules({
			style: {
				useConsistentTypeDefinitions: {
					level: 'error',
					options: { style: 'interface' },
				},
			},
		})
		removeBiomeFromTestTask(rootBiomeProject, rootBiome)
	}

	/**
	 * @inheritDoc
	 */
	preSynthesize() {
		this.#backend.ignoreReadOnlyFiles()
		this.#backend.applyResolvableExtensions(Array.from(this.#extensions))
		this.maybeEmitRootBiomeConfig()
		super.preSynthesize()
	}

	/**
	 * @inheritDoc
	 */
	postSynthesize() {
		super.postSynthesize()
		this.resolveFormatRequests()
	}
}
