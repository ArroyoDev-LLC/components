import type buffer from 'node:buffer'
import crypto from 'node:crypto'
import fse from 'fs-extra'

/**
 * Options for {@link stripFormatting}
 */
export interface StripOptions {
	/**
	 * Strip whitespace.
	 * @default true
	 */
	spaces?: boolean
	/**
	 * Strip all single quotes (').
	 * @default true
	 */
	singleQuotes?: boolean
	/**
	 * Strip all double quotes (").
	 * @default true
	 */
	doubleQuotes?: boolean
	/**
	 * Strip all commas (,).
	 */
	commas?: boolean
	/**
	 * Strip all semicolons (;).
	 */
	semicolons?: boolean
}

/**
 * Options for {@link computeChecksum}
 */
export interface ChecksumOptions {
	/**
	 * Checksum algorithm to use.
	 * @default 'sha1'
	 */
	algorithm?: 'sha1' | 'sha256' | 'sha512' | 'md5'
	/**
	 * Existing {@link crypto#Hash} instance to use.
	 * @default undefined
	 */
	hash?: crypto.Hash
	/**
	 * {@link crypto#HashOptions} passed to hash.
	 * Only used if {@link ChecksumOptions:hash} is undefined.
	 * @default undefined
	 */
	hashOptions?: crypto.HashOptions
	/**
	 * Strip any formatting prior to computing hash.
	 * @default false
	 */
	stripContent?: boolean
	/**
	 * Use {@link stripFormatting} prior to hashing content.
	 * Requires {@link ChecksumOptions:stripFormatting} to be true.
	 * @default undefined
	 */
	stripOptions?: StripOptions
}

export function stripFormatting(
	content: string,
	options?: StripOptions
): string {
	const {
		spaces = true,
		singleQuotes = true,
		doubleQuotes = true,
		commas = true,
		semicolons = true,
	} = options ?? {}
	let base = content.replaceAll('\\', '').replaceAll(/\n/g, '')
	if (singleQuotes) {
		base = base.replaceAll("'", '')
	}
	if (doubleQuotes) {
		base = base.replaceAll('"', '')
	}
	if (spaces) {
		base = base.replaceAll(/\s/g, '')
	}
	if (commas) {
		base = base.replaceAll(',', '')
	}
	if (semicolons) {
		base = base.replaceAll(';', '')
	}
	return base
}

/**
 * Generator for updating hash with given pre-processing options.
 * Exits with the hex digest upon receiving a nil-ish value.
 * @param options Pre-processing and checksum options.
 */
export function* checksumGenerator(
	options?: ChecksumOptions
): Generator<void, string, string | null | undefined> {
	const {
		algorithm = 'sha1',
		hashOptions,
		stripOptions,
		stripContent = false,
		hash = crypto.createHash(algorithm, hashOptions),
	} = options ?? {}

	let input: string | null | undefined

	while (true) {
		input = yield
		if (input === null || input === undefined) {
			break
		}
		const data = stripContent ? stripFormatting(input, stripOptions) : input
		hash.update(data)
	}

	return hash.digest('hex')
}

/**
 * Compute checksum of given content.
 * @param content Target string content.
 * @param options Checksum options.
 */
export function computeChecksum(
	content: string,
	options?: ChecksumOptions
): string {
	const generator = checksumGenerator(options)
	generator.next()
	generator.next(content)
	return generator.next(null).value as string
}

/**
 * Compute checksum of file at given path.
 * @param filePath Path of target file.
 * @param options Checksum options.
 */
export async function computeFileChecksum(
	filePath: string,
	options?: ChecksumOptions
): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		try {
			const generator = checksumGenerator(options)
			generator.next()
			const stream = fse.createReadStream(filePath)
			stream.on('readable', () => {
				const data: buffer.Buffer = stream.read() as buffer.Buffer
				if (data) {
					generator.next(data.toString())
				} else {
					const result = generator.next(null).value as string
					stream.close(reject)
					resolve(result)
				}
			})
		} catch (e: unknown) {
			reject(e)
		}
	})
}
