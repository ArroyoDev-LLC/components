import child_process from 'node:child_process'
import {
	applyOverrides,
	replaceTask,
	findRootProject,
} from '@arroyodev-llc/utils.projen'
import {
	Component,
	type ObjectFile,
	type Project,
	type TaskStep,
	typescript,
} from 'projen'
import {
	type NodeProject,
	type PrettierOptions,
	Eslint,
	Prettier,
} from 'projen/lib/javascript'

export interface LintConfigOptions {
	/**
	 * Enable type-enriched linting in eslint.
	 */
	readonly useTypeInformation?: boolean
}

interface FormatRequest {
	filePath: string
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

	#formatRequests: Array<FormatRequest> = []

	constructor(
		project: NodeProject,
		options: LintConfigOptions = { useTypeInformation: true }
	) {
		super(project)

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

		if (options.useTypeInformation) {
			this.enableEslintTypeInformation()
		}
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
		if (!this.#formatRequests.length) return
		const formatPromises = this.#formatRequests.map((request) => {
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
		const fileCount = this.#formatRequests.length
		this.project.logger.info(
			`Waiting for ${fileCount} files to be formatted...`
		)
		void Promise.all(formatPromises).then(() => {
			this.project.logger.info(`Formatted ${fileCount} files.`)
		})
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
		this.#formatRequests.push(request)
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
