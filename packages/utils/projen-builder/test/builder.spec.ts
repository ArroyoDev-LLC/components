import {
	javascript,
	type Project,
	type ProjectOptions,
	typescript,
} from 'projen'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { builders, type BuildStep, ProjectBuilder } from '../src'
import { type TypedPropertyDescriptorMap } from '../src/types'

describe.concurrent('ProjectBuilder', () => {
	const optionsSpy = vi.fn()

	beforeEach(() => optionsSpy.mockReset())

	class CustomBuilder implements BuildStep {
		declare _outputOptions: {
			readonly newOption?: boolean
			readonly defaultReleaseBranch?: string
		}
		declare _output: {
			readonly customProperty: string
		}

		constructor(readonly options?: { overrideReleaseBranch: string }) {}

		applyOptions(
			options: ProjectOptions & this['_outputOptions'],
		): ProjectOptions & this['_outputOptions'] {
			const opts = {
				...options,
				defaultReleaseBranch: this.options?.overrideReleaseBranch ?? 'override',
				newOption: options.newOption ?? true,
			}
			optionsSpy(opts)
			return opts
		}

		applyProject(
			project: Project,
		): TypedPropertyDescriptorMap<this['_output']> {
			return {
				customProperty: {
					writable: false,
					value: 'customValue',
				},
			} as TypedPropertyDescriptorMap<this['_output']>
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

	test('applies step options with prepend', () => {
		const options = new ProjectBuilder(typescript.TypeScriptProject)
			.add(new CustomBuilder())
			.add(new CustomBuilder({ overrideReleaseBranch: 'different' }), {
				prepend: true,
			}) // because prepend, release branch should result as 'override'
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
		expect(optionsSpy).toHaveBeenCalledTimes(2)
		expect(
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
			optionsSpy.mock.calls.map((call) => call[0].defaultReleaseBranch),
		).toEqual(['different', 'override'])
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
				}),
			)
			.build({
				name: 'test.project',
			})
		expect(project.package.packageManager).toBe(
			javascript.NodePackageManager.PNPM,
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
			.add(new builders.OptionsPropertyBuilder<(typeof base)['_options']>())
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
