import fs from 'node:fs'
import path from 'node:path'
import { Stack, Stage } from 'aws-cdk-lib'
import type * as cdkpipelines from 'aws-cdk-lib/pipelines'
import type { AddGitHubStageOptions } from 'cdk-pipelines-github'
import * as ghpipelines from 'cdk-pipelines-github'
import { type Construct } from 'constructs'
import flat from 'flat'
import { S3BucketStep } from './s3.ts'
import { snakeCaseKeys } from './util'

/**
 * Github Actions Contexts.
 */
export enum ActionsContext {
	GITHUB = 'github',
	SECRET = 'secrets',
	ENV = 'env',
	INPUTS = 'inputs',
	MATRIX = 'matrix',
	INTERPOLATE = 'interpolate',
}

/**
 * Actions context value for interpolation.
 */
export interface ActionsContextValue {
	context: ActionsContext
	key: string
}

/**
 * Github Actions Workflow Call Input.
 */
export interface ActionsWorkflowCallInput {
	type: 'boolean' | 'number' | 'string'
	description?: string
	required?: boolean
	default?: string | number | boolean
}

/**
 * Github Actions Workflow Dispatch Input.
 */
export interface ActionsWorkflowDispatchInput
	extends Omit<ActionsWorkflowCallInput, 'type'> {
	type: ActionsWorkflowCallInput['type'] | 'choice' | 'environment'
	options?: string[]
}

/**
 * Workflow concurrency options.
 */
export interface WorkflowConcurrency {
	group: string
	cancelInProgress?: boolean
}

/**
 * Github Actions workflow file model.
 */
export interface GithubWorkflowModel {
	[key: string]: unknown
	jobs: Record<string, ghpipelines.Job>
	concurrency?: WorkflowConcurrency
}

interface WorkflowPatcher {
	(key: string, value: string | number): ghpipelines.JsonPatch | undefined
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

export interface PipelineBuildProps {
	/**
	 * Bucket to use to store assets.
	 */
	assetsS3Bucket: string
	/**
	 * Key prefix to store any assets under.
	 */
	assetsS3Prefix?: string
	/**
	 * Project root directory.
	 */
	rootDir: string
	/**
	 * Steps to execute prior to assets publish.
	 */
	prePublishSteps?: ghpipelines.JobStep[]
	/**
	 * Steps to execute post assets publish.
	 */
	postPublishSteps?: ghpipelines.JobStep[]
}

export interface PipelineWorkflowProps
	extends ghpipelines.GitHubWorkflowProps,
		Omit<PipelineBuildProps, 'rootDir'> {
	rootDir?: string
}

export class GithubWorkflowPipeline extends ghpipelines.GitHubWorkflow {
	#stageAccounts: Map<string, string>
	#workflowAccounts: Record<string, string> | undefined = undefined

	constructor(
		scope: Construct,
		id: string,
		readonly props: PipelineWorkflowProps,
	) {
		super(scope, id, props)
		this.#stageAccounts = new Map()
		if (Stack.isStack(scope)) {
			this.#stageAccounts.set(scope.account, 'pipeline')
		}
	}

	/**
	 * @inheritDoc
	 */
	addStage(
		stage: Stage,
		options?: cdkpipelines.AddStageOpts,
	): cdkpipelines.StageDeployment {
		if (stage.account) {
			this.#stageAccounts.set(stage.account, stage.stageName)
		}
		return super.addStage(stage, options)
	}

	/**
	 * @inheritDoc
	 */
	addStageWithGitHubOptions(
		stage: Stage,
		options?: AddGitHubStageOptions,
	): cdkpipelines.StageDeployment {
		if (stage.account) {
			this.#stageAccounts.set(stage.account, stage.stageName)
		}
		return super.addStageWithGitHubOptions(stage, options)
	}

	/**
	 * Get a map of account ids to stage names.
	 */
	getStageAccountIds(): Record<string, string> {
		if (this.#workflowAccounts) return this.#workflowAccounts
		const accountIdsToStage: Record<string, string> = Object.fromEntries(
			this.#stageAccounts.entries(),
		)

		for (const wave of this.waves) {
			wave.stages.forEach((stage) => {
				stage.stacks.forEach((stack) => {
					if (stack.account) {
						accountIdsToStage[stack.account] = stage.stageName
					}
				})
			})
		}

		this.#workflowAccounts = accountIdsToStage
		return this.#workflowAccounts
	}

	protected buildMaskStep() {
		const accountIds = this.getStageAccountIds()
		const maskValues: [ActionsContext, string][] = Object.values(
			accountIds,
		).map((name) => [
			ActionsContext.SECRET,
			`AWS_ACCOUNT_ID_${name.toUpperCase()}`,
		])
		return MaskValueStep.values(
			'Mask values',
			[ActionsContext.SECRET, 'AWS_PIPELINE_ACCOUNT_ID'],
			...maskValues,
		).jobSteps
	}

	/**
	 * Build matrix for publishing job assets.
	 * @protected
	 */
	protected buildFileAssetsMatrix(): ghpipelines.Job {
		// @ts-expect-error - private property
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const assetHashMap: Record<string, string> = this.assetHashMap
		const assetJobNames: string[] = Object.values(assetHashMap)

		const outDir = Stage.of(this)!.outdir

		const jobOutputs = Object.entries(assetHashMap).map(
			([assetHash, jobName]) => {
				const scriptPath = path.posix.join(outDir, `publish-${jobName}-step.sh`)
				const lines = fs
					.readFileSync(scriptPath, { encoding: 'utf-8' })
					.toString()
					.split('\n')
				const assetNum = jobName.slice(jobName.lastIndexOf('t') + 1)
				const assetOutput = `asset-hash${assetNum}`
				lines.push(`echo '${assetOutput}=${assetHash}' >> $GITHUB_OUTPUT`)
				fs.writeFileSync(scriptPath, lines.join('\n'), { encoding: 'utf-8' })
				return [assetOutput, jobName]
			},
		)

		const synthStep = this.synth as cdkpipelines.ShellStep

		const outputs = Object.fromEntries(
			jobOutputs.map(([assetOutput, _]) => [
				assetOutput,
				interpolateValue(
					ActionsContext.INTERPOLATE,
					`steps.publish.outputs.${assetOutput}`,
				),
			]),
		)

		const scripts = assetJobNames.map(
			(name) => `./cdk.out/publish-${name}-step.sh`,
		)

		const run = [
			`targets="${scripts.join(',')}"`,
			`echo -n "$targets" | xargs -r -d',' -t -n1 -P2 /bin/bash`,
		].join('\n')

		return {
			name: 'Publish Assets',
			permissions: {
				contents: ghpipelines.JobPermission.READ,
				idToken: ghpipelines.JobPermission.WRITE,
			},
			outputs,
			runsOn: interpolateValue(
				ActionsContext.INTERPOLATE,
				`inputs.runner || 'ubuntu-latest'`,
			),
			needs: [`Build-${synthStep.id}`],
			steps: [
				...(this.props.prePublishSteps ?? []),
				...this.props.awsCreds!.credentialSteps('us-east-1'),
				...this.buildAssetsSync('cdk.out', 'pull'),
				{
					name: 'Install cdk-assets',
					run: 'npm install --no-save cdk-assets',
				},
				{
					name: 'Publish',
					id: 'publish',
					run,
				},
				...(this.props.postPublishSteps ?? []),
			],
		}
	}

	/**
	 * @inheritDoc
	 */
	protected doBuildPipeline() {
		super.doBuildPipeline()

		const publishJob = this.buildFileAssetsMatrix()
		// update needs to use matrix
		const updateNeeds = (job: ghpipelines.Job) => {
			if (!job.needs) return job
			if (job.needs.some((n) => n.startsWith('Assets-FileAsset'))) {
				return {
					...job,
					needs: [
						...job.needs.filter((n) => !n.startsWith('Assets-FileAsset')),
						'publish',
					],
				}
			}
			return job
		}

		const jobs = Object.keys(this.workflowObj.jobs)
			.filter((key) => !key.startsWith('Assets-File'))
			.map((key) => [key, updateNeeds(this.workflowObj.jobs[key])])

		jobs.splice(1, 0, ['publish', publishJob])
		this.workflowFile.update({
			...this.workflowObj,
			jobs: snakeCaseKeys(Object.fromEntries(jobs)) as Record<
				string,
				ghpipelines.Job
			>,
		})

		this.applyPatches({ assetsMatrix: true })
		const patched = ghpipelines.JsonPatch.apply(
			this.workflowObj,
			// @ts-expect-error - private property
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			...this.workflowFile.patchOperations,
		) as GithubWorkflowModel
		this.workflowFile.update(patched)

		// @ts-expect-error private property
		this.workflowFile.patchOperations = []
		const [maskStep] = this.buildMaskStep()
		const jobNames = Object.keys(this.workflowObj.jobs)
		const maskPatches = jobNames.map((name) =>
			ghpipelines.JsonPatch.add(
				`/jobs/${name}/steps/0`,
				Object.assign({}, maskStep),
			),
		)
		this.workflowFile.patch(...maskPatches)
		this.workflowFile.writeFile()
	}

	/**
	 * Build assets sync steps.
	 * @param target Target directory.
	 * @param direction Direction to sync.
	 */
	buildAssetsSync(
		target: string,
		direction: 'pull' | 'push',
	): ghpipelines.JobStep[] {
		const pullAssetsStep = new S3BucketStep('CDK Assets', {
			scopeS3Uris: true,
			action: 'sync',
			source: {
				bucketName: this.props.assetsS3Bucket,
				prefix: this.props.assetsS3Prefix,
				key: 'cdk.out',
			},
			destination: target,
		})

		const step =
			direction === 'pull' ? pullAssetsStep : pullAssetsStep.flipDirection()

		return step.jobSteps
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

	protected removeFileAssetNeeds(key: string, value: string | number) {
		const needsMatch = key.match(/needs\/(\d+)$/)
		const isFileAssets = String(value).startsWith('Assets-FileAsset')
		if (!needsMatch || !isFileAssets) return
		return ghpipelines.JsonPatch.remove('/' + key)
	}

	protected replaceFileAssetMatrixRefs(key: string, value: string | number) {
		const matcher = /needs\.Assets-FileAsset(\d+)\.outputs\.asset-hash/
		if (!String(value).match(matcher)) return
		return ghpipelines.JsonPatch.replace(
			'/' + key,
			String(value).replace(matcher, 'needs.publish.outputs.asset-hash$1'),
		)
	}

	get workflowObj(): GithubWorkflowModel {
		return JSON.parse(
			// @ts-expect-error - private property
			JSON.stringify(this.workflowFile.obj),
		) as GithubWorkflowModel
	}

	protected applyPatches(options?: { assetsMatrix?: boolean }) {
		const patchers = [
			this.runnerPatch.bind(this),
			this.checkoutPatch.bind(this),
			this.stepsToSyncAssemblyPatch.bind(this),
			this.moveAssetAuthenticationPatch.bind(this),
			this.maskAccountIdPatch.bind(this),
			options?.assetsMatrix && this.removeFileAssetNeeds.bind(this),
			options?.assetsMatrix && this.replaceFileAssetMatrixRefs.bind(this),
		].filter(Boolean) as WorkflowPatcher[]

		for (const patcher of patchers) {
			const inObject = Object.assign({}, this.workflowObj)
			const flatWorkflow: Record<string, string | number> = flat.flatten(
				inObject,
				{ delimiter: '/' },
			)
			const patches = []
			for (const [key, value] of Object.entries(flatWorkflow)) {
				patches.push(patcher(key, value))
			}
			const ops = patches.filter(Boolean) as ghpipelines.JsonPatch[]
			if (ops.length) {
				this.workflowFile.update(ghpipelines.JsonPatch.apply(inObject, ...ops))
			}
		}
	}

	onWorkflowCall(inputs?: Record<string, ActionsWorkflowCallInput>): this {
		const patch = ghpipelines.JsonPatch.add('/on/workflow_call', {
			inputs,
		})
		this.workflowFile.patch(patch)
		return this
	}

	onWorkflowDispatch(
		inputs?: Record<string, ActionsWorkflowDispatchInput>,
	): this {
		const patch = ghpipelines.JsonPatch.add('/on/workflow_dispatch', {
			inputs,
		})
		this.workflowFile.patch(patch)
		return this
	}

	/**
	 * Define workflow concurrency
	 * @param options
	 */
	concurrency(options: WorkflowConcurrency): this {
		const patch = ghpipelines.JsonPatch.add('/concurrency', {
			group: options.group,
			...(typeof options.cancelInProgress === 'boolean'
				? { 'cancel-in-progress': options.cancelInProgress }
				: {}),
		})
		this.workflowFile.patch(patch)
		return this
	}
}
