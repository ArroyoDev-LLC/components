import * as ghpipelines from 'cdk-pipelines-github'
import { type Construct } from 'constructs'
import flat from 'flat'

export enum ActionsContext {
	GITHUB = 'github',
	SECRET = 'secrets',
	ENV = 'env',
	INPUTS = 'inputs',
	INTERPOLATE = 'interpolate',
}

export interface ActionsContextValue {
	context: ActionsContext
	key: string
}

export interface ActionsWorkflowCallInput {
	type: 'boolean' | 'number' | 'string'
	description?: string
	required?: boolean
	default?: string | number | boolean
}

export interface ActionsWorkflowDispatchInput
	extends Omit<ActionsWorkflowCallInput, 'type'> {
	type: ActionsWorkflowCallInput['type'] | 'choice' | 'environment'
	options?: string[]
}

/**
 * Interpolate a value for use in a workflow file.
 * @param value ActionsContextValue
 */
export function interpolateValue(value: ActionsContextValue): string
export function interpolateValue(context: ActionsContext, key: string): string
export function interpolateValue(
	...args: [ActionsContextValue] | [ActionsContext, string]
): string {
	let [context, key] = args
	if (typeof context === 'object') {
		key = context.key
		context = context.context
	}
	const wrap = (inner: string) => '${{' + inner + '}}'
	if (context === ActionsContext.INTERPOLATE) {
		return wrap(key as string)
	}
	const body = [context, key].join('.')
	return wrap(body)
}

/**
 * Mask given values from workflow logs.
 */
export class MaskValueStep extends ghpipelines.GitHubActionStep {
	/**
	 * Create job steps from given values.
	 * @param id Step id.
	 * @param values Values to mask.
	 */
	static values(
		id: string,
		...values: [context: ActionsContext, key: string][]
	): MaskValueStep {
		return new this(
			id,
			values.map(([context, key]) => ({ context, key })),
		)
	}

	constructor(
		id: string,
		values: ActionsContextValue[],
		props?: Omit<ghpipelines.GitHubActionStepProps, 'jobSteps'>,
	) {
		const mask = (value: string) => `echo ::add-mask::${value}`
		const steps: ghpipelines.JobStep[] = [
			{
				name: 'Mask values',
				run: values.map((value) => mask(interpolateValue(value))).join('\n'),
			},
		]
		super(id, {
			...(props ?? {}),
			jobSteps: steps,
		})
	}
}

interface PipelineWorkflowProps extends ghpipelines.GitHubWorkflowProps {
	assetsS3Bucket: string
	assetsS3Prefix: string
}

export class GithubWorkflowPipeline extends ghpipelines.GitHubWorkflow {
	constructor(
		scope: Construct,
		id: string,
		readonly props: PipelineWorkflowProps,
	) {
		super(scope, id, props)
	}

	getStageAccountIds(): Record<string, string> {
		const accountIds = this.waves.reduce(
			(acc, wave) => [
				...acc,
				...wave.stages.map(
					(stage) =>
						[stage.stacks[0].account!, stage.stageName] as [string, string],
				),
			],
			[] as [string, string][],
		)

		return Object.fromEntries(accountIds)
	}

	/**
	 * @inheritDoc
	 */
	protected doBuildPipeline() {
		super.doBuildPipeline()
		const patches = Array.from(this.iterPatches())
		this.workflowFile.patch(...patches)
		this.workflowFile.writeFile()
	}

	buildAssetsS3Path(): string {
		const assetsRun = [
			interpolateValue(ActionsContext.GITHUB, 'run_id'),
			interpolateValue(ActionsContext.GITHUB, 'run_attempt'),
		].join('-')
		return [
			`s3://${this.props.assetsS3Bucket}`,
			this.props.assetsS3Prefix!,
			assetsRun,
			'cdk.out',
		].join('/')
	}

	buildAssetsSync(
		target: string,
		direction: 'pull' | 'push',
	): ghpipelines.JobStep[] {
		const s3Path = this.buildAssetsS3Path()
		const source = direction === 'pull' ? s3Path : target
		const dest = direction === 'pull' ? target : s3Path
		const stageAccountIds = this.getStageAccountIds()
		const maskValues: [ActionsContext, string][] = Object.values(
			stageAccountIds,
		).map((envName) => [
			ActionsContext.SECRET,
			`AWS_ACCOUNT_ID_${envName.toUpperCase()}`,
		])
		const maskStep = MaskValueStep.values('Mask IDs', ...maskValues, [
			ActionsContext.SECRET,
			'AWS_PIPELINE_ACCOUNT_ID',
		])
		const maskRun = maskStep.jobSteps[0].run!
		return [
			{
				name: `${
					direction.charAt(0).toUpperCase() + direction.slice(1)
				} assets`,
				env: {
					SOURCE: source,
					DESTINATION: dest,
				},
				run: [maskRun, 'aws s3 sync $SOURCE $DESTINATION'].join('\n'),
			},
		]
	}

	protected stepsToSyncAssemblyPatch(key: string, value: string | number) {
		const isUpload = String(value).startsWith('actions/upload-artifact')
		const isDownload = String(value).startsWith('actions/download-artifact')
		if (!isUpload && !isDownload) return
		const direction = isUpload ? 'push' : 'pull'
		// drop the '/uses'
		const targetKey = '/' + key.split('/').slice(0, -1).join('/')
		const newStep = this.buildAssetsSync('cdk.out', direction)
		return ghpipelines.JsonPatch.replace(targetKey, newStep[0])
	}

	protected moveAssetAuthenticationPatch(key: string, value: string | number) {
		// move asset authenticate step to start of job
		const isAssetsJob = key.startsWith('jobs/Assets-')
		const isUsesKey = key.endsWith('uses')
		const isUsesConfigure = String(value).startsWith('aws-actions/configure')
		const isTarget = isAssetsJob && isUsesKey && isUsesConfigure
		if (!isTarget) return
		// '/jobs/Assets-FileAsset5/2' -> '/jobs/Assets-FileAsset5/0'
		const fromKey = `/${key.split('/uses')[0]}`
		const toKey = fromKey.split('/').slice(0, -1).join('/') + '/0'
		return ghpipelines.JsonPatch.move(fromKey, toKey)
	}

	protected maskAccountIdPatch(key: string, value: string | number) {
		const stageAccountIds = this.getStageAccountIds()
		const accountIds = Object.keys(stageAccountIds)
		const aidFound = accountIds.find((aid) => String(value).includes(aid))
		if (!aidFound) return
		// mask account ids
		const envName = stageAccountIds[aidFound]
		const inter = interpolateValue(
			ActionsContext.SECRET,
			`AWS_ACCOUNT_ID_${envName.toUpperCase()}`,
		)
		const newValue = String(value).replaceAll(aidFound, inter)
		return ghpipelines.JsonPatch.replace(`/${key}`, newValue)
	}

	protected runnerPatch(key: string, _: string | number) {
		const isRunsOn = key.endsWith('runs-on')
		const isAssetJob = key.startsWith('jobs/Assets-')
		const isTarget = isRunsOn && !isAssetJob
		// always use ubuntu-latest for asset jobs
		if (!isTarget) return
		return ghpipelines.JsonPatch.replace(
			`/${key}`,
			interpolateValue(
				ActionsContext.INTERPOLATE,
				`inputs.runner || 'ubuntu-latest'`,
			),
		)
	}

	protected checkoutPatch(key: string, value: string | number) {
		const isUses = key.endsWith('uses')
		const isCheckoutAction = String(value).startsWith('actions/checkout')
		const isTarget = isUses && isCheckoutAction
		if (!isTarget) return
		// only update actions that do not have explicit parameters already set.
		const keyParts = key.split('/')
		const jobName = keyParts[1]
		const stepIdx = keyParts[3]
		const stepValue = this.workflowObj.jobs[jobName].steps[parseInt(stepIdx)]
		if (stepValue.with && 'repository' in stepValue.with) return

		const stepKey = '/' + key.split('/').slice(0, -1).join('/')
		return ghpipelines.JsonPatch.replace(stepKey, {
			name: 'Checkout',
			uses: value,
			with: {
				// for use with workflow_call event.
				repository: 'CrisisCleanup/infrastructure',
				ref: 'main',
			},
		})
	}

	get workflowObj(): GithubWorkflowModel {
		// @ts-expect-error - private property
		return Object.assign({}, this.workflowFile.obj) as GithubWorkflowModel
	}

	protected *iterPatches() {
		const flatWorkflow: Record<string, string | number> = flat.flatten(
			this.workflowObj,
			{ delimiter: '/' },
		)
		for (const [key, value] of Object.entries(flatWorkflow)) {
			const patches: ghpipelines.JsonPatch[] = [
				this.runnerPatch(key, value),
				this.checkoutPatch(key, value),
				this.stepsToSyncAssemblyPatch(key, value),
				this.moveAssetAuthenticationPatch(key, value),
				this.maskAccountIdPatch(key, value),
			].filter(Boolean) as ghpipelines.JsonPatch[]
			yield* patches
		}
	}

	onWorkflowCall(inputs: Record<string, ActionsWorkflowCallInput>): this {
		const patch = ghpipelines.JsonPatch.add('/on/workflow_call', {
			inputs,
		})
		this.workflowFile.patch(patch)
		return this
	}

	onWorkflowDispatch(
		inputs: Record<string, ActionsWorkflowDispatchInput>,
	): this {
		const patch = ghpipelines.JsonPatch.add('/on/workflow_dispatch', {
			inputs,
		})
		this.workflowFile.patch(patch)
		return this
	}
}
