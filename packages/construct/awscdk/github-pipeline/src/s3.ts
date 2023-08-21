import * as ghpipelines from 'cdk-pipelines-github'
import defu from 'defu'
import { ActionsContext, interpolateValue } from './workflow'

export interface S3BucketStepProps {
	env?: ghpipelines.GitHubActionStepProps['env']
	/**
	 * The action to perform.
	 */
	action: 'copy' | 'sync'
	/**
	 * Source path or remote s3 reference.
	 */
	source: string | S3ObjectRef
	/**
	 * Destination path or remote s3 reference.
	 */
	destination: string | S3ObjectRef
	/**
	 * Add a prefix to any s3 object refs
	 * of <workflow-run>-<run-attempt>/<key>
	 */
	scopeS3Uris?: boolean
	preSteps?: ghpipelines.JobStep[]
	postSteps?: ghpipelines.JobStep[]
	stepProps?: Partial<ghpipelines.JobStep>
}

export interface S3ObjectRef {
	bucketName: string
	prefix?: string
	key: string
}

/**
 * Build an S3 uri from the given object reference.
 * @param props The object reference.
 */
export function buildS3Uri(props: S3ObjectRef): string {
	const keyPath = [props.bucketName, props.prefix, props.key]
		.filter(Boolean)
		.join('/')
	return `s3://${keyPath}`
}

/**
 * A step that performs an action on an s3 bucket.
 */
export class S3BucketStep extends ghpipelines.GitHubActionStep {
	/**
	 * Build an s3 uri with a key prefix scoped by workflow run id and attempt.
	 * @param objectRef The object reference to scope.
	 */
	static buildScopedS3Ref(objectRef: S3ObjectRef): S3ObjectRef {
		const scopePath = [
			interpolateValue(ActionsContext.GITHUB, 'run_id'),
			interpolateValue(ActionsContext.GITHUB, 'run_attempt'),
		].join('-')

		const prefixParts = [objectRef.prefix, scopePath].filter(Boolean)
		return {
			key: objectRef.key,
			prefix: prefixParts.join('/'),
			bucketName: objectRef.bucketName,
		}
	}

	/**
	 * Build an s3 uri from the given object reference.
	 * @param ref The object reference or file path.
	 * @param scoped Whether to scope the object reference to the workflow.
	 */
	static buildS3Uri(ref: S3ObjectRef | string, scoped?: boolean): string {
		if (typeof ref !== 'string') {
			return scoped ? buildS3Uri(this.buildScopedS3Ref(ref)) : buildS3Uri(ref)
		}
		return ref
	}

	constructor(
		readonly id: string,
		readonly props: S3BucketStepProps,
	) {
		const env = {
			...props.env,
			S3_SOURCE: S3BucketStep.buildS3Uri(props.source, props.scopeS3Uris),
			S3_DESTINATION: S3BucketStep.buildS3Uri(
				props.destination,
				props.scopeS3Uris,
			),
		}
		const sourceRef = interpolateValue(ActionsContext.ENV, 'S3_SOURCE')
		const destRef = interpolateValue(ActionsContext.ENV, 'S3_DESTINATION')
		const command = ['aws', 's3', props.action, sourceRef, destRef].join(' ')
		const preSteps = props.preSteps ?? []
		const postSteps = props.postSteps ?? []
		super(id, {
			env,
			jobSteps: [
				...preSteps,
				{
					...(props.stepProps ?? {}),
					env,
					run: command,
				},
				...postSteps,
			],
		})
	}

	/**
	 * Flip the source and destination.
	 * @param props Additional props used as overrides.
	 */
	flipDirection(props?: Partial<S3BucketStepProps>) {
		const newProps = defu(
			{
				source: this.props.destination,
				destination: this.props.source,
			},
			props ?? {},
			this.props,
		) as S3BucketStepProps
		return new S3BucketStep(this.id, newProps)
	}
}
