import { Component, type Project, TextFile } from 'projen'

export enum DirEnvLayout {
	/**
	 * NodeJS.
	 */
	NODE = 'node',
	/**
	 * Python.
	 */
	PYTHON = 'python',
}

export enum DirEnvUse {
	/**
	 * ASDF.
	 */
	ASDF = 'asdf',
	/**
	 * RTX.
	 */
	RTX = 'rtx',
}

/**
 * DirEnv commands available in .envrc context.
 * @see https://github.com/direnv/direnv/blob/master/stdlib.sh
 */
export enum DirEnvStdLibCommand {
	USE = 'use',
	LAYOUT = 'layout',
	STRICT_ENV = 'strict_env',
	UNSTRICT_ENV = 'unstrict_env',
	DIRENV_VERSION = 'direnv_version',
	SOURCE_ENV = 'source_env',
	SOURCE_ENV_IF_EXISTS = 'source_env_if_exists',
	LOG_STATUS = 'log_status',
	LOG_ERROR = 'log_error',
	JOIN_ARGS = 'join_args',
	EXPAND_PATH = 'expand_path',
	DOTENV = 'dotenv',
	DOTENV_IF_EXISTS = 'dotenv_if_exists',
	ENV_VARS_REQUIRED = 'env_vars_required',
}

export interface DirEnvOptions {
	/**
	 * File name.
	 */
	readonly fileName?: string
	/**
	 * File contents.
	 */
	readonly contents?: string[]
}

export class DirEnv extends Component {
	public static of(project: Project): DirEnv | undefined {
		const isDirenv = (c: Component): c is DirEnv => c instanceof DirEnv
		return project.components.find(isDirenv)
	}

	public readonly file: TextFile

	constructor(project: Project, public readonly options: DirEnvOptions = {}) {
		super(project)
		const { fileName = '.envrc', contents = [] } = options
		this.#validateFileName(fileName)
		this.file = new TextFile(project, fileName, {
			readonly: true,
			executable: true,
		})
	}

	#validateFileName(fileName: string) {
		const regex = new RegExp(/^\.envrc.*$/)
		if (!regex.test(fileName)) {
			throw new Error(`Invalid file name. Does not match ${regex.toString()}`)
		}
	}

	/**
	 * Add an environment variable.
	 * @param key
	 * @param value
	 */
	addEnvVar(key: string, value: string) {
		this.file.addLine(`export ${key}=${value}`)
		return this
	}

	/**
	 * Add an environment variable with a default value.
	 * Useful for adding sample environment variables.
	 * @param key
	 * @param value
	 */
	addEnvVarWithDefault(key: string, value = '') {
		this.file.addLine(`export ${key}="\${${key}:-${value}}"`)
		return this
	}

	/**
	 * Add a comment.
	 */
	addComment(comment: string) {
		this.file.addLine(`# ${comment}`)
		return this
	}

	/**
	 * Add a command.
	 */
	addCommand(command: string, indent = 0) {
		this.file.addLine(`${' '.repeat(indent)}${command}`)
		return this
	}

	/**
	 * Add a blank line.
	 */
	addBlankLine() {
		this.file.addLine('')
		return this
	}

	/**
	 * Add a shebang.
	 */
	addSheBang() {
		this.file.addLine('#!/usr/bin/env bash')
		return this
	}

	/**
	 * Add a direnv stdlib command.
	 * @param command
	 * @param args
	 */
	addStdLibCommand(command: DirEnvStdLibCommand, ...args: string[]) {
		this.file.addLine(`${command} ${args.join(' ')}`)
		return this
	}

	/**
	 * Add status or error log using direnv log_status or log_error helpers.
	 * @param type
	 * @param message
	 */
	addLog(type: 'status' | 'error', message: string) {
		const cmd =
			type === 'status'
				? DirEnvStdLibCommand.LOG_STATUS
				: DirEnvStdLibCommand.LOG_ERROR
		this.addStdLibCommand(cmd, message)
		return this
	}

	/**
	 * Add a use command.
	 * @param use
	 */
	addUse(use: DirEnvUse) {
		this.addStdLibCommand(DirEnvStdLibCommand.USE, use)
		return this
	}

	/**
	 * Add a layout command.
	 * @param layout
	 */
	addLayout(layout: DirEnvLayout) {
		this.addStdLibCommand(DirEnvStdLibCommand.LAYOUT, layout)
		return this
	}

	/**
	 * Add a source_env_if_exists command.
	 * @param fileName
	 */
	addSourceEnvIfExists(fileName: string) {
		this.addStdLibCommand(DirEnvStdLibCommand.SOURCE_ENV_IF_EXISTS, fileName)
		return this
	}

	/**
	 * Add a direnv_version command to force a minimum version.
	 * @param version
	 */
	addDirEnvVersion(version: string) {
		this.addComment(`forces "at least"`)
		this.file.addLine(`direnv_version ${version}`)
		return this
	}

	buildDefaultEnvRc() {
		this.addSheBang()
			.addBlankLine()
			.addComment('Team Shared direnv.')
			.addComment('See: https://github.com/direnv/direnv')
			.addBlankLine()
			.addComment('Enforces `set -euo pipefail` despite user local config.')
			.addStdLibCommand(DirEnvStdLibCommand.STRICT_ENV)
			.addBlankLine()
			.addComment('User local additions.')
			.addSourceEnvIfExists('.envrc.local')
			.addBlankLine()
			.addComment('Load rtx or asdf')
			.addCommand('if has rtx; then')
			.addCommand('use rtx', 2)
			.addCommand('elif has asdf; then')
			.addStdLibCommand(
				DirEnvStdLibCommand.LOG_STATUS,
				'rtx not found. Falling back to asdf.'
			)
			.addCommand('use asdf', 2)
			.addCommand('else')
			.addStdLibCommand(
				DirEnvStdLibCommand.LOG_ERROR,
				'Neither rtx nor asdf are installed.'
			)
			.addStdLibCommand(
				DirEnvStdLibCommand.LOG_ERROR,
				'For asdf: https://asdf-vm.com/'
			)
			.addStdLibCommand(
				DirEnvStdLibCommand.LOG_ERROR,
				'For rtx (asdf rust clone): https://github.com/jdxcode/rtx'
			)
			.addCommand('fi')
			.addBlankLine()
			.addLayout(DirEnvLayout.NODE)
			.addBlankLine()
			.addComment('Docker')
			.addEnvVar('COMPOSE_DOCKER_CLI_BUILD', '1')
			.addEnvVar('DOCKER_BUILDKIT', '1')
			.addBlankLine()
			.addComment('Misc')
			.addEnvVarWithDefault('DEBUG_COLORS', '1')
	}

	preSynthesize() {
		super.preSynthesize()
		this.buildDefaultEnvRc()
	}
}
