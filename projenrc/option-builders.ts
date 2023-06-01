import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import { CollectionKind, PrimitiveType, TypeKind } from '@jsii/spec'
import { ProjenStruct, Struct } from '@mrgrain/jsii-struct-builder'
import path from 'pathe'
import { type cdk, Component, type typescript } from 'projen'

const typescriptStructMixin = Struct.empty()
	.add({
		name: 'workspaceDeps',
		optional: true,
		docs: {
			summary: 'Dependencies linked by the `workspace` protocol.',
		},
		type: {
			collection: {
				kind: CollectionKind.Array,
				elementtype: {
					union: {
						types: [
							{ fqn: 'projen.javascript.NodeProject' },
							{ primitive: PrimitiveType.String },
						],
					},
				},
			},
		},
	})
	.add({
		name: 'tsconfigBase',
		optional: true,
		docs: {
			summary: 'TypescriptConfigExtends to use as base.',
		},
		type: { fqn: 'projen.javascript.TypescriptConfigExtends' },
	})

export class NxMonorepoProjectOptionsBuilder extends Component {
	readonly optionsStruct: ProjenStruct
	constructor(project: typescript.TypeScriptProject) {
		super(project)

		const filePath = path.join(
			'packages',
			'projen',
			'project',
			'nx-monorepo',
			'src',
			'nx-monorepo-project-options.ts'
		)
		const struct = new ProjenStruct(project, {
			name: 'NxMonorepoProjectOptions',
			filePath,
			importLocations: {
				'@arroyodev-llc/utils-projen': '@arroyodev-llc/utils.projen',
			},
		})

		struct.mixin(
			Struct.fromFqn(
				'@aws-prototyping-sdk/nx-monorepo.NxMonorepoProjectOptions'
			)
				.withoutDeprecated()
				.update('defaultReleaseBranch', { optional: true })
				.add({
					name: 'docgenOptions',
					optional: true,
					docs: {
						summary:
							'TSDoc configuration options. Requires `docgen` to be true.',
					},
					type: {
						primitive: PrimitiveType.Any,
					},
				})
				// TODO: fix jsii assembly path issues
				.add({
					name: 'namingScheme',
					optional: true,
					docs: {
						summary:
							'Default {@link @arroyodev-llc/utils.projen!ProjectNameSchemeOptions}',
					},
					type: Struct.fromSpec({
						name: 'ProjectNameScheme',
						fqn: '@arroyodev-llc/utils-projen.ProjectNameSchemeOptions',
						assembly: '@arroyodev-llc/utils-projen',
						kind: TypeKind.Interface,
					}),
				}),
			typescriptStructMixin
		)
		this.optionsStruct = struct
	}
}

export class ProjenProjectOptionsBuilder extends Component {
	readonly filePath: string
	constructor(project: typescript.TypeScriptProject) {
		super(project)

		this.filePath = path.join('projenrc', 'projen-project-options.ts')
		const struct = new ProjenStruct(project, {
			name: 'ProjenProjectOptions',
			filePath: this.filePath,
		})

		const optional: Array<keyof cdk.JsiiProjectOptions> = [
			'defaultReleaseBranch',
			'repositoryUrl',
			'author',
			'authorAddress',
		]

		struct.mixin(
			Struct.fromFqn('projen.cdk.JsiiProjectOptions').withoutDeprecated()
		)

		optional.forEach((name) => {
			struct.update(name, {
				optional: true,
			})
		})
	}

	preSynthesize() {
		super.preSynthesize()
		// ensure ignore is added towards bottom of patterns.
		LintConfig.of(this.project)?.eslint?.addIgnorePattern?.(this.filePath)
	}
}

export class TypeScriptProjectOptionsBuilder extends Component {
	constructor(project: typescript.TypeScriptProject) {
		super(project)

		// TODO: resolve some issues that occur if you try to add this
		// to the actual child project.

		const basePath = path.join(
			'packages',
			'projen',
			'project',
			'typescript',
			'src'
		)
		const filePath = path.join(basePath, 'typescript-project-options.ts')
		const tsconfigPath = path.join(basePath, 'typescript-config-options.ts')
		const tsconfigCompilerStruct = new ProjenStruct(project, {
			name: 'TypeScriptCompilerOptions',
			filePath: path.join(basePath, 'typescript-compiler-options.ts'),
			fqn: '@arroyodev-llc/projen-project-typescript.TypeScriptCompilerOptions',
		})
		tsconfigCompilerStruct.mixin(
			Struct.fromFqn('projen.javascript.TypeScriptCompilerOptions').add({
				name: 'types',
				optional: true,
				docs: {
					summary: 'Types to include in compilation.',
				},
				type: {
					collection: {
						kind: CollectionKind.Array,
						elementtype: { primitive: PrimitiveType.String },
					},
				},
			})
		)

		const tsconfigStruct = new ProjenStruct(project, {
			name: 'TypeScriptConfigOptions',
			filePath: tsconfigPath,
			fqn: '@arroyodev-llc/projen-project-typescript.TypeScriptConfigOptions',
			importLocations: {
				'@arroyodev-llc/projen-project-typescript': './',
			},
		})
		tsconfigStruct.mixin(
			Struct.fromFqn('projen.javascript.TypescriptConfigOptions').update(
				'compilerOptions',
				{
					type: tsconfigCompilerStruct,
				}
			)
		)

		const struct = new ProjenStruct(project, {
			name: 'TypeScriptProjectOptions',
			filePath,
			importLocations: {
				'@arroyodev-llc/projen-project-typescript': './',
			},
		})

		struct.mixin(
			Struct.fromFqn('projen.typescript.TypeScriptProjectOptions')
				.withoutDeprecated()
				.update('defaultReleaseBranch', { optional: true })
				.add({
					name: 'unbuild',
					type: { primitive: PrimitiveType.Boolean },
					optional: true,
					docs: { summary: 'Use unbuild for bundling/transpiling.' },
				})
				.update('tsconfig', { type: tsconfigStruct })
				.update('tsconfigDev', { type: tsconfigStruct }),
			typescriptStructMixin
		)

		LintConfig.of(project)?.eslint?.addIgnorePattern?.(filePath)
	}
}
