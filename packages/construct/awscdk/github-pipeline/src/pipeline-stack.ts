import path from 'node:path'
import * as cdkpipelines from 'aws-cdk-lib/pipelines'
import * as ghpipelines from 'cdk-pipelines-github'
import type { Construct } from 'constructs'
import defu from 'defu'
import { CheckoutStep, type CheckoutProps } from './checkout'
import { S3BucketStep, type S3ObjectRef } from './s3.ts'
import {
	ActionsContext,
	GithubWorkflowPipeline,
	interpolateValue,
	type PipelineBuildProps,
	type PipelineWorkflowProps,
	type WorkflowPatcher,
} from './workflow.ts'

interface SynthTarget {
	/**
	 * The name of the package to build.
	 */
	packageName: string
	/**
	 * The working directory for the package.
	 */
	workingDirectory: string
	/**
	 * The command to run to build the package.
	 * @default pnpm -F '${packageName}' run synth:silent
	 */
	command?: string
	/**
	 * Github environment to use for synth stage.
	 */
	environment?: ghpipelines.GitHubEnvironment
	/**
	 * Step-level environment variables.
	 */
	commandEnv?: Record<string, string>
}

interface GithubCodePipelineCreateProps extends PipelineBuildProps {
	/**
	 * The name of the workflow.
	 */
	workflowName: string
	/**
	 * Name of secret to use for OIDC account ID.
	 * @default AWS_PIPELINE_ACCOUNT_ID
	 */
	oidcAccountIdSecret?: string
	/**
	 * Name of OIDC role to assume.
	 * @default GitHubActionRole
	 */
	oidcRoleName?: string
}

interface PipelineStep extends ghpipelines.JobStep {
	/**
	 * Working directory to use.
	 */
	workingDirectory?: string
}

/**
 * Builder for a GitHub CodePipeline.
 */
export class GithubCodePipeline {
	/**
	 * Create a new pipeline.
	 * @param createProps initial props.
	 */
	static create(createProps: GithubCodePipelineCreateProps) {
		const { oidcAccountIdSecret, oidcRoleName, ...props } = createProps
		const pipeline = new this(props, {
			env: {
				CI: 'true',
			},
		})
		if (!oidcAccountIdSecret || !oidcRoleName) return pipeline
		const credsProvider = pipeline.buildCredentialsProvider(
			oidcAccountIdSecret,
			oidcRoleName,
		)
		return pipeline.clone({ awsCreds: credsProvider })
	}

	protected constructor(
		public props: Partial<PipelineWorkflowProps>,
		readonly synthProps: Partial<cdkpipelines.ShellStepProps>,
	) {
		const credsProvider = this.props.awsCreds ?? this.buildCredentialsProvider()
		this.props = { ...this.props, awsCreds: credsProvider }
	}

	/**
	 * Create a new pipeline with the given props merged with existing props.
	 *
	 * @remarks
	 * This does not mutate the existing pipeline and returns a new instance.
	 *
	 * @param newProps The new props to merge.
	 * @param synthProps The new synth props to merge.
	 */
	clone(
		newProps?: Partial<PipelineWorkflowProps>,
		synthProps?: Partial<cdkpipelines.ShellStepProps>,
	): GithubCodePipeline {
		const mergedProps = defu(newProps ?? {}, this.props)
		const mergedSynthProps = defu(synthProps ?? {}, this.synthProps)
		return new GithubCodePipeline(mergedProps, mergedSynthProps)
	}

	/**
	 * Build a credentials provider for the pipeline.
	 * @param accountIdSecretName The name of the secret containing the account ID. Defaults to `AWS_PIPELINE_ACCOUNT_ID`.
	 * @param roleName The name of the role to assume. Defaults to `GitHubActionRole`.
	 */
	buildCredentialsProvider(accountIdSecretName?: string, roleName?: string) {
		const pipeAccountId = interpolateValue(
			ActionsContext.SECRET,
			accountIdSecretName ?? 'AWS_PIPELINE_ACCOUNT_ID',
		)
		const roleArn = `arn:aws:iam::${pipeAccountId}:role/${
			roleName ?? 'GitHubActionRole'
		}`
		return ghpipelines.AwsCredentials.fromOpenIdConnect({
			gitHubActionRoleArn: roleArn,
			roleSessionName: this.workflowSlug,
		})
	}

	/**
	 * Add environment variables to the synth step.
	 * @param env The environment variables to add.
	 */
	addSynthEnv(env: Record<string, string>) {
		return this.clone(undefined, { env })
	}

	/**
	 * Set up the synth step for use with NX.
	 *
	 * @param accessTokenSecret The name of the secret containing the access token. Defaults to `NX_CLOUD_ACCESS_TOKEN`.
	 */
	addNxEnv(accessTokenSecret?: string) {
		return this.addSynthEnv({
			NX_NON_NATIVE_HASHER: 'true',
			NX_BRANCH: interpolateValue(ActionsContext.GITHUB, 'event.number'),
			NX_RUN_GROUP: interpolateValue(ActionsContext.GITHUB, 'run_id'),
			NX_CLOUD_ACCESS_TOKEN: interpolateValue(
				ActionsContext.SECRET,
				accessTokenSecret ?? 'NX_CLOUD_ACCESS_TOKEN',
			),
		})
	}

	/**
	 * Setup synth step access to external configs repository.
	 * @param secretName Name of secret containing read-only PAT for configs repository. Defaults to `GH_CONFIGS_RO_PAT`.
	 */
	addConfigsEnv(secretName?: string) {
		return this.clone(undefined, {
			env: {
				GIGET_AUTH: interpolateValue(
					ActionsContext.SECRET,
					secretName ?? 'GH_CONFIGS_RO_PAT',
				),
			},
		})
	}

	/**
	 * Slug for workflow created from {@link PipelineBuildProps.workflowName}.
	 */
	get workflowSlug(): string {
		return this.props
			.workflowName!.replaceAll(/[^a-zA-Z0-9]/g, '-')
			.toLowerCase()
	}

	/**
	 * File path for workflow.
	 */
	get workflowPath(): string {
		const workflowFileName = `${this.workflowSlug}.yml`
		return path.join(
			this.props.rootDir!,
			'.github',
			'workflows',
			this.props.workflowPath ?? workflowFileName,
		)
	}

	/**
	 * Prefix path for assets s3 target.
	 */
	get assetsKeyPrefix(): string {
		return ['cdk-assets', this.props.assetsS3Prefix ?? this.workflowSlug].join(
			'/',
		)
	}

	/**
	 * Build an S3 reference for the given key.
	 * @param key The key to build a reference for.
	 */
	buildS3Ref(key: string): S3ObjectRef {
		return {
			bucketName: this.props.assetsS3Bucket!,
			key,
			prefix: this.assetsKeyPrefix,
		}
	}

	/**
	 * Add pre-build step(s) to the synth step.
	 * @param step The step(s) to add.
	 */
	synthPreStep(...step: PipelineStep[]) {
		return this.clone({
			preBuildSteps: step,
		})
	}

	/**
	 * Add post-build step(s) to the synth step.
	 * @param step The step(s) to add.
	 */
	synthPostStep(...step: PipelineStep[]) {
		return this.clone({
			postBuildSteps: step,
		})
	}

	/**
	 * Add patch callback.
	 * @param patcher factory for creating patches.
	 */
	patch(patcher: WorkflowPatcher) {
		return this.clone({
			patchers: [patcher],
		})
	}

	/**
	 * Add patcher for synth job.
	 * @param patcher - patcher factory to apply.
	 */
	synthJobPatch(patcher: WorkflowPatcher) {
		function synthPatcher(
			this: GithubWorkflowPipeline,
			key: string,
			value: string | number,
		) {
			const isSynthJob =
				key.startsWith('jobs/build-') &&
				key.endsWith('-synth/name') &&
				value === 'Synthesize'
			if (!isSynthJob) return undefined
			return patcher.bind(this)(key, value)
		}
		return this.patch(synthPatcher)
	}

	/**
	 * Add pre-publish step(s) to the publish step.
	 * @param step The step(s) to add.
	 */
	publishPreStep(...step: ghpipelines.JobStep[]) {
		return this.clone({
			prePublishSteps: step,
		})
	}

	/**
	 * Add post-publish step(s) to the publish step.
	 * @param step The step(s) to add.
	 */
	publishPostStep(...step: ghpipelines.JobStep[]) {
		return this.clone({
			postPublishSteps: step,
		})
	}

	/**
	 * Add a checkout step before synth build.
	 *
	 * @remarks
	 * This is a convenience method for adding a {@link CheckoutStep} via {@link synthPreStep}.
	 * A checkout step already exists for the current repository,
	 * so this is only necessary if you need to check out a different repository.
	 *
	 * @param props The props for the checkout step.
	 */
	synthCheckout(props: CheckoutProps) {
		const action = new CheckoutStep('Checkout', props)
		return this.synthPreStep(...action.jobSteps)
	}

	/**
	 * Install Helm.
	 * @param toolVersion The version of Helm to install.
	 */
	installHelm(toolVersion?: string) {
		return this.synthPreStep({
			name: 'Install Helm',
			uses: 'azure/setup-helm@v3',
			with: {
				version: toolVersion ?? process.env.TOOLS_HELM_VERSION ?? '3.12.2',
			},
		})
	}

	/**
	 * Install AWS CLI.
	 * @param toolVersion The version of AWS CLI to install.
	 */
	installAwsCli(toolVersion?: string) {
		const step: ghpipelines.JobStep = {
			name: 'Install AWS CLI',
			uses: 'unfor19/install-aws-cli-action@v1',
			if: `runner.arch == 'ARM64' && (inputs.runner && !contains(inputs.runner, 'ubuntu'))`,
			with: {
				arch: 'arm64',
				version: toolVersion ?? process.env.TOOLS_AWSCLI_VERSION ?? '2',
			},
		}
		return this.synthPreStep(step).publishPreStep(step)
	}

	/**
	 * Setup NodeJS
	 * @param nodeVersion The version of NodeJS to install.
	 * @param cache The version of NodeJS to install.
	 */
	installNode(nodeVersion?: string, cache?: string) {
		const step: ghpipelines.JobStep = {
			name: 'Setup Node',
			uses: 'actions/setup-node@v3',
			with: {
				'node-version': nodeVersion ?? '18',
			},
		}
		return this.publishPreStep({
			...step,
			if: `inputs.runner && !contains(inputs.runner, 'ubuntu')`,
		}).synthPreStep({
			...step,
			with: {
				...step.with,
				...(cache ? { cache } : {}),
			},
		})
	}

	/**
	 * Setup PNPM.
	 * @param pnpmVersion The version of PNPM to install.
	 */
	installPnpm(pnpmVersion?: string) {
		return this.synthPreStep({
			name: 'Setup PNPM',
			uses: 'pnpm/action-setup@v2.4.0',
			// defaults to 'packageManager' field in package.json
			...(pnpmVersion ? { with: { version: pnpmVersion } } : {}),
		})
	}

	/**
	 * Install SOPs.
	 * @param toolVersion The version of SOPs to install.
	 */
	installSops(toolVersion?: string) {
		return this.synthPreStep({
			name: 'Install SOPs',
			uses: 'CrisisCleanup/mozilla-sops-action@main',
			with: {
				version: toolVersion ?? process.env.TOOLS_SOPS_VERSION ?? '3.7.3',
			},
		})
	}

	/**
	 * Install default tools.
	 */
	defaultTools() {
		return this.installHelm()
			.installAwsCli()
			.installSops()
			.installNode(undefined, 'pnpm')
			.installPnpm()
	}

	/**
	 * Add a synth target to the pipeline.
	 *
	 * @remarks
	 * This will add any additional steps for pulling/pushing
	 * context and assets to/from S3.
	 *
	 * @param target The target to add.
	 */
	synthTarget(target: SynthTarget) {
		const { packageName, command, environment, commandEnv } = target
		const synthCommand = command ?? `pnpm -F '${packageName}' run synth:silent`
		const cdkContextRef = this.buildS3Ref('cdk.context.json')
		const pullContextStep = new S3BucketStep('Pull Context', {
			source: cdkContextRef,
			destination: path.join(target.workingDirectory, 'cdk.context.json'),
			action: 'copy',
			stepProps: {
				// in case context doesn't exist
				continueOnError: true,
			},
		})

		const pushContextStep = pullContextStep.flipDirection()

		const cdkOut = path.join(target.workingDirectory, 'cdk.out')

		let pipeline = this.synthPreStep(
			...this.props.awsCreds!.credentialSteps('us-east-1'),
			...pullContextStep.jobSteps,
		)
			.synthPostStep(...pushContextStep.jobSteps)
			.clone(undefined, {
				installCommands: ['pnpm install'],
				commands: ['pnpm build', synthCommand, `cp -r ${cdkOut} ./cdk.out`],
			})
		if (environment) {
			pipeline = pipeline.synthJobPatch((key) => {
				const environmentKey = '/' + key.replace('/name', '/environment')
				return ghpipelines.JsonPatch.add(environmentKey, environment)
			})
		}
		if (commandEnv) {
			pipeline = pipeline.patch((key, value) => {
				const isSynthBuild =
					key.startsWith('jobs/build-') &&
					key.endsWith('/name') &&
					value === 'Build'
				if (!isSynthBuild) return undefined
				const envKey = '/' + key.replace('/name', '/env')
				return ghpipelines.JsonPatch.add(envKey, commandEnv)
			})
		}
		return pipeline
	}

	/**
	 * Build the synth step.
	 * @param id The ID for the synth step.
	 */
	buildSynth(id?: string) {
		const props = this.synthProps as cdkpipelines.ShellStepProps
		const stepId = (id ?? this.workflowSlug) + `-synth`
		return new cdkpipelines.ShellStep(stepId, props)
	}

	/**
	 * Build a {@link GithubWorkflowPipeline} instance.
	 * @param scope The scope for the pipeline.
	 * @param id The ID for the pipeline.
	 */
	build(scope: Construct, id?: string): GithubWorkflowPipeline {
		const flowId = id ?? this.workflowSlug
		const synth = this.buildSynth(flowId)
		const props = this.props as PipelineWorkflowProps
		return new GithubWorkflowPipeline(scope, flowId, {
			workflowPath: this.workflowPath,
			publishAssetsAuthRegion: 'us-east-1',
			...props,
			synth,
			assetsS3Prefix: this.assetsKeyPrefix,
		})
	}
}
