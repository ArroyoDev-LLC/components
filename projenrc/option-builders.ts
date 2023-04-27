import { ProjenStruct, Struct } from '@mrgrain/jsii-struct-builder'
import path from 'pathe'
import { type cdk, Component, type typescript } from 'projen'
import LintConfig from './lint-config.ts'

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
				.omit('defaultReleaseBranch')
		)

		LintConfig.of(project)?.eslint?.addIgnorePattern?.(filePath)
	}
}
