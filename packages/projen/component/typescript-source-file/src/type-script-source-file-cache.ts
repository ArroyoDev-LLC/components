import {
	computeChecksum,
	type SimpleJsonStore,
	simpleNodeModulesCacheStore,
} from '@arroyodev-llc/utils.fs'
import { findComponent, findRootProject } from '@arroyodev-llc/utils.projen'
import { Component, type Project } from 'projen'
import { tryReadFileSync } from 'projen/lib/util'

/**
 * A cache for TypeScript source files.
 */
export class TypeScriptSourceFileCache extends Component {
	/**
	 * Returns the TypeScriptSourceFileCache for the given project, if it exists.
	 * @param project The project to find the TypeScriptSourceFileCache for.
	 */
	public static of(project: Project): TypeScriptSourceFileCache | undefined {
		return findComponent(findRootProject(project), TypeScriptSourceFileCache)
	}

	/**
	 * Ensures that a TypeScriptSourceFileCache exists for the given project.
	 * @param project The project to find the TypeScriptSourceFileCache for.
	 */
	public static ensure(project: Project): TypeScriptSourceFileCache {
		return (
			TypeScriptSourceFileCache.of(project) ??
			new TypeScriptSourceFileCache(findRootProject(project))
		)
	}

	#cacheStore: SimpleJsonStore<{
		contentHashes: [filePath: string, hash: string][]
	}>

	public readonly fileHashes: Map<string, string>

	constructor(project: Project) {
		if (TypeScriptSourceFileCache.of(project)) {
			throw new Error(
				'Only one TypeScriptSourceFileCache per project tree is allowed'
			)
		}
		super(project)
		this.#cacheStore = simpleNodeModulesCacheStore({
			name: 'ts-source-files',
			cwd: this.project.outdir,
		})
		if (!this.#cacheStore.data) {
			this.#cacheStore.save({ contentHashes: [] })
		}
		this.fileHashes = new Map(this.#cacheStore.data?.contentHashes)
	}

	/**
	 * Updates the hash for the given file path.
	 * @param filePath The file path to update the hash for.
	 * @param hash The new hash.
	 * @protected
	 */
	protected updateHash(filePath: string, hash: string) {
		this.fileHashes.set(filePath, hash)
		this.#cacheStore.save({ contentHashes: [...this.fileHashes.entries()] })
		return true
	}

	/**
	 * Upsert hash of file content for given file path.
	 *
	 * @remarks
	 * Returns true if the hash was updated, false otherwise.
	 *
	 * @param filePath The file path to upsert the hash for.
	 * @param content The content to hash and upsert.
	 */
	upsertFile(filePath: string, content: string): boolean {
		const hash = computeChecksum(content, { stripContent: true })
		const current = this.fileHashes.get(filePath)
		if (current !== hash && current) {
			// synthesized contents changed, update.
			return this.updateHash(filePath, hash)
		}
		const fileContents = tryReadFileSync(filePath)
		// check if formatted file has been modified.
		const fileHash = fileContents
			? computeChecksum(fileContents, { stripContent: true })
			: undefined
		if (!current) {
			this.updateHash(filePath, hash)
		}
		return fileHash !== hash
	}
}
