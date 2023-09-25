import is from '@sindresorhus/is'
import {
	type ArrayLiteralExpression,
	type Expression,
	type ObjectLiteralExpression,
	type PropertyAssignment,
	SyntaxKind,
	type WriterFunction,
} from 'ts-morph'
import { type Schema } from 'type-fest'
import {
	convertInitializer,
	defaultInitializerFor,
	isExpressionEqual,
} from './expressions'
import { ArrayLiteralMergeStrategyType, getMergeStrategy } from './strategy'
import {
	type ArrayLiteralMergeValue,
	type LiteralExpressionMergeValue,
	type ObjectLiteralMergeObjectValue,
	type ObjectLiteralMergeSchema,
} from './types'

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
	value: ArrayLiteralMergeValue,
) {
	const literalElements = arrayLiteral.getElements()

	value.forEach((mergeElement, idx) => {
		let existingElement: Expression | undefined = literalElements[idx]
		let existingType: SyntaxKind | undefined = existingElement?.getKind?.()
		const mergeStrategy = getMergeStrategy(mergeElement as object)

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
				defaultInitializerFor(mergeElement),
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
				mergeElement,
			)
		} else if (existsIsArray && mergeIsArray) {
			// merge array literal.
			mergeArrayLiteral(
				existingElement!.asKindOrThrow(SyntaxKind.ArrayLiteralExpression),
				mergeElement,
			)
		} else {
			// add scalar or write functions.
			arrayLiteral.addElement(convertInitializer(mergeElement))
		}
	})

	// deduplicate elements.
	return arrayLiteral.getElements().reduce(
		(acc, curr) => {
			// cannot test equality on writer functions.
			if (!is.function_(curr)) {
				const idx = acc.findIndex((item) =>
					is.function_(item) ? false : isExpressionEqual(curr, item),
				)
				if (idx === -1) {
					// convert any expression objects to raw text.
					acc.push(is.string(curr) ? curr : curr.getFullText())
				}
			} else {
				acc.push(curr as unknown as WriterFunction)
			}
			return acc
		},
		[] as Array<WriterFunction | string>,
	)
}

/**
 * Merge property assignment initializer.
 * @param propAssign {@link PropertyAssignment} to merge into.
 * @param value Value to merge with.
 */
export function mergePropertyAssignment<T extends LiteralExpressionMergeValue>(
	propAssign: PropertyAssignment,
	value: T,
) {
	const valueIsObject = is.plainObject(value)
	const valueIsArray = Array.isArray(value)

	// existing object literal expression initializer, if defined.
	const initializer = propAssign.getInitializerIfKind(
		SyntaxKind.ObjectLiteralExpression,
	)
	// existing array literal expression initializer, if defined.
	const arrayInitializer = propAssign.getInitializerIfKind(
		SyntaxKind.ArrayLiteralExpression,
	)

	if (initializer && valueIsObject) {
		// merge object value -> object initializer.
		mergeObjectLiteral(
			initializer,
			value as ObjectLiteralMergeSchema<Record<string, any>>,
		)
	} else if (arrayInitializer && valueIsArray) {
		// merge array value into array initializer.
		const uniqueArray = mergeArrayLiteral(
			arrayInitializer,
			value as ArrayLiteralMergeValue,
		)
		// set merge array
		propAssign.setInitializer(`[${uniqueArray.join(', ')}]`)
	} else {
		// create or override initializer (missing or type mismatch)
		propAssign.setInitializer(
			convertInitializer(value as ObjectLiteralMergeObjectValue),
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
	obj: Schema<T, LiteralExpressionMergeValue>,
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
				value as LiteralExpressionMergeValue,
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
