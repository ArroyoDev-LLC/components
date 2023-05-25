import { LintConfig } from '@arroyodev-llc/projen.component.linting'
import type nx_monorepo from '@aws-prototyping-sdk/nx-monorepo'
import { CollectionKind, PrimitiveType } from '@jsii/spec'
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
	constructor(project: nx_monorepo.NxMonorepoProject) {
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
		})

		struct.mixin(
			Struct.fromFqn(
				'@aws-prototyping-sdk/nx-monorepo.NxMonorepoProjectOptions'
			)
				.withoutDeprecated()
				.update('defaultReleaseBranch', { optional: true }),
			typescriptStructMixin
		)
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

		const filePath = path.join(
			'packages',
			'projen',
			'project',
			'typescript',
			'src',
			'typescript-project-options.ts'
		)
		const struct = new ProjenStruct(project, {
			name: 'TypeScriptProjectOptions',
			filePath,
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
				}),
			typescriptStructMixin
		)

		LintConfig.of(project)?.eslint?.addIgnorePattern?.(filePath)
	}
}
