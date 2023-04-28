import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Text from '../src/Text.vue'

describe('Text', () => {
	it('renders as expected.', async () => {
		const mnt = mount(Text)
		expect(mnt.element).toMatchSnapshot()
	})

	it.each([1, 2, 3, 4, 5, 6, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])(
		'renders all variants as expected.',
		async (variant) => {
			const mnt = mount(Text, { props: { variant }, slots: { default: 'Hi' } })
			expect(mnt.element).toMatchSnapshot()
		}
	)
})
