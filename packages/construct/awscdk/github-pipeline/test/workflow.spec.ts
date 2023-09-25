import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
	App,
	Stack,
	type StackProps,
	Stage,
	type StageProps,
} from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { type Construct } from 'constructs'
import { describe, test, expect, beforeEach, afterAll } from 'vitest'
import { GithubCodePipeline, type GithubWorkflowPipeline } from '../src'

interface TestContext {
	rootDir: string
	app: App
	stack: typeof Stack
	stage: { new (...args: ConstructorParameters<typeof Stage>): Stage }
}

const TEST_DIR = path.join(os.tmpdir(), 'github-pipeline-test')

afterAll(async () => fs.rmdir(TEST_DIR, { maxRetries: 0 }).catch(() => {}))

describe('GithubCodePipeline', () => {
	beforeEach<TestContext>(async (ctx) => {
		const tmpDir = path.join(TEST_DIR, ctx.task.name.replace(/\s/g, '-'))
		await fs.rmdir(tmpDir).catch(() => {})
		const rootDir = await fs.mkdir(tmpDir, { recursive: true })
		ctx.rootDir = tmpDir
		ctx.app = new App({ outdir: rootDir })
		ctx.stack = class extends Stack {
			constructor(scope: Construct, id: string, stackProps?: StackProps) {
				super(scope, id, stackProps)
				new s3.Bucket(this, id + '-test-sample-bucket')
			}
		}
		ctx.stage = class extends Stage {
			constructor(scope: Construct, id: string, stageProps?: StageProps) {
				super(scope, id, stageProps)
				new ctx.stack(this, id + '-stack')
			}
		}
	})

	const buildMultiStage = (
		ctx: TestContext,
	): [pipe: GithubWorkflowPipeline, builder: GithubCodePipeline] => {
		const builder = GithubCodePipeline.create({
			rootDir: ctx.rootDir,
			assetsS3Prefix: 'multi-stage',
			assetsS3Bucket: 'test-stack',
			workflowName: 'Deploy Many Stages',
		})
			.addConfigsEnv()
			.addNxEnv()
			.synthTarget({
				workingDirectory: 'packages/test-many',
				packageName: 'test.many',
			})
			.installHelm('3.6.3')
			.installAwsCli('2')
			.installSops('3.7.3')
			.installNode('18', 'pnpm')
			.installPnpm('8')
			.publishPostStep({
				name: 'My Custom post publish step',
				run: 'echo "hello world"',
			})

		const pipe = builder
			.build(ctx.app)
			.concurrency({ cancelInProgress: false, group: 'deploy-multi-stack' })
			.onWorkflowDispatch()
			.onWorkflowCall({
				runner: {
					type: 'string',
					default: 'self-hosted',
					description: 'custom runner',
					required: false,
				},
			})

		pipe.addStageWithGitHubOptions(
			new ctx.stage(ctx.app, 'alpha', {
				env: { account: '123', region: 'us-east-1' },
			}),
		)

		pipe.addStageWithGitHubOptions(
			new ctx.stage(ctx.app, 'beta', {
				env: { account: '456', region: 'us-east-1' },
			}),
		)

		pipe.addStageWithGitHubOptions(
			new ctx.stage(ctx.app, 'delta', {
				env: { account: '789', region: 'us-east-1' },
			}),
		)
		return [pipe, builder]
	}

	test<TestContext>('synthesizes minimal expected pipeline', async (ctx) => {
		const env = { account: '123', region: 'us-east-1' }

		const pipe = GithubCodePipeline.create({
			assetsS3Bucket: 'test-bucket',
			workflowName: 'Deploy Test Stack',
			assetsS3Prefix: 'test-stack',
			rootDir: ctx.rootDir,
		})
			.synthTarget({
				workingDirectory: 'packages/test-stack',
				packageName: 'test-stack',
			})
			.build(ctx.app)

		pipe.addStageWithGitHubOptions(new ctx.stage(ctx.app, 'test', { env }))
		ctx.app.synth()

		const contents = (await fs.readFile(pipe.workflowPath)).toString()
		expect(contents).toMatchSnapshot()
	})

	test<TestContext>('synthesizes expected pipeline with synth environment', async (ctx) => {
		const env = { account: '123', region: 'us-east-1' }

		const pipe = GithubCodePipeline.create({
			assetsS3Bucket: 'test-bucket',
			workflowName: 'Deploy Test Stack',
			assetsS3Prefix: 'test-stack',
			rootDir: ctx.rootDir,
		})
			.synthTarget({
				workingDirectory: 'packages/test-stack',
				packageName: 'test-stack',
				commandEnv: {
					ABC: '123',
				},
				environment: {
					name: 'my-environment',
					url: 'https://example.com',
				},
			})
			.build(ctx.app)

		pipe.addStageWithGitHubOptions(new ctx.stage(ctx.app, 'test', { env }))
		ctx.app.synth()

		const contents = (await fs.readFile(pipe.workflowPath)).toString()
		expect(contents).to.include('my-environment')
		expect(contents).to.include('https://example.com')
		expect(contents).toMatchSnapshot()
	})

	test<TestContext>('synthesizes as expected with many stages', async (ctx) => {
		const [pipe] = buildMultiStage(ctx)
		ctx.app.synth()
		const contents = (await fs.readFile(pipe.workflowPath)).toString()
		expect(contents).toMatchSnapshot()
	})

	test<TestContext>('masks all stage account ids', async (ctx) => {
		const [pipe] = buildMultiStage(ctx)
		ctx.app.synth()
		const contents = (await fs.readFile(pipe.workflowPath)).toString()
		expect(contents).not.to.include('123')
		expect(contents).not.to.include('456')
		expect(contents).not.to.include('789')
		expect(contents).to.include('AWS_ACCOUNT_ID_ALPHA')
		expect(contents).to.include('AWS_ACCOUNT_ID_BETA')
		expect(contents).to.include('AWS_ACCOUNT_ID_DELTA')
	})

	test<TestContext>('builder has expected props', (ctx) => {
		const [, builder] = buildMultiStage(ctx)
		expect(builder.props).toMatchSnapshot()
		expect(builder.synthProps).toMatchSnapshot()
		expect(builder).toMatchSnapshot()
	})

	test<TestContext>('synthesize prebuild steps are in expected order', (ctx) => {
		const [, builder] = buildMultiStage(ctx)
		const awsIdx = builder.props.preBuildSteps!.findIndex(
			(step) => step.name === 'Install AWS CLI',
		)
		const pullCtxIdx = builder.props.preBuildSteps!.findIndex(
			(step) => step.name === 'Pull cdk.context.json',
		)
		console.log(builder.props.preBuildSteps)
		expect(awsIdx).toBeLessThan(pullCtxIdx)
	})
})
