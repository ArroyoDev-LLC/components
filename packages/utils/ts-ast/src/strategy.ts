/**
 * Metadata key for object array merge strategy.
 */
export const ArrayLiteralMergeStrategy = Symbol(
	'@arroyodev-llc/utils.projen:ArrayLiteralMergeStrategy',
)

/**
 * Array literal merge strategy type.
 */
export enum ArrayLiteralMergeStrategyType {
	/**
	 * Always append as new element.
	 */
	APPEND = 'append',
	/**
	 * If existing element and new element share the same index
	 * and they are both a collection-type, merge the two.
	 */
	MERGE = 'merge',
	/**
	 * If an element exists at the same index, overwrite it.
	 */
	OVERWRITE = 'overwrite',
}

/**
 * Define a merge strategy for a given element.
 * @param obj Merge object in question.
 * @param strategy Strategy to utilize.
 */
export const setMergeStrategy = <T extends NonNullable<unknown>>(
	obj: T,
	strategy: ArrayLiteralMergeStrategyType,
): T => {
	Reflect.defineMetadata(ArrayLiteralMergeStrategy, strategy, obj)
	return obj
}
/**
 * Retrieve merge strategy for given object.
 * @param obj Merge object in question.
 * @default {@link ArrayLiteralMergeStrategyType.APPEND}
 */
export const getMergeStrategy = <T extends NonNullable<unknown>>(
	obj: T,
): ArrayLiteralMergeStrategyType => {
	try {
		return (
			(Reflect.getMetadata(
				ArrayLiteralMergeStrategy,
				obj,
			) as ArrayLiteralMergeStrategyType) ??
			ArrayLiteralMergeStrategyType.APPEND
		)
	} catch {
		return ArrayLiteralMergeStrategyType.APPEND
	}
}
