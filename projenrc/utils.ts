import { ObjectLiteralExpression, PropertyAssignment } from 'ts-morph'

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
