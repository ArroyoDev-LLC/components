import is from '@sindresorhus/is'
import {
	type ArrayLiteralExpression,
	type Expression,
	type ObjectLiteralExpression,
	type PropertyAssignment,
	SyntaxKind,
	type WriterFunction,
} from 'ts-morph'
import type { Primitive, Schema } from 'type-fest'

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

/**
 * Maps simple objects to property assignments on ts-morph wrapped AST node.
 * @param expression - Wrapped object literal expression node.
 * @param obj - object with properties to apply.
 */
export const addPropertyAssignmentsFromObject = <T extends object>(
	expression: ObjectLiteralExpression,
	obj: T
): PropertyAssignment[] => {
	return expression.addPropertyAssignments(
		Object.entries(obj).map(([key, value]) => ({
			name: key,
			initializer: (writer) => writer.write(JSON.stringify(value)),
		}))
	)
}

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
 * Create ObjectLiteral merge schema from type.
 */
export type ObjectLiteralMergeSchema<T> =
	| Schema<T, ObjectLiteralMergeObjectValue>
	| T

/**
 * Ensure given value is a valid initializer.
 * @param value Input writer function or primitive value.
 */
export const convertInitializer = <T extends ObjectLiteralMergeObjectValue>(
	value: T
): WriterFunction | string =>
	is.function_(value) ? value : JSON.stringify(value)

/**
 * Test equality between two expressions.
 *
 * @remarks
 * Converts both expressions to strings strips all whitespace,
 * quotations, and escapes. The resulting strings are then compared.
 *
 * @param a Left expression.
 * @param b Right expression.
 */
export const isExpressionEqual = (
	a: Expression | string,
	b: Expression | string
): boolean => {
	const prepareValue = (value: string) =>
		value
			.replaceAll(' ', '')
			.replaceAll('"', '')
			.replaceAll(`'`, '')
			.replaceAll(`\\`, '')
	const toText = (value: Expression | string) =>
		typeof value === 'string'
			? value
			: value.getText({
					includeJsDocComments: false,
					trimLeadingIndentation: true,
			  })
	return prepareValue(toText(a)) === prepareValue(toText(b))
}

/**
 * Merge array into {@link ArrayLiteralExpression}.
 *
 * @remarks
 * Produces a concat-ed array of unique elements.
 * Any writer functions will be added as-is.
 *
 * @param arrayLiteral {@link ArrayLiteralExpression} to merge into.
 * @param value Values to merge in array literal.
 */
export function mergeArrayLiteral(
	arrayLiteral: ArrayLiteralExpression,
	value: Array<Primitive | WriterFunction | ObjectLiteralMergeObjectValue>
) {
	const elements = [
		...arrayLiteral.getElements(),
		...value.map(convertInitializer),
	]

	return elements.reduce((acc, curr) => {
		// cannot test equality on writer functions.
		if (!is.function_(curr)) {
			const idx = acc.findIndex((item) =>
				is.function_(item) ? false : isExpressionEqual(curr, item)
			)
			if (idx === -1) {
				// convert any expression objects to raw text.
				acc.push(is.string(curr) ? curr : curr.getFullText())
			}
		} else {
			acc.push(curr)
		}
		return acc
	}, [] as Array<WriterFunction | string>)
}

/**
 * Deeply merge `obj` into an existing {@link ObjectLiteralExpression}
 * @param expression {@link ObjectLiteralExpression} to merge into.
 * @param obj Input merge object.
 */
export function mergeObjectLiteral<T extends Record<string, any>>(
	expression: ObjectLiteralExpression,
	obj: Schema<T, ObjectLiteralMergeObjectValue>
) {
	for (const [key, value] of Object.entries(obj)) {
		// existing assignment if defined.
		const propAssign = expression.getProperty(key) as
			| PropertyAssignment
			| undefined

		if (propAssign && propAssign.getKind() === SyntaxKind.PropertyAssignment) {
			// existing object literal expression initializer, if defined.
			const initializer = propAssign.getInitializerIfKind(
				SyntaxKind.ObjectLiteralExpression
			)
			// existing array literal expression initializer, if defined.
			const arrayInitializer = propAssign.getInitializerIfKind(
				SyntaxKind.ArrayLiteralExpression
			)

			if (initializer && typeof value === 'object' && value !== null) {
				// recurse into sub-object.
				mergeObjectLiteral(initializer, value)
			} else if (arrayInitializer && Array.isArray(value)) {
				// merge arrays via concat with some basic unique checks.
				const uniqueArray = mergeArrayLiteral(arrayInitializer, value)

				// set merge array
				propAssign.setInitializer(`[${uniqueArray.join(', ')}]`)
			} else {
				propAssign.setInitializer(
					convertInitializer(value as ObjectLiteralMergeObjectValue)
				)
			}
		} else {
			// just set new value (no existing one defined)
			expression.addPropertyAssignment({
				name: key,
				initializer: convertInitializer(value as ObjectLiteralMergeObjectValue),
			})
		}
	}
}
