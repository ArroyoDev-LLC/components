import type { WriterFunction } from 'ts-morph'
import { type Primitive, type Schema } from 'type-fest'

export type Enumerable<T> = T | Array<T>

/**
 * Merge object acceptable key values.
 */
export type ObjectLiteralMergeObjectValue =
	| WriterFunction
	| Enumerable<
			Primitive | Record<string, WriterFunction | Enumerable<Primitive>>
	  >
/**
 * {@link ArrayLiteralExpression} merge value.
 */
export type ArrayLiteralMergeValue = Array<
	Primitive | WriterFunction | ObjectLiteralMergeObjectValue
>
/**
 * {@link ObjectLiteralExpression}, {@link ArrayLiteralExpression}, primitive,
 * or writer function literal merge value.
 */
export type LiteralExpressionMergeValue =
	| ObjectLiteralMergeObjectValue
	| ArrayLiteralMergeValue
/**
 * Create ObjectLiteral merge schema from type.
 */
export type ObjectLiteralMergeSchema<T> =
	| Schema<T, ObjectLiteralMergeObjectValue>
	| T
