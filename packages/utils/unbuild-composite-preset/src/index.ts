import fs from 'node:fs/promises'
import path from 'node:path'
import { definePreset } from 'unbuild'

export interface CompositePresetsOptions {
	/**
	 * Relative path to source directory.
	 * @default 'src'
	 */
	readonly sourceDir?: string
	/**
	 * Relative path to declaration directory.
	 * @default 'dist-types'
	 */
	readonly declarationDir?: string
}

/**
 * Recursively get all .d.ts/ts.map files in a directory.
 * @param dir directory to search.
 */
const getDtsFiles = async (dir: string): Promise<string[]> => {
	const dirents = await fs.readdir(dir, { withFileTypes: true })
	const files = await Promise.all(
		dirents.map((dirent) => {
			const res = path.resolve(dir, dirent.name)
			return dirent.isDirectory()
				? getDtsFiles(res)
				: res.endsWith('.d.ts') || res.endsWith('.d.ts.map')
					? res
					: ''
		}),
	)
	return files.flat()
}

/**
 * Unbuild preset to support composite projects.
 *
 * @remarks
 * Copies declaration files that have already been compiled via tsc
 * temporarily into the source directory during rollup execution for rollup-dts-plugin,
 * then overlays the tsc declarations onto the output directory after build to work
 * around unbuild 3.x emitting invalid `.d.ts` output (types stripped, bodies kept).
 *
 * @see https://github.com/unjs/unbuild/issues/304
 * @see https://github.com/Swatinem/rollup-plugin-dts/issues/127
 *
 * @param options Preset options.
 */
export const compositePreset = (options?: CompositePresetsOptions) =>
	definePreset(() => {
		let srcDtsFiles: [string, string][]
		const sourceDir = options?.sourceDir ?? 'src'
		const declarationDir = options?.declarationDir ?? 'dist-types'
		return {
			hooks: {
				'build:prepare': async (ctx) => {
					if (ctx.options.stub) return
					const typesDist = path.join(ctx.options.rootDir, declarationDir)
					const srcDir = path.join(ctx.options.rootDir, sourceDir)
					const dtsFiles = await getDtsFiles(typesDist)
					srcDtsFiles = dtsFiles.map((filePath) => [
						filePath,
						path.join(srcDir, path.relative(typesDist, filePath)),
					])
					await Promise.all(
						srcDtsFiles.map(([filePath, srcPath]) =>
							fs.copyFile(filePath, srcPath),
						),
					)
				},
				'build:done': async (ctx) => {
					if (ctx.options.stub) return
					const typesDist = path.join(ctx.options.rootDir, declarationDir)
					const outDir = ctx.options.outDir
					const dtsFiles = await getDtsFiles(typesDist)
					await Promise.all(
						dtsFiles.map(async (filePath) => {
							const rel = path.relative(typesDist, filePath)
							const dest = path.join(outDir, rel)
							await fs.mkdir(path.dirname(dest), { recursive: true })
							await fs.copyFile(filePath, dest)
						}),
					)
					const barrel = path.join(outDir, 'index.d.ts')
					if (ctx.options.declaration === 'compatible') {
						await Promise.all([
							fs.copyFile(barrel, path.join(outDir, 'index.d.mts')),
							fs.copyFile(barrel, path.join(outDir, 'index.d.cts')),
						])
					}
					await Promise.all(
						srcDtsFiles.map(([, srcDtsPath]) => fs.rm(srcDtsPath)),
					)
				},
			},
		}
	})
