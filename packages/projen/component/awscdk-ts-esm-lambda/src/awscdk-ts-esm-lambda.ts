import { existsSync } from 'node:fs'
import { TypeScriptSourceFile } from '@arroyodev-llc/projen.component.typescript-source-file'
import { findComponent, isComponent } from '@arroyodev-llc/utils.projen'
import {
	awscdk,
	Component,
	type FileBase,
	type Project,
	TextFile,
	typescript,
	javascript,
} from 'projen'

export interface AwsCdkTsEsmLambdaOptions {
	/**
	 * Project relative path to lambda function construct.
	 */
	readonly filePath: string
}

/**
 * AWS CDK TypeScript Lambda function with ESM support.
 */
export class AwsCdkTsEsmLambda extends Component {
	public static of(project: Project): AwsCdkTsEsmLambda | undefined {
		return findComponent(project, AwsCdkTsEsmLambda)
	}

	readonly lambdaFile: FileBase
	readonly tsFile: TypeScriptSourceFile

	constructor(project: Project, options: AwsCdkTsEsmLambdaOptions) {
		super(project)

		this.lambdaFile = project.tryFindFile(options.filePath) as FileBase

		const lambdaComponents = this.project.components.filter((comp) =>
			isComponent(awscdk.LambdaFunction, comp),
		)
		this.node.addDependency(...lambdaComponents.map((comp) => comp.node))

		const sourceCode = this.project.components.find(
			(comp) =>
				isComponent(TextFile, comp) && comp.path === this.lambdaFile.path,
		) as TextFile
		// @ts-expect-error would required replacing component or other post synth hackarounds otherwise since we need to replace the file before it gets written
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
		const source: string = sourceCode.lines.join('\n')
		this.project.tryRemoveFile(this.lambdaFile.path)

		if (!(this.project instanceof typescript.TypeScriptProject)) {
			throw new Error('AwsCdkTsEsmLambda must be used in a TypeScriptProject')
		}

		this.tsFile = new TypeScriptSourceFile(this.project, this.lambdaFile.path, {
			marker: false,
			recreate: true,
			source,
			format: false,
		})
		this.applyTransforms()
		javascript.Eslint.of(project)?.addIgnorePattern?.(this.tsFile.path)
	}

	/**
	 * Apply transforms to the lambda function source file.
	 * @protected
	 */
	protected applyTransforms() {
		this.tsFile.addImport({
			namedImports: ['fileURLToPath'],
			moduleSpecifier: 'node:url',
		})
		this.tsFile.addTransformer((sourceFile) => {
			const functionClass = sourceFile.getClasses()[0]
			if (!functionClass)
				throw new Error('Could not find class in entrypoint file')
			const functionCtor = functionClass.getConstructors()[0]
			if (!functionCtor)
				throw new Error('Could not find class constructor in entrypoint file')
			functionCtor.insertStatements(0, [
				'const __filename = fileURLToPath(import.meta.url);',
				'const __dirname = path.dirname(__filename);',
			])
			sourceFile.formatText()
		})
	}
}

/**
 * Automatically discover and create AWS CDK TypeScript Lambda functions with ESM support.
 */
export class AwsCdkTsEsmLambdaAutoDiscover extends Component {
	constructor(project: Project) {
		super(project)

		const lambdaFunctionFiles = project.files
			.filter((file) => file.path.endsWith('-function.ts'))
			.filter((file) =>
				existsSync(file.absolutePath.replace('-function.ts', '.lambda.ts')),
			)

		for (const lambdaFunctionFile of lambdaFunctionFiles) {
			new AwsCdkTsEsmLambda(project, { filePath: lambdaFunctionFile.path })
		}
	}
}
