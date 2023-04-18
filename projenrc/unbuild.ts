import { Component, DependencyType, Project, SourceCode } from 'projen'
import { BuildConfig as UnBuildBuildConfig } from 'unbuild'
import { ModuleImports } from 'projen/lib/javascript/render-options'

interface UnBuildOptions {
	vue?: boolean
	options?: UnBuildBuildConfig
}

export class UnBuild extends Component {
	public static of(project: Project): UnBuild | undefined {
		const isUnBuild = (o: Component): o is UnBuild => o instanceof UnBuild
		return project.components.find(isUnBuild)
	}

	readonly vue: boolean
	readonly options: UnBuildBuildConfig

	file: SourceCode
	readonly imports: ModuleImports

	constructor(project: Project, options: UnBuildOptions = {}) {
		super(project)
		this.vue = options.vue ?? false
		this.options = options.options ?? {}

		this.file = new SourceCode(this.project, 'build.config.ts', {
			readonly: true,
		})
		this.file.line(`// ${this.file.marker}`)

		this.project.deps.addDependency('unbuild', DependencyType.BUILD)
		this.imports = new ModuleImports()
		this.imports.add('unbuild', 'defineBuildConfig')

		if (this.vue) {
			this.project.deps.addDependency('rollup-plugin-vue', DependencyType.BUILD)
			this.file.line(`import vue from "rollup-plugin-vue";`)
		}

		this.imports.asEsmImports().map((imp) => this.file.line(imp))
		this.file.open(`export default defineBuildConfig({`)

		const optionsSource = Object.keys(this.options).length
			? '...' + JSON.stringify(this.options) + ','
			: ''
		const hooksSource = this.options?.hooks
			? '...' + JSON.stringify(this.options.hooks) + ','
			: ''

		this.file.line(optionsSource)
		this.file.open('hooks: {')
		if (this.vue) {
			this.file.open(`'rollup:options': (ctx, options) => {`)
			this.file.line('// @ts-expect-error ignore rollup')
			this.file.line('options.plugins.push(vue());')
			this.file.close('},')
		}
		this.file.line(hooksSource)
		this.file.close('}')
		this.file.close('})')
	}
}
