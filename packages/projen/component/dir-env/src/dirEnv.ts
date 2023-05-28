import { Component, type Project, SourceCode } from 'projen'

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

export enum DirEnvLogType {
	INFO = DirEnvStdLibCommand.LOG_STATUS,
	ERROR = DirEnvStdLibCommand.LOG_ERROR,
}

export interface DirEnvOptions {
	/**
	 * File name.
	 */
	readonly fileName?: string
}

export class DirEnv extends Component {
	public static of(project: Project): DirEnv | undefined {
		const isDirEnv = (c: Component): c is DirEnv => c instanceof DirEnv
		return project.components.find(isDirEnv)
	}

	public readonly file: SourceCode

	constructor(project: Project, public readonly options: DirEnvOptions = {}) {
		super(project)
		const { fileName = '.envrc' } = options
		this.#validateFileName(fileName)
		this.file = new SourceCode(project, fileName, {
			readonly: true,
		})
	}

	#validateFileName(fileName: string) {
		const regex = new RegExp(/^\.(env|(envrc|envrc\..*))$/)
		if (!regex.test(fileName)) {
			throw new Error(`Invalid file name. Does not match ${regex.toString()}`)
		}
	}

	#addMarker() {
		this.addComment(this.file.marker as string)
		return this
	}

	#addLine(line: string) {
		this.file.line(line)
	}

	/**
	 * Open indentation
	 * @param line
	 */
	open(line?: string) {
		this.file.open(line)
		return this
	}

	/**
	 * Close indentation
	 * @param line
	 */
	close(line?: string) {
		this.file.close(line)
		return this
	}

	/**
	 * Add an environment variable.
	 * Optionally add a default value with options.
	 * Useful for adding sample environment variables.
	 * @param key
	 * @param value
	 * @param options
	 */
	addEnvVar(key: string, value: string, options?: { defaultValue: string }) {
		let line = `export ${key}=${value}`
		if (typeof options?.defaultValue === 'string') {
			line = `export ${key}="\${${key}:-${options.defaultValue}}"`
		}
		this.#addLine(line)
		return this
	}

	/**
	 * Add a comment.
	 */
	addComment(comment: string) {
		this.#addLine(`# ${comment}`)
		return this
	}

	/**
	 * Add a blank line.
	 */
	addBlankLine() {
		this.#addLine('\n')
		return this
	}

	/**
	 * Add a shebang.
	 */
	addSheBang() {
		this.#addLine('#!/usr/bin/env bash')
		return this
	}

	/**
	 * Add a command.
	 * @param command
	 * @param args
	 * @param block
	 */
	addCommand(
		command: DirEnvStdLibCommand | string,
		args?: string | string[],
		block?: () => this | void
	) {
		if (!args) {
			this.#addLine(`${command}`)
		} else {
			const content = Array.isArray(args) ? args.join(' ') : args
			this.#addLine(`${command} ${content}`)
		}
		if (block) {
			this.open()
			block()
			this.close()
		}
		return this
	}

	/**
	 * Add status or error log using direnv log_status or log_error helpers.
	 * @param type
	 * @param message
	 */
	addLog(type: DirEnvLogType, message: string) {
		this.addCommand(type, `"${message}"`)
		return this
	}

	/**
	 * Add a layout command.
	 * @param layout
	 */
	addLayout(layout: DirEnvLayout | string) {
		this.addCommand(DirEnvStdLibCommand.LAYOUT, layout)
		return this
	}

	/**
	 * Add a source_env_if_exists command.
	 * @param fileName
	 */
	addSourceEnvIfExists(fileName: string) {
		this.addCommand(DirEnvStdLibCommand.SOURCE_ENV_IF_EXISTS, fileName)
		return this
	}

	/**
	 * Default envrc template.
	 * Note: This method already calls `startBuild`
	 * You may extend this by calling chaining methods on this function.
	 *
	 * @param options
	 * @example
	 *
	 * ```ts
	 * const envrc = new DirEnv(this, { fileName: '.envrc' })
	 *   .buildDefaultEnvRc()
	 *   .addComment('Required Env Vars for this project')
	 *   .addEnvVar('NPM_TOKEN', '', { defaultValue: '' })
	 * ```
	 */
	buildDefaultEnvRc(options: {
		localEnvRc?: string
		minDirEnvVersion?: string
	}) {
		const { localEnvRc = '.envrc.local', minDirEnvVersion = '2.32.1' } = options
		this.startBuild()
			.addComment('Team Shared direnv.')
			.addComment('See: https://github.com/direnv/direnv')
			.addBlankLine()
			.addComment('Enforces `set -euo pipefail` despite user local config.')
			.addCommand(DirEnvStdLibCommand.STRICT_ENV)
			.addBlankLine()
			.addComment('forces "at least"')
			.addCommand(DirEnvStdLibCommand.DIRENV_VERSION, minDirEnvVersion)
			.addBlankLine()
			.addComment('User local additions.')
			.addSourceEnvIfExists(localEnvRc)
			.addBlankLine()
			.addComment('Load rtx or asdf')
			.addCommand('if has rtx; then', '', () => this.addCommand('use rtx'))
			.addCommand('elif has asdf; then', '', () =>
				this.addLog(
					DirEnvLogType.INFO,
					'rtx not found. Falling back to asdf.'
				).addCommand('use asdf')
			)
			.addCommand('else', '', () =>
				this.addLog(DirEnvLogType.ERROR, 'Neither rtx nor asdf are installed.')
					.addLog(DirEnvLogType.ERROR, 'For asdf: https://asdf-vm.com/')
					.addLog(
						DirEnvLogType.ERROR,
						'For rtx (asdf clone in rust): https://github.com/jdxcode/rtx'
					)
			)
			.addCommand('fi')
			.addBlankLine()
			.addLayout(DirEnvLayout.NODE)
			.addBlankLine()
			.addComment('Docker')
			.addEnvVar('COMPOSE_DOCKER_CLI_BUILD', '1')
			.addEnvVar('DOCKER_BUILDKIT', '1')
			.addBlankLine()
		return this
	}

	/**
	 * Start method chaining with this function.
	 */
	startBuild() {
		this.addSheBang().#addMarker().addBlankLine()
		return this
	}
}
