import { stripFormatting } from '@arroyodev-llc/utils.fs'
import is from '@sindresorhus/is'
import {
	type Expression,
	type ObjectLiteralExpression,
	type PropertyAssignment,
	type WriterFunction,
} from 'ts-morph'
import type { LiteralExpressionMergeValue } from './types.ts'

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
/**
 * Ensure given value is a valid initializer.
 * @param value Input writer function or primitive value.
 */
export const convertInitializer = <T extends LiteralExpressionMergeValue>(
	value: T
): WriterFunction | string =>
	is.function_(value) ? value : JSON.stringify(value)
/**
 * Resolve appropriate default initializer for given value.
 * @param value Input value.
 */
export const defaultInitializerFor = <T extends LiteralExpressionMergeValue>(
	value: T
) => {
	switch (true) {
		case is.plainObject(value):
			return '{}'
		case is.array(value):
			return '[]'
		default:
			return convertInitializer(value)
	}
}
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
	const prepareValue = (value: string) => stripFormatting(value)
	const toText = (value: Expression | string) =>
		typeof value === 'string'
			? value
			: value.getText({
					includeJsDocComments: false,
					trimLeadingIndentation: true,
			  })
	return prepareValue(toText(a)) === prepareValue(toText(b))
}
