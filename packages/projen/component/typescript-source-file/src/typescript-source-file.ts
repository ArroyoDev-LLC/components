import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import {
	FileBase,
	type FileBaseOptions,
	type ObjectFile,
	type typescript,
} from 'projen'
import {
	type ImportDeclarationStructure,
	type OptionalKind,
	Project,
	type SourceFile,
	SyntaxKind,
	type KindToExpressionMappings,
	type ObjectLiteralExpression,
	type WriterFunction,
} from 'ts-morph'

export interface TypeScriptSourceFileTransform {
	(sourceFile: SourceFile): void
}

export interface TypeScriptSourceFileOptions
	extends Omit<FileBaseOptions, 'readonly'> {
	source: string
	format?: boolean
	marker?: boolean
	recreate?: boolean
	transforms?: Array<TypeScriptSourceFileTransform>
	tsconfig?: ObjectFile
}

/**
 * Managed TypeScriptSourceFile through TypeScript AST
 * @see Based on: https://github.com/mrgrain/cdk-esbuild/blob/main/projenrc/TypeScriptSourceFile.ts
 */
export class TypeScriptSourceFile extends FileBase {
	public readonly options: TypeScriptSourceFileOptions
	public readonly tsconfigFile: ObjectFile
	#transforms: Array<TypeScriptSourceFileTransform>

	constructor(
		public readonly project: typescript.TypeScriptProject,
		public readonly filePath: string,
		options: TypeScriptSourceFileOptions
	) {
		super(project, filePath, { ...options, readonly: false })

		this.#transforms = options.transforms ?? []
		this.tsconfigFile =
			options.tsconfig ??
			this.project.tryFindObjectFile('tsconfig.dev.json') ??
			this.project.tryFindObjectFile('tsconfig.json')!

		this.options = {
			format: true,
			marker: true,
			...options,
		}
	}

	get transforms(): Array<TypeScriptSourceFileTransform> {
		return this.#transforms.slice()
	}

	addTransformer(transformer: TypeScriptSourceFileTransform): this {
		this.#transforms.push(transformer)
		return this
	}

	addImport(...imports: Array<OptionalKind<ImportDeclarationStructure>>): this {
		const transform: TypeScriptSourceFileTransform = (sourceFile) => {
			sourceFile.addImportDeclarations(imports.slice())
		}
		this.addTransformer(transform)
		return this
	}

	/**
	 * Find default export expression of {@link SyntaxKind} type.
	 * @param source {@link SourceFile} to look at.
	 * @param expressionKind {@link SyntaxKind} of export expression.
	 */
	getDefaultExport<T extends SyntaxKind>(
		source: SourceFile,
		expressionKind: T
	): KindToExpressionMappings[T] {
		const defaultExportNode = source
			.getExportAssignments()
			.find((exportNode) => !exportNode.isExportEquals())
		return defaultExportNode!.getExpressionIfKindOrThrow(expressionKind)
	}

	/**
	 * Get or create property assignment initializer on object literal.
	 * @param objectLiteral Source {@link ObjectLiteralExpression}
	 * @param name Property assignment name.
	 * @param initializerKind {@link SyntaxKind} of initializer.
	 * @param defaultInitializer Specify initializer to use if creation is warranted. Default depends on `initializerKind`.
	 */
	getOrCreatePropertyAssignmentInitializer<T extends SyntaxKind>(
		objectLiteral: ObjectLiteralExpression,
		name: string,
		initializerKind: T,
		defaultInitializer?: string | WriterFunction
	) {
		const initDefaults: Partial<Record<SyntaxKind, string>> = {
			[SyntaxKind.ObjectLiteralExpression]: '{}',
			[SyntaxKind.ArrayLiteralExpression]: '[]',
			[SyntaxKind.StringLiteral]: '""',
			[SyntaxKind.NumericLiteral]: '0',
		}
		defaultInitializer ??= initDefaults[initializerKind] ?? '{}'
		const existsProperty =
			objectLiteral
				.getProperty(name)
				?.asKind?.(SyntaxKind.PropertyAssignment) ??
			objectLiteral.addPropertyAssignment({
				name,
				initializer: defaultInitializer,
			})
		return existsProperty.getInitializerIfKindOrThrow(initializerKind)
	}

	protected synthesizeContent(): string {
		const tsProject = new Project({
			tsConfigFilePath: this.tsconfigFile.path,
			skipAddingFilesFromTsConfig: true,
			compilerOptions: { allowJs: true },
		})

		let sourceFile: SourceFile
		if (this.options.recreate) {
			sourceFile = tsProject.createSourceFile(
				this.filePath,
				this.options.source,
				{ overwrite: true }
			)
		} else {
			sourceFile =
				tsProject.addSourceFileAtPathIfExists(this.filePath) ??
				tsProject.createSourceFile(this.filePath, this.options.source)
		}

		if (this.transforms.length > 0) {
			this.transforms.forEach((transform) => transform(sourceFile))
			sourceFile = sourceFile.fixMissingImports().organizeImports()
		}

		return [
			...(this.options.marker ? [`// ${this.marker as string}`] : []),
			'',
			sourceFile.getFullText(),
		].join('\n')
	}

	/**
	 * @inheritDoc
	 */
	preSynthesize() {
		super.preSynthesize()
		// enqueue generated files for linting.
		LintConfig.of(this.project)?.formatFile?.(this.absolutePath)
	}
}
