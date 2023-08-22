import decamelize from 'decamelize'

/**
 * Snake case keys recursively.
 *
 * Copied from cdk-pipelines-github.
 * @see https://github.com/cdklabs/cdk-pipelines-github/blob/932b5da8a04481b2b563239fdfbcd9945b444c98/src/pipeline.ts#L896
 *
 * @param obj Object to snake case
 * @param sep Separator to use
 */
export function snakeCaseKeys<T = unknown>(obj: T, sep = '-'): T {
	if (typeof obj !== 'object' || obj == null) {
		return obj
	}

	if (Array.isArray(obj)) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return obj.map((o) => snakeCaseKeys(o, sep)) as any
	}

	const result: Record<string, unknown> = {}
	// eslint-disable-next-line prefer-const
	for (let [k, v] of Object.entries(obj)) {
		// we don't want to snake case environment variables
		if (k !== 'env' && typeof v === 'object' && v != null) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			v = snakeCaseKeys(v)
		}
		result[decamelize(k, { separator: sep })] = v
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return result as any
}
