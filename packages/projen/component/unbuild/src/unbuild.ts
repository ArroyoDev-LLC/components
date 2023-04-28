import path from 'node:path'
import {
	TypeScriptSourceFile,
	type TypeScriptSourceFileTransform,
} from '@arroyodev-llc/projen.component.typescript-source-file'
import {
	addPropertyAssignmentsFromObject,
	cwdRelativePath,
} from '@arroyodev-llc/utils.projen'
import { Component, DependencyType } from 'projen'
import { type TypeScriptProject } from 'projen/lib/typescript'
import {
	type ObjectLiteralExpression,
	type SourceFile,
	SyntaxKind,
} from 'ts-morph'
import { type BuildConfig as UnBuildBuildConfig } from 'unbuild'

export interface UnBuildOptions {
	cjs?: boolean
	options?: UnBuildBuildConfig
}

export class UnBuild extends Component {
	public static of(project: TypeScriptProject): UnBuild | undefined {
		const isUnBuild = (o: Component): o is UnBuild => o instanceof UnBuild
		return project.components.find(isUnBuild)
	}

	readonly unbuildOptions: UnBuildBuildConfig

	readonly file: TypeScriptSourceFile

	constructor(
		public readonly project: TypeScriptProject,
		public readonly options: UnBuildOptions = { cjs: true }
	) {
		super(project)
		this.unbuildOptions = options.options ?? {}
		this.project.deps.addDependency('unbuild', DependencyType.BUILD)
		this.project.tsconfigDev?.addInclude?.('build.config.ts')
		this.project.eslint?.addOverride?.({
			files: ['build.config.ts'],
			rules: {
				'import/no-extraneous-dependencies': ['off'],
			},
		})

		const stubTask = this.project.addTask('stub')
		stubTask.spawn('unbuild', { args: ['--stub'] })

		const exportInfo = this.buildExportInfo()
		this.project.package.addField('module', exportInfo.import)
		if (this.options.cjs) {
			this.project.package.addField('main', exportInfo.require)
		}
		this.project.package.addField('types', exportInfo.types)
		this.project.package.addField('exports', {
			'.': {
				import: exportInfo.import,
				types: exportInfo.types,
				...(this.options.cjs && { require: exportInfo.require }),
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
			addPropertyAssignmentsFromObject(configExpr, this.unbuildOptions)
		})
	}

	buildExportInfo() {
		const makePath = (distFile: string) =>
			cwdRelativePath('.', path.join(this.project.libdir, distFile))
		const defaultExports = {
			import: makePath('index.mjs'),
			types: makePath('index.d.ts'),
			require: makePath('index.cjs'),
		}
		return defaultExports
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
