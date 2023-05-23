<script setup lang="ts">
import { computed } from 'vue'
import type { TextVariant } from './types.ts'

interface TextProps {
	variant?: TextVariant
}

const props = defineProps<TextProps>()

const variant = computed(() => {
	const el = props.variant ?? 'body'
	if (el === 'body') return 'p'
	if (typeof props.variant === 'number') return `h${props.variant}`
	return props.variant as string
})
</script>

<template>
	<component :is="variant">
		<slot />
	</component>
</template>
