import type nx_monorepo from '@aws-prototyping-sdk/nx-monorepo'
import { CollectionKind, PrimitiveType } from '@jsii/spec'
import { ProjenStruct, Struct } from '@mrgrain/jsii-struct-builder'
import path from 'pathe'
import { type cdk, Component, type typescript } from 'projen'
import { LintConfig } from '@arroyodev-llc/projen.component.linting'

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

		const filePath = path.join('projenrc', 'nx-monorepo-project-options.ts')
		const struct = new ProjenStruct(project, {
			name: 'NxMonorepoProjectOptions',
			filePath,
		})

		struct.mixin(
			Struct.fromFqn(
				'@aws-prototyping-sdk/nx-monorepo.NxMonorepoProjectOptions'
			)
				.withoutDeprecated()
				.omit('defaultReleaseBranch'),
			typescriptStructMixin
		)
	}
}

export class ProjenProjectOptionsBuilder extends Component {
	constructor(project: typescript.TypeScriptProject) {
		super(project)

		const filePath = path.join('projenrc', 'projen-project-options.ts')
		const struct = new ProjenStruct(project, {
			name: 'ProjenProjectOptions',
			filePath,
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

		LintConfig.of(project)?.eslint?.addIgnorePattern?.(filePath)
	}
}

export class TypeScriptProjectOptionsBuilder extends Component {
	constructor(project: typescript.TypeScriptProject) {
		super(project)

		const filePath = path.join('projenrc', 'typescript-project-options.ts')
		const struct = new ProjenStruct(project, {
			name: 'TypeScriptProjectOptions',
			filePath,
		})

		struct.mixin(
			Struct.fromFqn('projen.typescript.TypeScriptProjectOptions')
				.withoutDeprecated()
				.omit('defaultReleaseBranch'),
			typescriptStructMixin
		)

		LintConfig.of(project)?.eslint?.addIgnorePattern?.(filePath)
	}
}
