/**
 * Generic interface an object that supports overrides.
 */
interface SupportsOverrides {
	addOverride(key: string, value: any): void
}

/**
 * Apply overrides from an object.
 * @param item - item to apply too.
 * @param overrides - record of overrides.
 */
export const applyOverrides = <T extends SupportsOverrides>(
	item: T,
	overrides: Record<string, any>
): T => {
	Object.entries(overrides).forEach(([key, value]) =>
		item.addOverride(key, value)
	)
	return item
}
