import crypto from 'node:crypto'
import os from 'node:os'
import fse from 'fs-extra'
import pathe from 'pathe'
import { test, expect, beforeAll, afterAll, describe } from 'vitest'
import { simpleNodeModulesCacheStore } from '../src/cache'

describe('simpleNodeModulesCacheStore', () => {
	const packageDir = pathe.join(os.tmpdir(), crypto.randomUUID())
	const cacheDir = pathe.join(packageDir, 'node_modules', '.cache')
	beforeAll(async () => {
		await fse.ensureDir(cacheDir)
	})
	afterAll(async () => fse.rm(packageDir, { recursive: true, force: true }))

	test('behaves as expected', async () => {
		const store = simpleNodeModulesCacheStore<{ key: string }>({
			name: 'test-store-1',
			cwd: packageDir,
		})
		expect(store.data).toBeUndefined()
		expect(store.save({ key: 'value' })).toEqual({ key: 'value' })
		expect(store.data).toEqual({ key: 'value' })
		expect(await fse.readJson(store.filePath)).toMatchInlineSnapshot(`
			{
			  "key": "value",
			}
		`)
		store.flush()
		expect(store.data).toBeUndefined()
	})
})
