import { stripFormatting } from '@arroyodev-llc/utils.fs'
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

/**
 * Metadata key for object array merge strategy.
 */
export const ArrayLiteralMergeStrategy = Symbol(
	'@arroyodev-llc/utils.projen:ArrayLiteralMergeStrategy'
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
export const setMergeStrategy = <T extends Object>(
	obj: T,
	strategy: ArrayLiteralMergeStrategyType
): T => {
	Reflect.defineMetadata(ArrayLiteralMergeStrategy, strategy, obj)
	return obj
}

/**
 * Retrieve merge strategy for given object.
 * @param obj Merge object in question.
 * @default {@link ArrayLiteralMergeStrategyType.APPEND}
 */
export const getMergeStrategy = <T extends Object>(
	obj: T
): ArrayLiteralMergeStrategyType => {
	try {
		return (
			(Reflect.getMetadata(
				ArrayLiteralMergeStrategy,
				obj
			) as ArrayLiteralMergeStrategyType) ??
			ArrayLiteralMergeStrategyType.APPEND
		)
	} catch {
		return ArrayLiteralMergeStrategyType.APPEND
	}
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
	value: ArrayLiteralMergeValue
) {
	const literalElements = arrayLiteral.getElements()

	value.forEach((mergeElement, idx) => {
		let existingElement: Expression | undefined = literalElements[idx]
		let existingType: SyntaxKind | undefined = existingElement?.getKind?.()
		const mergeStrategy = getMergeStrategy(mergeElement as Object)

		// If strategy is overwrite, remove existing element.
		if (
			existingElement &&
			mergeStrategy === ArrayLiteralMergeStrategyType.OVERWRITE
		) {
			arrayLiteral.removeElement(idx)
			existingElement = undefined
			existingType = undefined
		}

		const mergeIsObj = is.plainObject(mergeElement)
		const mergeIsArray = is.array(mergeElement)

		const mergeIsCollection = mergeIsObj || mergeIsArray

		// If collection and is a new element or strategy is append,
		// use a new element to merge into.
		if (
			(mergeIsCollection && !existingType) ||
			(mergeIsCollection &&
				mergeStrategy === ArrayLiteralMergeStrategyType.APPEND)
		) {
			existingElement = arrayLiteral.addElement(
				defaultInitializerFor(mergeElement)
			)
			existingType = mergeIsObj
				? SyntaxKind.ObjectLiteralExpression
				: SyntaxKind.ArrayLiteralExpression
		}

		const existsIsObj = existingType === SyntaxKind.ObjectLiteralExpression
		const existsIsArray = existingType === SyntaxKind.ArrayLiteralExpression

		if (existsIsObj && mergeIsObj) {
			// merge object literal.
			mergeObjectLiteral(
				existingElement!.asKindOrThrow(SyntaxKind.ObjectLiteralExpression),
				mergeElement
			)
		} else if (existsIsArray && mergeIsArray) {
			// merge array literal.
			mergeArrayLiteral(
				existingElement!.asKindOrThrow(SyntaxKind.ArrayLiteralExpression),
				mergeElement
			)
		} else {
			// add scalar or write functions.
			arrayLiteral.addElement(convertInitializer(mergeElement))
		}
	})

	// deduplicate elements.
	return arrayLiteral.getElements().reduce((acc, curr) => {
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
			acc.push(curr as unknown as WriterFunction)
		}
		return acc
	}, [] as Array<WriterFunction | string>)
}

/**
 * Merge property assignment initializer.
 * @param propAssign {@link PropertyAssignment} to merge into.
 * @param value Value to merge with.
 */
export function mergePropertyAssignment<T extends LiteralExpressionMergeValue>(
	propAssign: PropertyAssignment,
	value: T
) {
	const valueIsObject = is.plainObject(value)
	const valueIsArray = Array.isArray(value)

	// existing object literal expression initializer, if defined.
	const initializer = propAssign.getInitializerIfKind(
		SyntaxKind.ObjectLiteralExpression
	)
	// existing array literal expression initializer, if defined.
	const arrayInitializer = propAssign.getInitializerIfKind(
		SyntaxKind.ArrayLiteralExpression
	)

	if (initializer && valueIsObject) {
		// merge object value -> object initializer.
		mergeObjectLiteral(
			initializer,
			value as ObjectLiteralMergeSchema<Record<string, any>>
		)
	} else if (arrayInitializer && valueIsArray) {
		// merge array value into array initializer.
		const uniqueArray = mergeArrayLiteral(
			arrayInitializer,
			value as ArrayLiteralMergeValue
		)
		// set merge array
		propAssign.setInitializer(`[${uniqueArray.join(', ')}]`)
	} else {
		// create or override initializer (missing or type mismatch)
		propAssign.setInitializer(
			convertInitializer(value as ObjectLiteralMergeObjectValue)
		)
	}
}

/**
 * Deeply merge `obj` into an existing {@link ObjectLiteralExpression}
 * @param expression {@link ObjectLiteralExpression} to merge into.
 * @param obj Input merge object.
 */
export function mergeObjectLiteral<T extends Record<string, any>>(
	expression: ObjectLiteralExpression,
	obj: Schema<T, LiteralExpressionMergeValue>
): ObjectLiteralExpression {
	for (const [key, value] of Object.entries(obj)) {
		// existing assignment if defined.
		const propAssign = expression.getProperty(key) as
			| PropertyAssignment
			| undefined

		const defaultInit = is.plainObject(value)
			? '{}'
			: is.array(value)
			? '[]'
			: undefined
		if (propAssign && propAssign.getKind() === SyntaxKind.PropertyAssignment) {
			// merge existing property assignment.
			mergePropertyAssignment(propAssign, value as LiteralExpressionMergeValue)
		} else if (defaultInit) {
			// if collection-type, add default initializer and merge into that.
			mergePropertyAssignment(
				expression.addPropertyAssignment({
					name: key,
					initializer: defaultInit,
				}),
				value as LiteralExpressionMergeValue
			)
		} else {
			// otherwise add primitives / writer functions as is.
			expression.addPropertyAssignment({
				name: key,
				initializer: convertInitializer(value as ObjectLiteralMergeObjectValue),
			})
		}
	}
	return expression
}
