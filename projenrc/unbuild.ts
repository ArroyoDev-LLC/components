import { Component, DependencyType } from 'projen'
import { ModuleImports } from 'projen/lib/javascript/render-options'
import { TypeScriptProject } from 'projen/lib/typescript'
import { SyntaxKind } from 'ts-morph'
import { BuildConfig as UnBuildBuildConfig } from 'unbuild'
import { TypeScriptSourceFile } from './typescript-source-file.ts'

export interface UnBuildOptions {
	vue?: boolean
	options?: UnBuildBuildConfig
}

export class UnBuild extends Component {
	public static of(project: TypeScriptProject): UnBuild | undefined {
		const isUnBuild = (o: Component): o is UnBuild => o instanceof UnBuild
		return project.components.find(isUnBuild)
	}

	readonly vue: boolean
	readonly options: UnBuildBuildConfig

	file: TypeScriptSourceFile

	constructor(
		public readonly project: TypeScriptProject,
		options: UnBuildOptions = {}
	) {
		super(project)
		this.vue = options.vue ?? false
		this.options = options.options ?? {}
		this.project.deps.addDependency('unbuild', DependencyType.BUILD)
		this.project.tsconfigDev.addInclude('build.config.ts')
		this.project.eslint!.addOverride({
			files: ['build.config.ts'],
			rules: {
				'import/no-extraneous-dependencies': ['off'],
			},
		})

		const unbuildImports = new ModuleImports()
		unbuildImports.add('unbuild', 'defineBuildConfig')
		unbuildImports.add('unbuild', 'type BuildConfig')
		const imports = []
		if (this.vue) {
			unbuildImports.add('unbuild', 'type BuildContext')
			unbuildImports.add('rollup', 'type RollupOptions')
			imports.push(`import vue from 'rollup-plugin-vue'`)
			this.project.deps.addDependency('rollup', DependencyType.BUILD)
			this.project.deps.addDependency('rollup-plugin-vue', DependencyType.BUILD)
		}
		imports.unshift(unbuildImports.asEsmImports().join('\n'))

		const source = `${imports.join('\n')}

const config: BuildConfig = {}
export default defineBuildConfig(config)`

		this.file = new TypeScriptSourceFile(project, 'build.config.ts', {
			source,
			transformer: (sourceFile) => {
				const cfgNode = sourceFile.getVariableDeclarationOrThrow('config')
				const configExpr = cfgNode.getInitializerIfKindOrThrow(
					SyntaxKind.ObjectLiteralExpression
				)
				configExpr.addPropertyAssignments(
					Object.entries(this.options).map(([key, value]) => ({
						name: key,
						initializer:
							typeof value === 'string' ? `'${value}'` : value.toString(),
					}))
				)
				if (this.vue) {
					const hooksExpr = configExpr.addPropertyAssignment({
						name: 'hooks',
						initializer: '{}',
					})
					const hooksExprInit = hooksExpr.getInitializerIfKindOrThrow(
						SyntaxKind.ObjectLiteralExpression
					)
					hooksExprInit.addPropertyAssignment({
						name: `'rollup:options'`,
						initializer: `(ctx: BuildContext, options: RollupOptions) => {
							// @ts-expect-error ignore rollup.
							options.plugins.push(vue())
						}`,
					})
				}
			},
		})

	}

}
