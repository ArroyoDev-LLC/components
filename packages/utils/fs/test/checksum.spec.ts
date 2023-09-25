import crypto from 'node:crypto'
import os from 'node:os'
import fse from 'fs-extra'
import pathe from 'pathe'
import { test, describe } from 'vitest'
import {
	stripFormatting,
	checksumGenerator,
	computeChecksum,
	computeFileChecksum,
	type StripOptions,
	type ChecksumOptions,
} from '../src/checksum'

const stripFormatCases: [string, undefined | StripOptions, string][] = [
	[`"Hello, World!"`, undefined, `HelloWorld!`],
	[`"Hello;, World;!\n'L'"`, undefined, `HelloWorld!L`],
	[`'Hello, World!'`, { singleQuotes: false }, `'HelloWorld!'`],
	[`"Hello, World!"`, { doubleQuotes: false }, `"HelloWorld!"`],
	[
		`"Hello,\\ 'World!'"`,
		{ doubleQuotes: false, singleQuotes: false, spaces: false, commas: false },
		`"Hello, 'World!'"`,
	],
	[`"Hello,\\ 'World!'"\nSecond 'Line'`, undefined, `HelloWorld!SecondLine`],
	[`"Hello, World!"`, { spaces: false }, `Hello World!`],
	['', undefined, ''],
]

describe.concurrent.each(stripFormatCases)(
	'stripFormatting(%s, %o)',
	(input, options, expected) => {
		test.concurrent(`-> ${expected}`, async (ctx) => {
			const result = stripFormatting(input, options as StripOptions)
			ctx.expect(result).toBe(expected)
		})
	},
)

const worldParts = ['Hello', ', ', '"World"!']
const checksumGeneratorCases: [
	string[],
	ChecksumOptions | undefined,
	string,
][] = [
	[worldParts, undefined, '6b06afea412a1611e2c42df1838620a19ad852e0'],
	[worldParts, { algorithm: 'md5' }, 'e646fb07f547d4ad70cf7f0d760dd95d'],
	[
		worldParts,
		{ stripContent: true },
		'd735871a64133ee062400659cf91b8234d1c1930',
	],
	[
		worldParts,
		{ stripContent: true, stripOptions: { spaces: false } },
		'2ef7bde608ce5404e97d5f042f95f89f1c232871',
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
	},
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
	},
)

describe.concurrent.each(checksumCases)(
	'computeFileChecksum(contents: %s, %o)',
	(input, options, expected) => {
		test.concurrent(`-> ${expected}`, async (ctx) => {
			const filePath = pathe.join(os.tmpdir(), crypto.randomUUID())
			await fse.writeFile(filePath, input)
			const result = await computeFileChecksum(
				filePath,
				options as ChecksumOptions,
			)
			ctx.expect(result).toBe(expected)
			await fse.rm(filePath, { force: true })
		})
	},
)
