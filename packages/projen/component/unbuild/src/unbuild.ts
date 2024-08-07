import path from 'node:path'
import { TypeScriptSourceConfig } from '@arroyodev-llc/projen.component.typescript-source-file'
import { cwdRelativePath } from '@arroyodev-llc/utils.projen'
import { type ObjectLiteralMergeSchema } from '@arroyodev-llc/utils.ts-ast'
import { NodePackageUtils } from '@aws/pdk/monorepo'
import { Component, DependencyType } from 'projen'
import { type TypeScriptProject } from 'projen/lib/typescript'
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

	readonly file: TypeScriptSourceConfig<UnBuildBuildConfig>

	constructor(
		public readonly project: TypeScriptProject,
		public readonly options: UnBuildOptions = { cjs: true },
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

		const stubTask = this.project.addTask('stub', {
			condition: 'test -z "$CI"',
			exec: NodePackageUtils.command.exec(
				project.package.packageManager,
				'unbuild',
				'--stub',
			),
		})
		const postInstall =
			this.project.tasks.tryFind('post-install') ??
			this.project.tasks.addTask('post-install')
		postInstall.spawn(stubTask)

		const exportInfo = this.buildExportInfo()
		this.project.package.addField('types', exportInfo.types)
		const exports = this.options.cjs
			? {
					import: exportInfo.import,
					require: exportInfo.require,
				}
			: {
					types: exportInfo.types,
					default: exportInfo.import,
				}
		this.project.package.addField('exports', {
			'.': exports,
			'./package.json': './package.json',
		})
		this.project.package.addField('files', [this.project.libdir])

		const source = [`export default defineBuildConfig({})`].join('\n')

		this.file = TypeScriptSourceConfig.withCallExpressionConfig(
			project,
			'build.config.ts',
			{
				source,
				marker: true,
				config: this.unbuildOptions,
			},
		)

		this.file.addImport({
			moduleSpecifier: 'unbuild',
			namedImports: [
				'defineBuildConfig',
				{ name: 'BuildContext', isTypeOnly: true },
				{ name: 'BuildConfig', isTypeOnly: true },
			],
		})
	}

	/**
	 * Build package exports.
	 */
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

	/**
	 * Add config to merge.
	 * @param config merge config.
	 */
	addConfig(config: ObjectLiteralMergeSchema<UnBuildBuildConfig>) {
		return this.file.addConfig(config)
	}
}
