import os from 'node:os'
import path from 'node:path'
import { typescript } from 'projen'
import { Testing } from 'projen/lib/testing'
import { beforeEach, expect, test } from 'vitest'
import { DirEnv, DirEnvLogType, DirEnvStdLibCommand } from '../src'

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

test<TestContext>('initializes correctly', (ctx) => {
	const dirEnv = new DirEnv(ctx.project, { fileName: '.envrc' })
	const synth = Testing.synth(ctx.project)
	expect(synth['.envrc']).toBeDefined()
	expect(synth['.envrc']).toMatchInlineSnapshot('""')
})

test.todo<TestContext>('validates fileName', (ctx) => {
	const validFileNames = [
		'.envrc',
		'.envrc.local',
		'.envrc.prod',
		'.env',
		'.envrc.dev',
	]
	const invalidFileNames = ['envrc', '.envrcabc', '.envrclol']
	for (const vF of validFileNames) {
		const d = new DirEnv(ctx.project, { fileName: vF })
		expect(d).not.toThrowError()
	}
	for (const iF of invalidFileNames) {
		const d = new DirEnv(ctx.project, { fileName: iF })
		expect(d).toThrowError()
	}
})

// Fix projen marker not rendering
test.todo<TestContext>('renders sheBang and marker correctly', (ctx) => {
	const fileName = '.envrc'
	const dirEnv = new DirEnv(ctx.project, { fileName }).startBuild()
	const synth = Testing.synth(ctx.project)
	expect(synth[fileName]).toMatchInlineSnapshot(`
		"#!/usr/bin/env bash
		# undefined
		"
	`)
})

test<TestContext>('helper functions', (ctx) => {
	const fileName = '.envrc'
	const dirEnv = new DirEnv(ctx.project, { fileName })
		.startBuild()
		.addCommand(DirEnvStdLibCommand.DIRENV_VERSION, '2.32.1')
		.addBlankLine()
		.addLog(DirEnvLogType.INFO, 'Hello world')
		.addBlankLine()
		.addComment('Required Env Vars')
		.addEnvVar('DEBUG_COLORS', '1')
		.addEnvVar('API_KEY', '', { defaultValue: '' })
	const synth = Testing.synth(ctx.project)
	expect(synth[fileName]).toMatchInlineSnapshot(`
		"#!/usr/bin/env bash
		# undefined

		direnv_version 2.32.1

		log_status \\"Hello world\\"

		# Required Env Vars
		export DEBUG_COLORS=1
		export API_KEY=\\"\${API_KEY:-}\\""
	`)
})

test<TestContext>('renders default envrc template', (ctx) => {
	const fileName = '.envrc'
	const dirEnv = new DirEnv(ctx.project, { fileName })
		.buildDefaultEnvRc()
		.addComment('Required Env Vars')
		.addEnvVar('DEBUG_COLORS', '', { defaultValue: '1' })
	const synth = Testing.synth(ctx.project)
	expect(synth[fileName]).toMatchInlineSnapshot(`
		"#!/usr/bin/env bash
		# undefined

		# Team Shared direnv.
		# See: https://github.com/direnv/direnv

		# Enforces \`set -euo pipefail\` despite user local config.
		strict_env

		# forces \\"at least\\"
		direnv_version 2.32.1

		# User local additions.
		source_env_if_exists .envrc.local

		# Load rtx or asdf
		if has rtx; then
		  use rtx
		elif has asdf; then
		  log_status \\"rtx not found. Falling back to asdf.\\"
		  use asdf
		else
		  log_error \\"Neither rtx nor asdf are installed.\\"
		  log_error \\"For asdf: https://asdf-vm.com/\\"
		  log_error \\"For rtx (asdf clone in rust): https://github.com/jdxcode/rtx\\"
		fi

		layout node

		# Docker
		export COMPOSE_DOCKER_CLI_BUILD=1
		export DOCKER_BUILDKIT=1

		# Required Env Vars
		export DEBUG_COLORS=\\"\${DEBUG_COLORS:-1}\\""
	`)
})
