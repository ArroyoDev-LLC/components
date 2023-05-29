import {
	type ObjectLiteralExpression,
	Project,
	type SourceFile,
	SyntaxKind,
} from 'ts-morph'
import { beforeEach, describe, expect, test } from 'vitest'
import {
	ArrayLiteralMergeStrategy,
	ArrayLiteralMergeStrategyType,
	getMergeStrategy,
	mergeObjectLiteral,
	setMergeStrategy,
} from '..'

describe('mergeObjectLiteral', () => {
	interface MergeObjectLiteralContext {
		project: Project
		sourceFile: SourceFile
		testObj: ObjectLiteralExpression
	}

	interface TestObj {
		[key: string | symbol | number]: any
		scalar?: number
		topLevelArray?: number[]
		secondLevel?: {
			secondLevelArray?: [{ nestedKey?: string }]
			secondLevelScalar?: number
		}
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
		console.log(ctx.sourceFile.getFullText())
		expect(ctx.sourceFile.getFullText()).toMatchInlineSnapshot(`
			"const testObj = { scalar: 1, topLevelArray: [1, 2,  3], secondLevel: { secondLevelArray: [{nestedKey: '1'},  {
			            nestedKey: \\"2\\"
			        }], secondLevelScalar: \\"override\\",
			    secondLevelWriter: anotherCallable(),
			    secondLevelNew: \\"newValue\\",
			    thirdLevel: {
			        thirdLevelArray: [\\"a\\"]
			    }
			},
			    newScalar: \\"value\\",
			    topLevelWriter: aCallable()
			};"
		`)
	})

	testx('should create missing intermediary objects', async (ctx) => {
		mergeObjectLiteral<TestObj>(ctx.testObj, {
			newLevel: {
				key: 'value',
				arrayKey: ['a', 'b'],
				nested: {
					nestedArrayObj: ['a', 'b', { key: 'c' }],
				},
			},
		})
		expect(ctx.sourceFile.getFullText()).toMatchInlineSnapshot(`
			"const testObj = { scalar: 1, topLevelArray: [1,2], secondLevel: { secondLevelArray: [{nestedKey: '1'}], secondLevelScalar: 1 },
			    newLevel: {
			        key: \\"value\\",
			        arrayKey: [\\"a\\",  \\"b\\"],
			        nested: {
			            nestedArrayObj: [\\"a\\",  \\"b\\",  {
			                                key: \\"c\\"
			                            }]
			        }
			    }
			};"
		`)
	})

	testx(
		'should create missing intermediary objects with writer functions.',
		async (ctx) => {
			mergeObjectLiteral(ctx.testObj, {
				newLevel: {
					key: 'value',
					writerKey: (writer) => writer.write(`"writerValue"`),
					arrayKey: ['a', (writer) => writer.write(`"b"`)],
					nested: {
						nestedArrayObj: [
							'a',
							'b',
							{ key: (writer) => writer.write('callable()') },
						],
					},
				},
			})
			expect(ctx.sourceFile.getFullText()).toMatchInlineSnapshot(`
				"const testObj = { scalar: 1, topLevelArray: [1,2], secondLevel: { secondLevelArray: [{nestedKey: '1'}], secondLevelScalar: 1 },
				    newLevel: {
				        key: \\"value\\",
				        writerKey: \\"writerValue\\",
				        arrayKey: [\\"a\\",  \\"b\\"],
				        nested: {
				            nestedArrayObj: [\\"a\\",  \\"b\\",  {
				                                key: callable()
				                            }]
				        }
				    }
				};"
			`)
		}
	)

	testx('should concat unique arrays', async (ctx) => {
		mergeObjectLiteral(ctx.testObj, {
			topLevelArray: [1, 2, 3, 4],
		})
		expect(ctx.sourceFile.getFullText()).toMatchInlineSnapshot(
			'"const testObj = { scalar: 1, topLevelArray: [1, 2,  3,  4], secondLevel: { secondLevelArray: [{nestedKey: \'1\'}], secondLevelScalar: 1 } };"'
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
			"const testObj = {
			    scalar: 1, topLevelArray: [1, 2], secondLevel: {
			        secondLevelArray: [{ nestedKey: '1' }, {
			            nestedKey: \\"2\\"
			        }], secondLevelScalar: 1
			    }
			};
			"
		`)
	})

	testx('should apply overwrite array merge strategies', async (ctx) => {
		const obj = setMergeStrategy(
			{ nestedKey: '-1' },
			ArrayLiteralMergeStrategyType.OVERWRITE
		)
		mergeObjectLiteral<TestObj>(ctx.testObj, {
			secondLevel: {
				secondLevelArray: [obj, { nestedKey: 'new' }],
			},
		})
		expect(getMergeStrategy(obj)).toBe(ArrayLiteralMergeStrategyType.OVERWRITE)
		expect(ctx.sourceFile.getFullText()).toMatchInlineSnapshot(`
			"const testObj = { scalar: 1, topLevelArray: [1,2], secondLevel: { secondLevelArray: [{
			            nestedKey: \\"-1\\"
			        }, 
			            {
			                nestedKey: \\"new\\"
			            }], secondLevelScalar: 1 } };"
		`)
	})

	testx('should apply merge array merge strategies', async (ctx) => {
		const obj = setMergeStrategy(
			{ newKey: 'newValueOn1' },
			ArrayLiteralMergeStrategyType.MERGE
		)
		mergeObjectLiteral<TestObj>(ctx.testObj, {
			secondLevel: {
				secondLevelArray: [obj, { nestedKey: 'new' }],
			},
		})
		expect(getMergeStrategy(obj)).toBe(ArrayLiteralMergeStrategyType.MERGE)
		expect(ctx.sourceFile.getFullText()).toMatchInlineSnapshot(`
			"const testObj = { scalar: 1, topLevelArray: [1,2], secondLevel: { secondLevelArray: [{nestedKey: '1',
			            newKey: \\"newValueOn1\\"
			        }, 
			            {
			                nestedKey: \\"new\\"
			            }], secondLevelScalar: 1 } };"
		`)
	})
})
