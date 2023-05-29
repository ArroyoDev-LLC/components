import { test, expect } from 'vitest'
import { applyOverrides } from '../src'

test('applyOverrides', async () => {
	const overridable = {
		overrides: [],
		addOverride(key, value) {
			this.overrides.push([key, value])
		},
	}
	expect(
		applyOverrides(overridable, { key: 'value', one: 'two' }).overrides
	).toEqual([
		['key', 'value'],
		['one', 'two'],
	])
})
