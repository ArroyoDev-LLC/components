<script setup lang="ts">
import PrimeButton from 'primevue/button'

export interface ButtonProps {
	size?: 'small' | 'large'
	variant: 'primary' | 'outline' | 'text'
}

const props = withDefaults(defineProps<ButtonProps>(), {
	size: 'small',
	variant: 'primary',
})
</script>

<template>
	<PrimeButton v-bind="($attrs, props)" />
</template>
