import process from 'node:process'
import fse from 'fs-extra'
import pathe from 'pathe'

export interface SimpleStore {
	/**
	 * Data in store.
	 */
	data: any
	/**
	 * Overwrite store data.
	 * @param data new data.
	 */
	save(data: any): any
	/**
	 * FLush all data from store.
	 */
	flush(): void
}

export interface HasFile {
	/**
	 * Path reference.
	 */
	readonly filePath: string
}

export interface SimpleJsonStore<T> extends SimpleStore, HasFile {
	/**
	 * @inheritDoc
	 */
	data: Readonly<T> | undefined
	/**
	 * @inheritDoc
	 */
	save(data: T): Readonly<T>
}

export interface NodeModulesCacheStoreOptions {
	/**
	 * Store name.
	 * @example
	 * "my-simple-store"
	 */
	name: string
	/**
	 * Current working directory to consider as root.
	 * @default {@link process:cwd}
	 */
	cwd?: string
}

/**
 * {@link SimpleJsonStore} that resides in node_modules.
 * @param options Store configuration.
 */
export const simpleNodeModulesCacheStore = <T>(
	options: NodeModulesCacheStoreOptions
): SimpleJsonStore<T> => {
	const { name, cwd = process.cwd() } = options
	const sourceName = name.endsWith('.json') ? name : `${name}.json`
	const sourcePath = pathe.resolve(
		cwd,
		'node_modules',
		'.cache',
		name.split('.json')[0],
		sourceName
	)
	fse.ensureDirSync(pathe.dirname(sourcePath))
	const initData = fse.readJsonSync(sourcePath, { throws: false }) as
		| T
		| undefined
	return {
		filePath: sourcePath,
		data: initData ? Object.freeze(initData) : undefined,
		save(data: T): Readonly<T> {
			fse.writeJsonSync(sourcePath, data)
			this.data = Object.freeze(data)
			return this.data
		},
		flush(): void {
			this.data = undefined
			void fse.rm(sourcePath, { maxRetries: 1, force: true })
		},
	}
}
