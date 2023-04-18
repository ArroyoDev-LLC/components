<script setup lang="ts">
import { computed } from 'vue';
import type { TextVariant } from './types.ts';

export interface TextProps {
  variant?: TextVariant;
}

const props = withDefaults(defineProps<TextProps>(), { variant: 'body' });

const anchor = computed(() =>
  props.variant === 'body'
    ? 'p'
    : typeof props.variant === 'number'
      ? `h${props.variant}`
      : props.variant,
);
</script>

<template>
  <component :is="anchor">
    <slot />
  </component>
</template>
