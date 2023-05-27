import child_process from 'node:child_process'
import * as os from 'os'
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
	Eslint,
	type NodeProject,
	Prettier,
	type PrettierOptions,
} from 'projen/lib/javascript'

export interface LintConfigOptions {
	/**
	 * Enable type-enriched linting in eslint.
	 */
	readonly useTypeInformation?: boolean
	/**
	 * Number in seconds to timeout formatting requests.
	 * @default 30
	 */
	readonly formatTimeout?: number
}

export interface FormatRequest {
	/**
	 * Target file path.
	 */
	filePath: string
	/**
	 * Working directory to spawn eslint from.
	 */
	workingDirectory: string
}

export class LintConfig extends Component {
	public static of(project: Project): LintConfig | undefined {
		const isLintConfig = (o: Component): o is LintConfig =>
			o instanceof LintConfig
		return project.components.find(isLintConfig)
	}

	readonly eslint: Eslint
	readonly eslintFile: ObjectFile
	readonly prettier: Prettier
	readonly prettierFile: ObjectFile

	#formatQueue: PQueue

	constructor(
		project: NodeProject,
		options: LintConfigOptions = { useTypeInformation: true, formatTimeout: 30 }
	) {
		super(project)
		this.#formatQueue = this.buildFormatQueue(options.formatTimeout)

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

		const extensions = [
			'.js',
			'.jsx',
			'.mjs',
			'.cjs',
			'.ts',
			'.tsx',
			'.mts',
			'.cts',
		]
		this.eslintFile.addToArray(
			'settings.import/resolver.node.extensions',
			extensions
		)
		this.eslintFile.addToArray('settings.import/extensions', extensions)

		if (options.useTypeInformation) {
			this.enableEslintTypeInformation()
		}
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
	 * Enable type enriched linting.
	 * @protected
	 */
	protected enableEslintTypeInformation() {
		this.eslint.addExtends(
			'plugin:@typescript-eslint/recommended-requiring-type-checking'
		)
		this.eslintFile.addOverride('parserOptions.tsconfigRootDir', '.')
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
	 * Merge task step into eslint task.
	 * @param step Task step to merge.
	 */
	updateEslintTask(step: TaskStep): this {
		replaceTask(this.project, 'eslint', [step])
		return this
	}

	/**
	 * Replace eslint executable command.
	 * @param exec Replacement value.
	 * @param replace Existing value to replace. Defaults to 'eslint'.
	 */
	setEslintExec(exec: string, replace: string = 'eslint'): this {
		const eslintTask = this.project.tasks.tryFind('eslint')!
		const eslintCmd = eslintTask.steps[0].exec!.replace(replace, exec)
		return this.updateEslintTask({
			exec: eslintCmd,
		})
	}

	/**
	 * Enqueue file format request to later be formatted in parallel post synth.
	 * @param request format request.
	 */
	enqueueFormatRequest(request: FormatRequest): this {
		void this.#formatQueue.add(async () => {
			const cmd = `eslint --cache --no-ignore --fix ${request.filePath}`
			this.project.logger.verbose(
				`formatting typescript source file: ${request.filePath} (from: ${request.workingDirectory})`
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
					}
				)
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
	 * @inheritDoc
	 */
	postSynthesize() {
		super.postSynthesize()
		this.resolveFormatRequests()
	}
}
