import { buildExecutableCommand } from '@aws-prototyping-sdk/nx-monorepo'
import { FileBase, type FileBaseOptions, type typescript } from 'projen'
import { execCapture } from 'projen/lib/util'
import {
	type ImportDeclarationStructure,
	type OptionalKind,
	Project,
	type SourceFile,
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
}

/**
 * Managed TypeScriptSourceFile through TypeScript AST
 * @see Based on: https://github.com/mrgrain/cdk-esbuild/blob/main/projenrc/TypeScriptSourceFile.ts
 */
export class TypeScriptSourceFile extends FileBase {
	public readonly options: TypeScriptSourceFileOptions
	#transforms: Array<TypeScriptSourceFileTransform>

	constructor(
		public readonly project: typescript.TypeScriptProject,
		public readonly filePath: string,
		options: TypeScriptSourceFileOptions
	) {
		super(project, filePath, { ...options, readonly: false })

		this.#transforms = options.transforms ?? []

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

	protected synthesizeContent(): string {
		const tsProject = new Project({
			tsConfigFilePath: 'tsconfig.json',
			skipAddingFilesFromTsConfig: true,
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
			...(this.options.marker ? [`// ${this.marker}`] : []),
			'',
			sourceFile.getFullText(),
		].join('\n')
	}

	public postSynthesize() {
		super.postSynthesize()

		const outdir = this.project.outdir
		const cmd = buildExecutableCommand(
			this.project.package.packageManager,
			`eslint_d --no-ignore --ext .ts --fix ${this.absolutePath}`
		)
		try {
			execCapture(cmd, {
				cwd: outdir,
			})
		} catch (e) {
			console.warn(e)
		}
	}
}
