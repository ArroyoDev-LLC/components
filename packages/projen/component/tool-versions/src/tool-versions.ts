import { Component, type Project, TextFile } from 'projen'

export interface ToolVersionsOptions {
	/**
	 * Record of asdf/rtx tools.
	 */
	readonly tools: Record<string, Array<string>>
}

/**
 * ASDF/RTX tool versions.
 */
export class ToolVersions extends Component {
	public static of(project: Project): ToolVersions | undefined {
		const isToolVersions = (c: Component): c is ToolVersions =>
			c instanceof ToolVersions
		return project.components.find(isToolVersions)
	}

	#tools: Map<string, Array<string>>
	public readonly file: TextFile

	constructor(
		project: Project,
		public readonly options: ToolVersionsOptions = { tools: {} }
	) {
		super(project)
		const { tools } = options
		this.#tools = new Map(Object.entries(tools))
		this.file = new TextFile(project, '.tool-versions', {
			readonly: true,
			marker: true,
		})
	}

	/**
	 * Retrieve versions for given tool name.
	 * @param toolName Name of tool.
	 */
	versionsOf(toolName: string): string[] {
		return this.#tools.get(toolName) ?? []
	}

	/**
	 * Remove all versions for tool.
	 * @param toolName Name of tool.
	 */
	removeTool(toolName: string): this {
		this.#tools.delete(toolName)
		return this
	}

	/**
	 * Overwrite versions for given tool.
	 * @param toolName Name of tool.
	 * @param versions Accepted versions.
	 */
	setVersions(toolName: string, versions: string[]): this {
		this.#tools.set(toolName, versions)
		return this
	}

	/**
	 * Concat additional versions for a given tool.
	 * @param toolName Name of tool.
	 * @param versions Additional versions.
	 */
	concatVersions(toolName: string, versions: string[]): this {
		const current = this.#tools.get(toolName) ?? []
		return this.setVersions(
			toolName,
			Array.from(new Set([...current, ...versions]))
		)
	}

	/**
	 * @inheritDoc
	 */
	preSynthesize() {
		super.preSynthesize()
		const entries = Array.from(this.#tools.entries())
		this.file.addLine(`# ${this.file.marker!}`)
		for (const [toolName, versions] of entries) {
			const line = `${toolName} ${versions.join(' ')}`
			this.file.addLine(line)
		}
	}
}
