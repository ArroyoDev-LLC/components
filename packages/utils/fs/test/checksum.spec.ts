import crypto from 'node:crypto'
import os from 'node:os'
import fse from 'fs-extra'
import pathe from 'pathe'
import { test, describe, expect } from 'vitest'
import {
	stripFormatting,
	checksumGenerator,
	computeChecksum,
	computeFileChecksum,
	type StripOptions,
	type ChecksumOptions,
} from '../src/checksum'

const stripFormatCases: [string, undefined | StripOptions, string][] = [
	[`"Hello, World!"`, undefined, `Hello,World!`],
	[`'Hello, World!'`, { singleQuotes: false }, `'Hello,World!'`],
	[`"Hello, World!"`, { doubleQuotes: false }, `"Hello,World!"`],
	[
		`"Hello,\\ 'World!'"`,
		{ doubleQuotes: false, singleQuotes: false, spaces: false },
		`"Hello, 'World!'"`,
	],
	[`"Hello,\\ 'World!'"\nSecond 'Line'`, undefined, `Hello,World!SecondLine`],
	[`"Hello, World!"`, { spaces: false }, `Hello, World!`],
	['', undefined, ''],
]

describe.concurrent.each(stripFormatCases)(
	'stripFormatting(%s, %o)',
	(input, options, expected) => {
		test.concurrent(`-> ${expected}`, async (ctx) => {
			const result = stripFormatting(input, options as StripOptions)
			ctx.expect(result).toBe(expected)
		})
	}
)

const worldParts = ['Hello', ', ', '"World"!']
const checksumGeneratorCases: [
	string[],
	ChecksumOptions | undefined,
	string
][] = [
	[worldParts, undefined, '6b06afea412a1611e2c42df1838620a19ad852e0'],
	[worldParts, { algorithm: 'md5' }, 'e646fb07f547d4ad70cf7f0d760dd95d'],
	[
		worldParts,
		{ stripContent: true },
		'16ad856b462e68f965f6e93f66282a7ae891fdbc',
	],
	[
		worldParts,
		{ stripContent: true, stripOptions: { spaces: false } },
		'0a0a9f2a6772942557ab5355d76af442f8f65e01',
	],
	[[''], undefined, 'da39a3ee5e6b4b0d3255bfef95601890afd80709'],
]

describe.concurrent.each(checksumGeneratorCases)(
	'checksumGenerator(%s, %o)',
	(input, options, expected) => {
		test.concurrent(`-> ${expected}`, async (ctx) => {
			const generator = checksumGenerator(options)
			generator.next()
			input.forEach((part) => generator.next(part))
			const result = generator.next(null).value
			ctx.expect(result).toBe(expected)
		})
	}
)

const checksumCases: [string, ChecksumOptions | undefined, string][] =
	checksumGeneratorCases.map(([parts, ...rest]) => [parts.join(''), ...rest])

describe.concurrent.each(checksumCases)(
	'computeChecksum(%s, %o)',
	(input, options, expected) => {
		test.concurrent(`-> ${expected}`, async (ctx) => {
			const result = computeChecksum(input, options as ChecksumOptions)
			ctx.expect(result).toBe(expected)
		})
	}
)

describe.concurrent.each(checksumCases)(
	'computeFileChecksum(contents: %s, %o)',
	(input, options, expected) => {
		test.concurrent(`-> ${expected}`, async (ctx) => {
			const filePath = pathe.join(os.tmpdir(), crypto.randomUUID())
			await fse.writeFile(filePath, input)
			const result = await computeFileChecksum(
				filePath,
				options as ChecksumOptions
			)
			ctx.expect(result).toBe(expected)
			await fse.rm(filePath, { force: true })
		})
	}
)
