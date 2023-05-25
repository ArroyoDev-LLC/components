import os from 'node:os'
import path from 'node:path'
import { typescript } from 'projen'
import { Testing } from 'projen/lib/testing'
import { beforeEach, expect, test } from 'vitest'
import { Tailwind } from '../src'

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

test<TestContext>('renders as expected.', async (ctx) => {
	const tailwind = new Tailwind(ctx.project)
	const synth = Testing.synth(ctx.project)
	expect(synth['tailwind.config.mjs']).toBeDefined()
	expect(synth['tailwind.config.mjs']).toMatchSnapshot()
	expect(synth['tsconfig.dev.json']).toMatchSnapshot()
	expect(synth['package.json']).toMatchSnapshot()
})

test<TestContext>('renders with plugins as expected.', async (ctx) => {
	const tailwind = new Tailwind(ctx.project)
	tailwind.addPlugin({
		name: 'forms',
		moduleImport: {
			moduleSpecifier: '@tailwindcss/forms',
			defaultImport: 'forms',
		},
	})
	const synth = Testing.synth(ctx.project)
	expect(synth['tailwind.config.js']).toMatchSnapshot()
	expect(synth['package.json']).toHaveProperty([
		'dependencies',
		'@tailwindcss/forms',
	])
})

test<TestContext>('merges options as expected.', async (ctx) => {
	const tailwind = new Tailwind(ctx.project, {
		filePath: 'tailwind.config.js',
		config: {
			content: ['my', 'files'],
			prune: ['erethang'],
			important: true,
			theme: {
				extend: {
					colors: {
						primary: 'blue',
					},
				},
			},
		},
	})
	expect(tailwind.options).toMatchInlineSnapshot(`
		{
		  "config": {
		    "content": [
		      "my",
		      "files",
		    ],
		    "important": true,
		    "prune": [
		      "erethang",
		    ],
		    "theme": {
		      "extend": {
		        "colors": {
		          "primary": "blue",
		        },
		      },
		    },
		  },
		  "filePath": "tailwind.config.js",
		}
	`)
})
