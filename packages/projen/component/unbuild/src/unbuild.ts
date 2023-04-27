import {
	TypeScriptSourceFile,
	type TypeScriptSourceFileTransform,
} from '@arroyodev-llc/projen.component.typescript-source-file'
import { addPropertyAssignmentsFromObject } from '@arroyodev-llc/utils.projen'
import { Component, DependencyType } from 'projen'
import { type TypeScriptProject } from 'projen/lib/typescript'
import {
	type ObjectLiteralExpression,
	type SourceFile,
	SyntaxKind,
} from 'ts-morph'
import { type BuildConfig as UnBuildBuildConfig } from 'unbuild'

export interface UnBuildOptions {
	options?: UnBuildBuildConfig
}

export class UnBuild extends Component {
	public static of(project: TypeScriptProject): UnBuild | undefined {
		const isUnBuild = (o: Component): o is UnBuild => o instanceof UnBuild
		return project.components.find(isUnBuild)
	}

	readonly options: UnBuildBuildConfig

	readonly file: TypeScriptSourceFile

	constructor(
		public readonly project: TypeScriptProject,
		options: UnBuildOptions = {}
	) {
		super(project)
		this.options = options.options ?? {}
		this.project.deps.addDependency('unbuild', DependencyType.BUILD)
		this.project.tsconfig!.addInclude('build.config.ts')
		this.project.eslint!.addOverride({
			files: ['build.config.ts'],
			rules: {
				'import/no-extraneous-dependencies': ['off'],
			},
		})

		const source = [
			`const config: BuildConfig = {}`,
			`export default defineBuildConfig(config)`,
		].join('\n')

		this.file = new TypeScriptSourceFile(project, 'build.config.ts', {
			source,
		})

		this.file.addImport({
			moduleSpecifier: 'unbuild',
			namedImports: [
				'defineBuildConfig',
				{ name: 'BuildContext', isTypeOnly: true },
				{ name: 'BuildConfig', isTypeOnly: true },
			],
		})

		// add build options
		this.addConfigTransform((configExpr) => {
			addPropertyAssignmentsFromObject(configExpr, this.options)
		})
	}

	addConfigTransform(
		transform: (
			configObjectLiteral: ObjectLiteralExpression,
			sourceFile: SourceFile
		) => void
	) {
		const transformer: TypeScriptSourceFileTransform = (src: SourceFile) => {
			const cfgNode = src.getVariableDeclarationOrThrow('config')
			const configExpr = cfgNode.getInitializerIfKindOrThrow(
				SyntaxKind.ObjectLiteralExpression
			)
			transform(configExpr, src)
		}
		this.file.addTransformer(transformer)
		return this
	}
}
