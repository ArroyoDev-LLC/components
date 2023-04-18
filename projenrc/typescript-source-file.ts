import { buildExecutableCommand } from '@aws-prototyping-sdk/nx-monorepo'
import { FileBase, FileBaseOptions, typescript } from 'projen'
import { execCapture } from 'projen/lib/util'
import { Project, SourceFile } from 'ts-morph'

interface TypeScriptSourceFileOptions
	extends Omit<FileBaseOptions, 'readonly'> {
	source: string
	transformer?: (sourcefile: SourceFile) => void
	format?: boolean
	marker?: boolean
}

/**
 * Managed TypeScriptSourceFile through TypeScript AST
 * @see Based on: https://github.com/mrgrain/cdk-esbuild/blob/main/projenrc/TypeScriptSourceFile.ts
 */
export class TypeScriptSourceFile extends FileBase {
	public readonly options: TypeScriptSourceFileOptions

	constructor(
		public readonly project: typescript.TypeScriptProject,
		public readonly filePath: string,
		options: TypeScriptSourceFileOptions
	) {
		super(project, filePath, { ...options, readonly: false })

		this.options = {
			format: true,
			marker: true,
			...options,
		}
	}

	protected synthesizeContent(): string {
		const tsProject = new Project({
			tsConfigFilePath: 'tsconfig.json',
			skipAddingFilesFromTsConfig: true,
			// addFilesFromTsConfig: false,
		})

		// const sourceFile = tsProject.createSourceFile(filePath, this.options.source)!
		let sourceFile = tsProject.addSourceFileAtPathIfExists(this.filePath)
		if (!sourceFile) {
			sourceFile = tsProject.createSourceFile(
				this.filePath,
				this.options.source
			)
		}
		// const sourceFile = tsProject.createSourceFile(, this.options.source)

		if (this.options.transformer) {
			this.options.transformer(sourceFile)
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
			`eslint --no-ignore --ext .ts --fix ${this.absolutePath}`
		)
		try {
			execCapture(cmd, {
				cwd: outdir,
			})
		} catch(e) {
			console.warn(e)
		}
	}
}
