import { Component, github, type Project } from 'projen'
import { secretToString } from 'projen/lib/github/util'

export interface TypeDocGithubPagesOptions {
	readonly workflowName: string
}

/**
 * GitHub Workflow for deploying typedoc docs to GitHub pages.
 */
export class TypeDocGithubPages extends Component {
	readonly workflow: github.GithubWorkflow
	readonly gh: github.GitHub

	constructor(
		project: Project,
		public readonly options: TypeDocGithubPagesOptions = {
			workflowName: 'static',
		},
	) {
		super(project)

		this.gh = github.GitHub.of(this.project)!
		this.workflow = this.buildWorkflow()
		this.setActions().buildJob()
		// don't commit generated docs since workflow handles it.
		this.project.gitignore.addPatterns('docs/**')
	}

	/**
	 * Set default actions in provider.
	 * @protected
	 */
	protected setActions(): this {
		// TODO: look into actions for setup steps
		const setDefault = (action: string, version: string) => {
			const current = this.gh.actions.get(action)
			if (!current || !current.includes('@')) {
				this.gh.actions.set(action, `${action}@${version}`)
			}
		}
		const defaults = {
			'actions/checkout': 'v3',
			'actions/configure-pages': 'v3',
			'actions/upload-pages-artifact': 'v1',
			'actions/deploy-pages': 'v2',
			'pnpm/action-setup': 'v2.2.4',
			'actions/setup-node': 'v3',
		}
		Object.entries(defaults).forEach(([name, version]) =>
			setDefault(name, version),
		)
		return this
	}

	/**
	 * Build deploy workflow.
	 * @protected
	 */
	protected buildWorkflow(): github.GithubWorkflow {
		const workflow = new github.GithubWorkflow(
			this.gh,
			this.options.workflowName,
			{
				concurrency: 'pages',
			},
		)
		workflow.on({
			push: { branches: ['main'] },
			workflowDispatch: {},
		})
		workflow.file!.addOverride(
			'env.NPM_TOKEN',
			secretToString('NPM_AUTH_TOKEN'),
		)
		return workflow
	}

	/**
	 * Build deploy job.
	 * @protected
	 */
	protected buildJob(): this {
		const steps: github.workflows.JobStep[] = [
			{
				name: 'Checkout',
				uses: this.gh.actions.get('actions/checkout'),
			},
			// TODO: look into actions for setup steps
			{
				name: 'Setup PNPM',
				uses: this.gh.actions.get('pnpm/action-setup'),
			},
			{
				name: 'Setup Node',
				uses: this.gh.actions.get('actions/setup-node'),
				with: {
					'node-version': '18',
					cache: 'pnpm',
				},
			},
			{
				name: 'Install Dependencies',
				run: 'pnpm install --no-frozen-lockfile',
			},
			{
				name: 'Build',
				run: 'pnpm build',
			},
			{
				name: 'Setup Pages',
				uses: this.gh.actions.get('actions/configure-pages'),
			},
			{
				name: 'Generate Docs',
				run: 'pnpm docgen',
			},
			{
				name: 'Upload artifact',
				uses: this.gh.actions.get('actions/upload-pages-artifact'),
				with: {
					path: 'docs',
				},
			},
			{
				name: 'Deploy to Github Pages',
				id: 'deployment',
				uses: this.gh.actions.get('actions/deploy-pages'),
			},
		]
		this.workflow.addJob('deploy', {
			name: 'deploy',
			runsOn: ['ubuntu-latest'],
			permissions: {
				contents: github.workflows.JobPermission.READ,
				pages: github.workflows.JobPermission.WRITE,
				idToken: github.workflows.JobPermission.WRITE,
			},
			environment: {
				name: 'github-pages',
				url: '${{ steps.deployment.outputs.page_url }}',
			},
			steps,
		})
		return this
	}
}
