import * as ghpipelines from 'cdk-pipelines-github'

export interface CheckoutProps {
	/**
	 * The version of the action to use.
	 * @default v3
	 */
	actionVersion?: string
	/**
	 * The name of the repository to checkout.
	 */
	repository?: string
	/**
	 * The branch, tag or SHA to checkout.
	 */
	ref?: string
	/**
	 * Path to write repository contents to.
	 */
	path?: string
}

/**
 * Checkout a repository.
 */
export class CheckoutStep extends ghpipelines.GitHubActionStep {
	constructor(id: string, props: CheckoutProps) {
		const { actionVersion = 'v4', ...withProps } = props
		const name = withProps?.repository
			? 'Checkout'
			: `Checkout ${withProps.repository!}`
		const actionWith = Object.keys(withProps).length ? { with: withProps } : {}
		const actionUses = `actions/checkout@${actionVersion}`
		super(id, {
			jobSteps: [
				{
					name,
					uses: actionUses,
					...actionWith,
				},
			],
		})
	}
}
