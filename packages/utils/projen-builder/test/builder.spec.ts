import {
	javascript,
	type Project,
	type ProjectOptions,
	typescript,
} from 'projen'
import { describe, expect, test } from 'vitest'
import { builders, type BuildStep, ProjectBuilder } from '../src'
import { type TypedPropertyDescriptorMap } from '../src/types'

describe.concurrent('ProjectBuilder', () => {
	class CustomBuilder implements BuildStep {
		declare outputOptionsType: {
			readonly newOption?: boolean
			readonly defaultReleaseBranch?: string
		}
		declare outputType: {
			readonly customProperty: string
		}

		applyOptions(
			options: ProjectOptions & this['outputOptionsType']
		): ProjectOptions & this['outputOptionsType'] {
			return {
				...options,
				defaultReleaseBranch: 'override',
				newOption: options.newOption ?? true,
			}
		}

		applyProject(
			project: Project
		): TypedPropertyDescriptorMap<this['outputType']> {
			return {
				customProperty: {
					writable: false,
					value: 'customValue',
				},
			} as TypedPropertyDescriptorMap<this['outputType']>
		}
	}

	test('applies step options', () => {
		const options = new ProjectBuilder(typescript.TypeScriptProject)
			.add(new CustomBuilder())
			.buildOptions({
				name: 'test.project',
				defaultReleaseBranch: 'willOverride',
			})
		expect(options).toMatchInlineSnapshot(`
			{
			  "defaultReleaseBranch": "override",
			  "name": "test.project",
			  "newOption": true,
			}
		`)
	})

	test('applies step project', () => {
		const project = new ProjectBuilder(typescript.TypeScriptProject)
			.add(new CustomBuilder())
			.build({
				name: 'test.project',
				defaultReleaseBranch: 'willOverride',
			})
		expect(project.customProperty).toBe('customValue')
	})
})

describe.concurrent('builders', () => {
	const base = new ProjectBuilder(typescript.TypeScriptProject)

	test('DefaultOptionsBuilder', () => {
		const project = base
			.add(
				new builders.DefaultOptionsBuilder({
					defaultReleaseBranch: 'main',
					packageManager: javascript.NodePackageManager.PNPM,
				})
			)
			.build({
				name: 'test.project',
			})
		expect(project.package.packageManager).toBe(
			javascript.NodePackageManager.PNPM
		)
	})

	test('NameSchemeBuilder', () => {
		const project = base
			.add(new builders.NameSchemeBuilder({ scope: '@test' }))
			.build({
				name: 'test.project',
				defaultReleaseBranch: 'main',
			})
		expect(project.package.packageName).toBe('@test/test.project')
	})

	test('OptionsPropertyBuilder', () => {
		const project = base
			.add(
				new builders.OptionsPropertyBuilder<(typeof base)['__optionsType']>()
			)
			.build({
				name: 'test.project',
				defaultReleaseBranch: 'main',
			})
		expect(project.options).toMatchInlineSnapshot(`
			{
			  "defaultReleaseBranch": "main",
			  "name": "test.project",
			}
		`)
	})
})
