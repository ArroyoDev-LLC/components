import { describe, it, expect, vi } from 'vitest'
import {
	isCreateOp,
	isUpdateOp,
	isTimestampUpdateOp,
	type FbDocumentChange,
} from '../src' // Adjust the import path

class MockTimestamp {
	constructor(private date: Date) {}

	isEqual(other: MockTimestamp) {
		return this.date.getTime() === other.date.getTime()
	}
}

describe('Firebase Utils', () => {
	describe('isCreateOp', () => {
		it('returns true for create operation', () => {
			const mockChange = {
				before: { exists: false },
				after: { exists: true },
			} as FbDocumentChange
			expect(isCreateOp(mockChange)).toBe(true)
		})

		it('returns false for update operation', () => {
			const mockChange = {
				before: { exists: true },
				after: { exists: true },
			} as FbDocumentChange
			expect(isCreateOp(mockChange)).toBe(false)
		})
	})

	describe('isUpdateOp', () => {
		it('returns true for update operation', () => {
			const mockChange = {
				before: { exists: true },
				after: { exists: true },
			} as FbDocumentChange
			expect(isUpdateOp(mockChange)).toBe(true)
		})

		it('returns false for create operation', () => {
			const mockChange = {
				before: { exists: false },
				after: { exists: true },
			} as FbDocumentChange
			expect(isUpdateOp(mockChange)).toBe(false)
		})
	})

	describe('isTimestampUpdateOp', () => {
		it('returns false if timestamps have not changed', () => {
			const sameTimestamp = new MockTimestamp(new Date())
			const mockChange = {
				before: {
					get: vi.fn(() => sameTimestamp),
				},
				after: {
					get: vi.fn(() => sameTimestamp),
				},
			} as unknown as FbDocumentChange

			expect(isTimestampUpdateOp(mockChange)).toBe(false)
		})

		it('returns true if timestamps have changed', () => {
			const timestampBefore = new MockTimestamp(new Date('2020-01-01'))
			const timestampAfter = new MockTimestamp(new Date('2021-01-01'))
			const mockChange = {
				before: {
					get: vi.fn().mockImplementation((fieldName) => {
						if (fieldName === 'created_at' || fieldName === 'updated_at')
							return timestampBefore
					}),
				},
				after: {
					get: vi.fn().mockImplementation((fieldName) => {
						if (fieldName === 'created_at' || fieldName === 'updated_at')
							return timestampAfter
					}),
				},
			} as unknown as FbDocumentChange

			expect(isTimestampUpdateOp(mockChange)).toBe(true)
		})
	})
})
