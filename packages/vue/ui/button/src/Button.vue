<script setup lang="ts">
import PrimeButton from 'primevue/button';

export interface ButtonProps {
  size: 'sm' | 'md' | 'lg';
  variant: 'primary' | 'outline' | 'text';
}

const props = withDefaults(defineProps<ButtonProps>(), {
  size: 'md',
  variant: 'primary',
});
</script>

<template>
  <PrimeButton v-bind="$attrs" />
</template>
