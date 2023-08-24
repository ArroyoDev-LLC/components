import { Component, type Project } from 'projen'
import { type NodeProject } from 'projen/lib/javascript'

/**
 * Valid git hooks.
 * Taken from simple-git-hooks
 * @see https://github.com/toplenboren/simple-git-hooks/blob/499a998df94238679bd61c3e2e539597d8f1edf2/simple-git-hooks.js#L4-L33
 */
export enum ValidGitHooks {
	ApplyPatchMsg = 'applypatch-msg',
	PreApplyPatch = 'pre-applypatch',
	PostApplyPatch = 'post-applypatch',
	PreCommit = 'pre-commit',
	PreMergeCommit = 'pre-merge-commit',
	PrepareCommitMsg = 'prepare-commit-msg',
	CommitMsg = 'commit-msg',
	PostCommit = 'post-commit',
	PreRebase = 'pre-rebase',
	PostCheckout = 'post-checkout',
	PostMerge = 'post-merge',
	PrePush = 'pre-push',
	PreReceive = 'pre-receive',
	Update = 'update',
	ProcReceive = 'proc-receive',
	PostReceive = 'post-receive',
	PostUpdate = 'post-update',
	ReferenceTransaction = 'reference-transaction',
	PushToCheckout = 'push-to-checkout',
	PreAutoGc = 'pre-auto-gc',
	PostRewrite = 'post-rewrite',
	SendemailValidate = 'sendemail-validate',
	FsmonitorWatchman = 'fsmonitor-watchman',
	P4Changelist = 'p4-changelist',
	P4PrepareChangelist = 'p4-prepare-changelist',
	P4PostChangelist = 'p4-post-changelist',
	P4PreSubmit = 'p4-pre-submit',
	PostIndexChange = 'post-index-change',
}

export interface GitHooksOptions {
	/**
	 * Git hooks to utilize.
	 */
	readonly hooks?: Partial<Record<ValidGitHooks, string>>
	/**
	 * Preserve all or list of unused hooks.
	 */
	readonly preserveUnused?: boolean | Array<ValidGitHooks>
}

export class GitHooks extends Component {
	public static of(project: Project): GitHooks | undefined {
		const isGitHooks = (o: Component): o is GitHooks => o instanceof GitHooks
		return project.components.find(isGitHooks)
	}

	readonly #hooks: Exclude<GitHooksOptions['hooks'], undefined>

	constructor(
		readonly project: NodeProject,
		readonly options: GitHooksOptions = {},
	) {
		super(project)
		this.#hooks = options.hooks ?? {}
		this.project.addDevDeps('simple-git-hooks')
	}

	/**
	 * Apply package manifest changes.
	 * @protected
	 */
	protected applyPackage(): this {
		this.project.package.addField('simple-git-hooks', {
			...this.#hooks,
			...(this.options.preserveUnused
				? { preserveUnused: this.options.preserveUnused }
				: {}),
		})
		const postInstall =
			this.project.tasks.tryFind('post-install') ??
			this.project.tasks.addTask('post-install', {
				description: 'Node post-install hook.',
			})
		postInstall.exec('simple-git-hooks', {
			name: 'Setup simple-git-hooks.',
			condition: 'test -z "$CI"',
		})
		return this
	}

	/**
	 * Add a git hook.
	 * @param hook Git hook to execute command on.
	 * @param command Command to execute.
	 */
	addGitHook(hook: ValidGitHooks, command: string) {
		this.#hooks[hook] = command
		return this
	}

	/**
	 * @inheritDoc
	 */
	preSynthesize() {
		super.preSynthesize()
		this.applyPackage()
	}
}
