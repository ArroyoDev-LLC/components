import {
	TypeScriptSourceFile,
	type TypeScriptSourceFileTransform,
} from '@arroyodev-llc/projen.component.typescript-source-file'
import {
	addPropertyAssignmentsFromObject,
	findComponent,
} from '@arroyodev-llc/utils.projen'
import { Component, DependencyType, type Project } from 'projen'
import { type NodePackage } from 'projen/lib/javascript'
import { type TypeScriptProject } from 'projen/lib/typescript'
import {
	SyntaxKind,
	type ObjectLiteralExpression,
	type SourceFile,
} from 'ts-morph'
import type { UserConfigExport } from 'vite'

export interface ViteOptions {
	build: UserConfigExport
}

export class Vite extends Component {
	public static of(project: Project): Vite | undefined {
		return findComponent<typeof Vite>(project, Vite)
	}

	readonly file: TypeScriptSourceFile

	constructor(
		public readonly project: TypeScriptProject,
		public readonly options?: ViteOptions
	) {
		super(project)
		this.options = options ?? { build: {} }

		this.applyPackage(this.project.package)
		this.file = this.buildFile()
		this.addBuildConfig(this.options.build)
	}

	protected applyPackage(nodePackage: NodePackage): this {
		nodePackage.project.deps.addDependency('vite', DependencyType.BUILD)
		return this
	}

	protected buildFile(): TypeScriptSourceFile {
		const file = new TypeScriptSourceFile(this.project, 'vite.config.ts', {
			source: `export default defineConfig({})`,
			recreate: true,
		})
		file.addImport({
			moduleSpecifier: 'vite',
			namedImports: ['defineConfig'],
		})
		return file
	}

	addBuildConfig(config: UserConfigExport): this {
		this.addConfigTransform((configExpr) => {
			addPropertyAssignmentsFromObject(configExpr, config)
		})
		return this
	}

	addConfigTransform(
		transform: (
			configObjectLiteral: ObjectLiteralExpression,
			sourceFile: SourceFile
		) => void
	): this {
		const transformer: TypeScriptSourceFileTransform = (src: SourceFile) => {
			const configExport = src
				.getExportAssignmentOrThrow((exp) =>
					Boolean(exp.getExpressionIfKind(SyntaxKind.CallExpression))
				)
				.getExpressionIfKindOrThrow(SyntaxKind.CallExpression)
			const configExpr = configExport
				.getArguments()[0]!
				.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
			transform(configExpr, src)
		}
		this.file.addTransformer(transformer)
		return this
	}
}
