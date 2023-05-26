import os from 'node:os'
import path from 'node:path'
import { typescript } from 'projen'
import { Testing } from 'projen/lib/testing'
import { beforeEach, expect, test } from 'vitest'
import { Vite } from '../src'

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
	new Vite(ctx.project)
	const synth = Testing.synth(ctx.project)
	expect(synth['vite.config.ts']).toBeDefined()
	expect(synth['vite.config.ts']).toMatchSnapshot()
	expect(synth['package.json']).toMatchSnapshot()
})

test<TestContext>('renders as expected with merged config', async (ctx) => {
	const vite = new Vite(ctx.project, {
		build: {
			resolve: {
				dedupe: ['vue'],
			},
		},
	})
	vite.addBuildConfig({
		resolve: {
			alias: {
				'@': (writer) => writer.write('fileUrlToPath(new URL())'),
			},
			dedupe: ['other'],
		},
	})
	const synth = Testing.synth(ctx.project)
	expect(synth['vite.config.ts']).toBeDefined()
	expect(synth['vite.config.ts']).toMatchSnapshot()
})

test<TestContext>('renders with plugins as expected', async (ctx) => {
	const vite = new Vite(ctx.project)
	vite.addPlugin({
		name: 'vueJsx',
		moduleImport: {
			moduleSpecifier: '@vite/plugin-vue-jsx',
			defaultImport: 'vueJsx',
		},
	})
	const synth = Testing.synth(ctx.project)
	expect(synth['vite.config.ts']).toMatchSnapshot()
})
