import flatten from 'flat'

/**
 * Generic interface an object that supports overrides.
 */
interface SupportsOverrides {
	addOverride(key: string, value: any): void
	addToArray(key: string, ...values: any[]): void
}

interface ApplyOverridesOptions {
	/**
	 * If true, extends existing arrays.
	 * Otherwise, replaces them.
	 * @default false
	 */
	extendArrays: boolean
}

/**
 * Apply overrides from an object.
 * @param item item to apply too.
 * @param overrides record of overrides.
 * @param options behavior options.
 */
export const applyOverrides = <T extends SupportsOverrides>(
	item: T,
	overrides: Record<string, any>,
	options?: ApplyOverridesOptions
): T => {
	const extendArrays = options?.extendArrays ?? false
	const flatItem: Record<string, any | Array<any>> = flatten.flatten(
		overrides,
		{
			delimiter: '.',
			safe: true,
		}
	)
	Object.entries(flatItem).forEach(([key, value]) => {
		if (Array.isArray(value) && extendArrays) {
			item.addToArray(key, ...(value as unknown[]))
		} else {
			item.addOverride(key, value)
		}
	})
	return item
}
