<script setup lang="ts">
import { computed } from 'vue';
import type { TextPreset, TextVariant } from './types.ts';

export interface TextProps {
  variant?: TextVariant;
  preset?: TextPreset;
  light?: boolean;
}

const props = withDefaults(defineProps<TextProps>(), { variant: 'body' });

const anchor = computed(() =>
  props.variant === 'body'
    ? 'p'
    : typeof props.variant === 'number'
      ? `h${props.variant}`
      : props.variant,
);

const baseStyles = computed(() => ({
  'text--link': props.preset === 'link',
  'text--error': props.preset === 'error',
  'text--success': props.preset === 'success',
  'text--light': props.light,
}));
</script>

<template>
  <component
    :is="anchor"
    :class="['text', baseStyles]"
  >
    <slot />
  </component>
</template>

<style scoped>
.text {
}

.text--link {
	color: #42a5f5;
	text-decoration: underline;
}
.text--error {
	color: #ff0000;
}
.text--success {
	color: #00ff00;
}
.text--light {
	color: #f5f5f5;
}
</style>
