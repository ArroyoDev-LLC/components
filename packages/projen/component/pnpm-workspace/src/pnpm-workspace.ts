import path from 'node:path'
import { cwdRelativePath } from '@arroyodev-llc/utils.projen'
import { Component, type javascript, type Project, typescript } from 'projen'

/**
 * PNPM Workspace Helper component.
 */
export class PnpmWorkspace extends Component {
	public static of(project: Project): PnpmWorkspace | undefined {
		const isPnpmWorkspace = (c: Component): c is PnpmWorkspace =>
			c instanceof PnpmWorkspace
		return project.components.find(isPnpmWorkspace)
	}

	constructor(public readonly project: javascript.NodeProject) {
		super(project)
	}

	/**
	 * Format given dependency name with `workspace` protocol.
	 * @param dependencyName Name of requirement.
	 * @param constraint Optional constraint. Defaults to '*'
	 */
	formatWorkspaceProtocol(
		dependencyName: string,
		constraint: string = '*'
	): string {
		return [dependencyName, '@', 'workspace:', constraint].join('')
	}

	/**
	 * Add entry to `tsconfig.json` paths for given dependency.
	 * @param dependency Dependency to link too.
	 */
	addTsConfigPath(dependency: typescript.TypeScriptProject) {
		if (!(this.project instanceof typescript.TypeScriptProject)) return
		const tsPath = cwdRelativePath(
			this.project.outdir,
			path.join(path.join(dependency.outdir, dependency.srcdir), 'index')
		)
		const depNamePath = dependency.package.packageName.replaceAll('.', '\\.')
		this.project.tsconfig?.file?.addOverride?.(
			`compilerOptions.paths.${depNamePath}`,
			[tsPath]
		)
	}

	/**
	 * Add given dependency as runtime dep using `workspace` protocol.
	 * @param dependency Dependency to add.
	 */
	addWorkspaceDeps(...dependency: (javascript.NodeProject | string)[]) {
		dependency.forEach((dep) => {
			const depName = typeof dep === 'string' ? dep : dep.package.packageName
			this.project.addDeps(this.formatWorkspaceProtocol(depName))
			if (dep instanceof typescript.TypeScriptProject) {
				this.addTsConfigPath(dep)
			}
		})
	}

	/**
	 * Define pnpm patch.
	 * @param dependency Dependency name with version constraint.
	 * @param patchPath Path to patch file.
	 */
	addPatch(dependency: string, patchPath: string): this {
		this.project.package.file.addOverride('pnpm.patchedDependencies', {
			[dependency]: patchPath,
		})
		const ncuFile = this.project.tryFindObjectFile('.ncurc.json')
		if (ncuFile) {
			ncuFile.addToArray('reject', dependency.split('@')[0])
		}
		return this
	}
}
