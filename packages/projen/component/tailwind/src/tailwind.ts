import {
	TypeScriptSourceFile,
	type TypeScriptSourceFileTransform,
} from '@arroyodev-llc/projen.component.typescript-source-file'
import {
	addPropertyAssignmentsFromObject,
	findComponent,
} from '@arroyodev-llc/utils.projen'
import {
	Component,
	DependencyType,
	type Project,
	type typescript,
} from 'projen'
import type { Config } from 'tailwindcss/types'
import {
	type ImportDeclarationStructure,
	type ObjectLiteralExpression,
	type OptionalKind,
	type SourceFile,
	SyntaxKind,
	type WriterFunction,
} from 'ts-morph'

export interface TailwindOptionsPlugin {
	name: string
	moduleImport: OptionalKind<ImportDeclarationStructure>
	/**
	 * Plugin definition specification.
	 * Defaults to `<name>(<options>)`.
	 */
	spec?: WriterFunction | readonly (string | WriterFunction)[]
}

export interface TailwindOptions {
	config?: Config
}

export class Tailwind extends Component {
	public static of(project: Project): Tailwind | undefined {
		return findComponent(project, Tailwind)
	}

	readonly file: TypeScriptSourceFile

	constructor(
		project: typescript.TypeScriptProject,
		options?: TailwindOptions
	) {
		super(project)
		this.project.deps.addDependency('tailwindcss', DependencyType.RUNTIME)

		this.file = new TypeScriptSourceFile(project, 'tailwind.ts', {
			source: [
				`/** @type {import('tailwindcss').Config} */`,
				'export default {}',
			].join('\n'),
			recreate: true,
		})

		if (options?.config) {
			this.addConfig(options.config)
		}
	}

	addPlugin(plugin: TailwindOptionsPlugin): this {
		const { moduleImport, name, spec } = plugin
		const pluginSpec = spec ?? ((writer) => writer.write(name))
		this.project.deps.addDependency(
			moduleImport.moduleSpecifier,
			DependencyType.RUNTIME
		)
		this.file.addImport(moduleImport)
		this.addConfigTransform((configExpr) => {
			const existsPlugins =
				configExpr
					.getProperty('plugins')
					?.asKind?.(SyntaxKind.PropertyAssignment) ??
				configExpr.addPropertyAssignment({
					name: 'plugins',
					initializer: '[]',
				})

			existsPlugins
				.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)
				.addElements(pluginSpec)
		})
		return this
	}

	addConfig(config: Config): this {
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
	) {
		const transformer: TypeScriptSourceFileTransform = (src: SourceFile) => {
			const configExport = src
				.getExportAssignments()[0]!
				.getExpressionIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
			transform(configExport, src)
		}
		this.file.addTransformer(transformer)
		return this
	}
}
