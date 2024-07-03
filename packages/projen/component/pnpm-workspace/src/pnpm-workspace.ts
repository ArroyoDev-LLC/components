import path from 'node:path'
import { cwdRelativePath } from '@arroyodev-llc/utils.projen'
import {
	Component,
	DependencyType,
	javascript,
	JsonPatch,
	type Project,
	typescript,
} from 'projen'

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
		constraint: string = '*',
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
			path.join(path.join(dependency.outdir, dependency.srcdir), 'index'),
		)
		const depNamePath = dependency.package.packageName.replaceAll('.', '\\.')
		this.project.tsconfig?.file?.addOverride?.(
			`compilerOptions.paths.${depNamePath}`,
			[tsPath],
		)
	}

	/**
	 * Add given dependency as runtime dep using `workspace` protocol.
	 * @param dependency Dependency to add.
	 */
	addWorkspaceDeps(
		...dependency: [
			options:
				| { depType: DependencyType; addTsPath: boolean }
				| (javascript.NodeProject | string),
			...deps: (javascript.NodeProject | string)[],
		]
	) {
		// TODO: nuke this
		const opts =
			typeof dependency[0] !== 'string' &&
			!(dependency[0] instanceof javascript.NodeProject)
				? (dependency.shift()! as {
						depType: DependencyType
						addTsPath: boolean
					})
				: { depType: DependencyType.RUNTIME, addTsPath: true }
		;(dependency as (javascript.NodeProject | string)[]).forEach((dep) => {
			const depName =
				typeof dep === 'string'
					? dep
					: this.formatWorkspaceProtocol(dep.package.packageName)
			this.project.deps.addDependency(depName, opts.depType)
			if (dep instanceof typescript.TypeScriptProject && opts.addTsPath) {
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
		const escapedName = dependency.replaceAll('.', '\\.')
		this.project.package.file.addOverride(
			`pnpm.patchedDependencies.${escapedName}`,
			patchPath,
		)
		const ncuFile = this.project.tryFindObjectFile('.ncurc.json')
		if (ncuFile) {
			ncuFile.patch(
				JsonPatch.add(
					'/reject/-',
					dependency.slice(0, dependency.lastIndexOf('@')),
				),
			)
		}
		return this
	}
}
