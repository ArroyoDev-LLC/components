import os from 'node:os'
import path from 'node:path'
import { typescript } from 'projen'
import { Testing } from 'projen/lib/testing'
import { beforeEach, expect, test } from 'vitest'
import { PostCSS } from '../src'

interface TestContext {
	project: typescript.TypeScriptProject
}

beforeEach<TestContext>((ctx) => {
	ctx.project = new typescript.TypeScriptProject({
		name: ctx.meta.id,
		outdir: path.join(os.tmpdir(), ctx.meta.id),
		defaultReleaseBranch: 'main',
	})
})

test<TestContext>('renders as expected', async (ctx) => {
	new PostCSS(ctx.project)
	const synth = Testing.synth(ctx.project)
	expect(synth['postcss.config.ts']).toBeDefined()
	expect(synth['postcss.config.ts']).toMatchSnapshot()
})

test<TestContext>('renders as expected with merged config', async (ctx) => {
	const postcss = new PostCSS(ctx.project)
	postcss.addConfig({
		to: 'something',
	})
	postcss.addConfig({
		from: (writer) => writer.write('resolveFrom()'),
	})
	const synth = Testing.synth(ctx.project)
	expect(synth['postcss.config.ts']).toBeDefined()
	expect(synth['postcss.config.ts']).toMatchSnapshot()
})

test<TestContext>('renders with plugins as expected', async (ctx) => {
	const postcss = new PostCSS(ctx.project)
	postcss
		.addPlugin({
			name: 'tailwindcss',
			moduleImport: {
				moduleSpecifier: 'tailwindcss',
				defaultImport: 'tailwindcss',
			},
		})
		.addPlugin({
			name: 'postcssPxToRem',
			moduleImport: {
				moduleSpecifier: 'postcss-pxtorem',
				defaultImport: 'postcssPxToRem',
			},
			options: {
				propList: ['font'],
			},
		})
	const synth = Testing.synth(ctx.project)
	expect(synth['postcss.config.ts']).toMatchSnapshot()
})
