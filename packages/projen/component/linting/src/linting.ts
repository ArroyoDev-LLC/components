import { applyOverrides, replaceTask } from '@arroyodev-llc/utils.projen'
import { Component, type ObjectFile, type Project, type TaskStep } from 'projen'
import {
	type NodeProject,
	type PrettierOptions,
	Eslint,
	Prettier,
} from 'projen/lib/javascript'

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

	constructor(project: NodeProject) {
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

		this.eslintFile = project.tryFindObjectFile('.eslintrc.json')!
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
}
