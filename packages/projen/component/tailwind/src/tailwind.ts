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
	JsonPatch,
	type Project,
	type typescript,
} from 'projen'
import { deepMerge } from 'projen/lib/util'
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
	/**
	 * Tailwind config file path.
	 * @default 'tailwind.js'
	 */
	filePath?: string
	/**
	 * Tailwind config.
	 */
	config?: Config
}

export class Tailwind extends Component {
	public static of(project: Project): Tailwind | undefined {
		return findComponent(project, Tailwind)
	}

	readonly file: TypeScriptSourceFile
	readonly options: Required<TailwindOptions>

	constructor(
		project: typescript.TypeScriptProject,
		options?: TailwindOptions
	) {
		super(project)

		this.options = deepMerge([
			{
				filePath: 'tailwind.js',
				config: {
					content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
					theme: {
						extend: {},
					},
				},
			} as TailwindOptions,
			options,
		]) as Required<TailwindOptions>

		this.project.deps.addDependency('tailwindcss', DependencyType.RUNTIME)

		this.file = new TypeScriptSourceFile(project, this.options.filePath, {
			source: [
				`/** @type {import('tailwindcss').Config} */`,
				'export default {}',
			].join('\n'),
			recreate: true,
		})
		this.file.tsconfigFile.patch(JsonPatch.add('/include/-', 'tailwind.js'))

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
			const existsPlugins = this.file.getOrCreatePropertyAssignmentInitializer(
				configExpr,
				'plugins',
				SyntaxKind.ArrayLiteralExpression
			)
			existsPlugins.addElements(pluginSpec)
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
			const configExport = this.file.getDefaultExport(
				src,
				SyntaxKind.ObjectLiteralExpression
			)
			transform(configExport, src)
		}
		this.file.addTransformer(transformer)
		return this
	}
}
