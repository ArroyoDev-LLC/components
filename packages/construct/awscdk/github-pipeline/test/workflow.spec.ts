import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { App, Stack, Stage } from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { describe, test, expect } from 'vitest'
import { GithubCodePipeline } from '../src'

describe('GithubCodePipeline', () => {
	test('synthesizes minimal expected pipeline', async () => {
		const rootDir = await fs.mkdtemp(
			path.join(os.tmpdir(), 'test-stack-pipeline'),
		)

		const app = new App({ outdir: rootDir })

		const stage = new Stage(app, 'test', {
			env: { account: '1234567890', region: 'us-east-1' },
		})
		const stack = new Stack(stage, 'test-stack', {
			env: { account: '1234567890', region: 'us-east-1' },
		})
		new s3.Bucket(stack, 'test-bucket')

		const pipe = GithubCodePipeline.create({
			assetsS3Bucket: 'test-bucket',
			workflowName: 'Deploy Test Stack',
			assetsS3Prefix: 'test-stack',
			rootDir,
		})
			.synthTarget({
				workingDirectory: 'packages/test-stack',
				packageName: 'test-stack',
			})
			.build(app)

		pipe.addStageWithGitHubOptions(stage)
		app.synth()

		const contents = (await fs.readFile(pipe.workflowPath)).toString()
		expect(contents).toMatchSnapshot()
	})
})
