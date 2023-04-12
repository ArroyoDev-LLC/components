import { computed, defineComponent, h } from 'vue';

type HeaderNumbers = 1 | 2 | 3 | 4 | 5 | 6;
type HeaderNames = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type TextVariant = HeaderNumbers | HeaderNames | 'body';

export interface TextProps {
  variant?: TextVariant;
}

export default defineComponent<TextProps>({
  name: 'BaseText',
  setup(props, { slots }) {
    const header = computed(() => props.variant ?? 'body');
    const anchor = computed(() =>
      header.value === 'body'
        ? 'p'
        : typeof header.value === 'number'
          ? `h${header.value}`
          : header.value,
    );
    return () => h(anchor.value, {}, slots.default?.());
  },
});
