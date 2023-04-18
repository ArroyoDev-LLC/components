import { Component, ObjectFile } from 'projen'
import { Eslint, NodeProject, Prettier } from 'projen/lib/javascript'

export interface LintConfigOptions {
	/**
	 * Include vue related config.
	 */
	vue?: boolean
}

class LintConfig extends Component {
	readonly eslint: Eslint
	readonly eslintFile: ObjectFile
	readonly prettier: Prettier

	constructor(
		project: NodeProject,
		options: LintConfigOptions = { vue: false }
	) {
		super(project)

		this.eslint =
			Eslint.of(project) ??
			new Eslint(project, {
				dirs: [project.outdir],
				prettier: true,
				...(options.vue && { extensions: ['.ts', '.tsx', '.vue'] }),
			})

		this.prettier =
			Prettier.of(project) ??
			new Prettier(project, {
				settings: {
					singleQuote: true,
					semi: false,
					useTabs: true,
					tabWidth: 2,
				},
			})

		this.eslint.addRules({
			// let prettier handle:
			'key-spacing': ['off'],
			'no-multiple-empty-lines': ['off'],
			'no-trailing-spaces': ['off'],
		})

		this.eslintFile = project.tryFindObjectFile('.eslintrc.json')!

		if (options.vue) {
			this.eslintFile.addOverride('parser', 'vue-eslint-parser')
			this.eslintFile.addOverride(
				'parserOptions.parser',
				'@typescript-eslint/parser'
			)
			this.eslintFile.addOverride('settings.import/parsers.vue-eslint-parser', [
				'.vue',
			])
			project.addDevDeps('eslint-plugin-vue')
			this.eslint.addExtends('plugin:vue/vue3-recommended')
			this.eslint.eslintTask.reset(
				this.eslint.eslintTask.steps[0]!.exec!.replace('.tsx', '.tsx,.vue')
			)
		}
	}
}

export default LintConfig
