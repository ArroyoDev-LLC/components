import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Button from '../src/Button.vue';


describe('Button', () => {
  it('renders as expected.', async () => {
    const mnt = mount(Button);
    expect(mnt.element).toMatchSnapshot();
  });
});
