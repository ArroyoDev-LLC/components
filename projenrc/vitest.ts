import path from 'node:path'
import { Component, JsonFile, type Project } from 'projen'
import { type TypeScriptProject } from 'projen/lib/typescript'
import {
	type ObjectLiteralExpression,
	type SourceFile,
	SyntaxKind,
} from 'ts-morph'
import { type UserWorkspaceConfig } from 'vitest/config'
import {
	TypeScriptSourceFile,
	type TypeScriptSourceFileTransform,
} from '@arroyodev-llc/projen.component.typescript-source-file'
import { addPropertyAssignmentsFromObject } from '@arroyodev-llc/utils.projen'

export enum VitestConfigType {
	WORKSPACE = 'Workspace',
	PROJECT = 'Project',
	CONFIG = 'Config',
}

export interface VitestOptions {
	configFilePath?: string
	configType?: VitestConfigType
	settings?: UserWorkspaceConfig
}

export class Vitest extends Component {
	public static of(project: Project): Vitest | undefined {
		const isVitest = (c: Component): c is Vitest => c instanceof Vitest
		return project.components.find(isVitest)
	}

	readonly configType: VitestConfigType
	readonly configFile: TypeScriptSourceFile
	readonly #workspaceProjects: Map<string, Vitest> = new Map<string, Vitest>()

	constructor(
		public readonly project: TypeScriptProject,
		public readonly options: VitestOptions = {
			configFilePath: 'vitest.config.ts',
			configType: VitestConfigType.PROJECT,
			settings: {},
		}
	) {
		super(project)
		this.configType = this.options.configType ?? VitestConfigType.PROJECT
		const configFilePath = this.options.configFilePath ?? 'vitest.config.ts'

		this.project.tsconfigDev?.addInclude?.(configFilePath)
		this.project?.eslint?.addOverride?.({
			files: [
				configFilePath,
				...(this.options.settings?.test?.include ?? [this.project.testdir]),
			],
			rules: {
				'import/no-extraneous-dependencies': ['off'],
			},
		})

		this.configFile = new TypeScriptSourceFile(this.project, configFilePath, {
			source: `export default ${this.defineName}({})`,
			recreate: true,
		})

		this.configFile.addImport({
			moduleSpecifier: 'vitest/config',
			namedImports: [this.configType],
		})

		if (this.configType === VitestConfigType.PROJECT) {
			this.tryFindWorkspace()?.addProjectConfig?.(this)
		}

		if (this.configType === VitestConfigType.WORKSPACE) {
			new JsonFile(this.project, 'vitest.workspace.json', {
				readonly: true,
				allowComments: false,
				obj: () => Array.from(this.#workspaceProjects.keys()),
			})
		}

		this.addConfigTransform((configExpr) => {
			const { test = { include: ['test/**.spec.ts'] }, ...rest } =
				this.options.settings ?? {}
			addPropertyAssignmentsFromObject(configExpr, { test, ...rest })
		})
	}

	protected get defineName(): string {
		return this.configType === VitestConfigType.PROJECT
			? 'defineProject'
			: 'defineConfig'
	}

	tryFindWorkspace(): Vitest | undefined {
		if (this.configType === VitestConfigType.WORKSPACE) return this
		if (this.project.parent) {
			return Vitest.of(this.project.parent)?.tryFindWorkspace?.()
		}
		return
	}

	addProjectConfig(component: Vitest): this {
		if (this.configType !== VitestConfigType.WORKSPACE)
			throw new Error('No vitest workspace found. Cannot add project config!')
		const relPath = path.format({
			dir: '.',
			base: path.relative(
				path.dirname(this.configFile.absolutePath),
				component.configFile.absolutePath
			),
		})
		this.#workspaceProjects.set(relPath, component)
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
				.getExportAssignmentOrThrow((exp) =>
					Boolean(exp.getExpressionIfKind(SyntaxKind.CallExpression))
				)
				.getExpressionIfKindOrThrow(SyntaxKind.CallExpression)
			const configExpr = configExport
				.getArguments()[0]!
				.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
			transform(configExpr, src)
		}
		this.configFile.addTransformer(transformer)
		return this
	}
}
