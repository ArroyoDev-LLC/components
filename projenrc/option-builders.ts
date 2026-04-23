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
			'nx-monorepo-project-options.ts',
		)
		const struct = new ProjenStruct(project, {
			name: 'NxMonorepoProjectOptions',
			filePath,
			importLocations: {
				'@arroyodev-llc/utils-projen': '@arroyodev-llc/utils.projen',
			},
			outputFileOptions: {
				useTypeImports: true,
			},
		})

		struct.mixin(
			Struct.fromFqn('@aws/pdk.monorepo.MonorepoTsProjectOptions')
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
				})
				.add({
					name: 'nxCacheDefaults',
					optional: true,
					docs: {
						summary:
							'Write default `namedInputs` + `targetDefaults` entries to `nx.json`.',
						remarks:
							'Establishes granular cache invalidation for common targets (build/compile/package/test/eslint) so README/test edits do not bust build caches.',
						default: 'true',
					},
					type: { primitive: PrimitiveType.Boolean },
				})
				.add({
					name: 'nxUseDaemon',
					optional: true,
					docs: {
						summary: 'Enable the Nx daemon process.',
						remarks:
							'Speeds up graph computation across invocations. Set to false if daemon staleness causes issues in specific environments.',
						default: 'true',
					},
					type: { primitive: PrimitiveType.Boolean },
				})
				.add({
					name: 'nxEnableJsPlugin',
					optional: true,
					docs: {
						summary:
							'Register the `@nx/js/typescript` plugin for import-based project graph edges.',
						remarks:
							'Target inference is not enabled (projen owns targets). Auto-adds `@nx/js` to devDependencies when enabled.',
						default: 'false',
					},
					type: { primitive: PrimitiveType.Boolean },
				})
				.add({
					name: 'nxCloudAccessToken',
					optional: true,
					docs: {
						summary:
							'Public read-only Nx Cloud access token to embed in `nx.json`.',
						remarks:
							'Public read-only tokens are safe to commit and allow fresh clones to read from the distributed cache without local auth.',
					},
					type: { primitive: PrimitiveType.String },
				})
				.add({
					name: 'nxAffectedBuild',
					optional: true,
					docs: {
						summary:
							'Rewrite the root `build` task and build workflow env to use `nx affected` on PRs.',
						remarks:
							'CI PR builds run `nx affected` with base/head SHAs; push and manual runs fall through to `nx run-many`. Requires bash-compatible shell for task env-var expansion.',
						default: 'true',
					},
					type: { primitive: PrimitiveType.Boolean },
				})
				.add({
					name: 'nxCloudAccessTokenExpression',
					optional: true,
					docs: {
						summary:
							'GitHub Actions expression used for the `NX_CLOUD_ACCESS_TOKEN` env var on CI jobs.',
						remarks:
							'Defaults to a write-scope-on-main-push fallback: prefer `secrets.NX_CLOUD_AUTH_TOKEN_WRITE` on main-branch pushes, fall back to `secrets.NX_CLOUD_ACCESS_TOKEN`. Missing secrets evaluate to empty strings — safe.',
					},
					type: { primitive: PrimitiveType.String },
				}),
			typescriptStructMixin,
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
			outputFileOptions: {
				useTypeImports: true,
			},
		})

		const optional: Array<keyof cdk.JsiiProjectOptions> = [
			'defaultReleaseBranch',
			'repositoryUrl',
			'author',
			'authorAddress',
		]

		struct.mixin(
			Struct.fromFqn('projen.cdk.JsiiProjectOptions').withoutDeprecated(),
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
			'src',
		)
		const filePath = path.join(basePath, 'typescript-project-options.ts')
		const tsconfigPath = path.join(basePath, 'typescript-config-options.ts')
		const tsconfigCompilerStruct = new ProjenStruct(project, {
			name: 'TypeScriptCompilerOptions',
			filePath: path.join(basePath, 'typescript-compiler-options.ts'),
			fqn: '@arroyodev-llc/projen-project-typescript.TypeScriptCompilerOptions',
			outputFileOptions: {
				useTypeImports: true,
			},
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
			}),
		)

		const tsconfigStruct = new ProjenStruct(project, {
			name: 'TypeScriptConfigOptions',
			filePath: tsconfigPath,
			fqn: '@arroyodev-llc/projen-project-typescript.TypeScriptConfigOptions',
			importLocations: {
				'@arroyodev-llc/projen-project-typescript': './',
			},
			outputFileOptions: {
				useTypeImports: true,
			},
		})
		tsconfigStruct.mixin(
			Struct.fromFqn('projen.javascript.TypescriptConfigOptions').update(
				'compilerOptions',
				{
					type: tsconfigCompilerStruct,
				},
			),
		)

		const struct = new ProjenStruct(project, {
			name: 'TypeScriptProjectOptions',
			filePath,
			importLocations: {
				'@arroyodev-llc/projen-project-typescript': './',
			},
			outputFileOptions: {
				useTypeImports: true,
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
			typescriptStructMixin,
		)

		LintConfig.of(project)?.eslint?.addIgnorePattern?.(filePath)
	}
}
