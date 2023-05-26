import {
	type ObjectLiteralExpression,
	Project,
	type SourceFile,
	SyntaxKind,
} from 'ts-morph'
import { test, expect, describe, beforeEach } from 'vitest'
import { mergeObjectLiteral } from '../src'

describe('mergeObjectLiteral', () => {
	interface MergeObjectLiteralContext {
		project: Project
		sourceFile: SourceFile
		testObj: ObjectLiteralExpression
	}

	beforeEach<MergeObjectLiteralContext>((ctx) => {
		ctx.project = new Project()
		ctx.sourceFile = ctx.project.createSourceFile(
			'temptest.ts',
			[
				`const testObj = { scalar: 1, topLevelArray: [1,2], secondLevel: { secondLevelArray: [{nestedKey: '1'}], secondLevelScalar: 1 } };`,
			].join('\n')
		)
		ctx.testObj = ctx.sourceFile
			.getVariableDeclarationOrThrow('testObj')
			.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
	})

	const testx = test<MergeObjectLiteralContext>

	testx('should merge object literals', async (ctx) => {
		mergeObjectLiteral(ctx.testObj, {
			newScalar: 'value',
			topLevelArray: [3],
			topLevelWriter: (writer) => writer.write('aCallable()'),
			secondLevel: {
				secondLevelWriter: (writer) => writer.write('anotherCallable()'),
				secondLevelNew: 'newValue',
				secondLevelScalar: 'override',
				secondLevelArray: [{ nestedKey: '2' }],
				thirdLevel: {
					thirdLevelArray: ['a'],
				},
			},
		})
		expect(ctx.sourceFile.getFullText()).toMatchInlineSnapshot(`
			"const testObj = { scalar: 1, topLevelArray: [1, 2, 3], secondLevel: { secondLevelArray: [{nestedKey: '1'}, {\\"nestedKey\\":\\"2\\"}], secondLevelScalar: \\"override\\",
			    secondLevelWriter: anotherCallable(),
			    secondLevelNew: \\"newValue\\",
			    thirdLevel: {\\"thirdLevelArray\\":[\\"a\\"]}
			},
			    newScalar: \\"value\\",
			    topLevelWriter: aCallable()
			};"
		`)
	})

	testx('should concat unique arrays', async (ctx) => {
		mergeObjectLiteral(ctx.testObj, {
			topLevelArray: [1, 2, 3, 4],
		})
		expect(ctx.sourceFile.getFullText()).toMatchInlineSnapshot(
			'"const testObj = { scalar: 1, topLevelArray: [1, 2, 3, 4], secondLevel: { secondLevelArray: [{nestedKey: \'1\'}], secondLevelScalar: 1 } };"'
		)
	})

	testx('should concat unique arrays with objects', async (ctx) => {
		mergeObjectLiteral(ctx.testObj, {
			secondLevel: {
				secondLevelArray: [{ nestedKey: '1' }, { nestedKey: '2' }],
			},
		})
		ctx.sourceFile.formatText({
			tabSize: 2,
		})
		expect(ctx.sourceFile.getFullText()).toMatchInlineSnapshot(`
			"const testObj = { scalar: 1, topLevelArray: [1, 2], secondLevel: { secondLevelArray: [{ nestedKey: '1' }, { \\"nestedKey\\": \\"2\\" }], secondLevelScalar: 1 } };
			"
		`)
	})
})
