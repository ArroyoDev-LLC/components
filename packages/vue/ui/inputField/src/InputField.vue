<script setup lang="ts">
import InputText from 'primevue/inputtext';
import BaseText from '@/components/BaseText.vue';
export interface InputField {
  id?: string;
  label?: string;
  placeholder?: string;
  initialValue?: any;
  hideLabel?: boolean;
  type: 'text' | 'password' | 'email' | 'number' | 'date' | 'time';
  disabled?: boolean;
  modelValue: any;
}

export interface InputFieldEmits {
  (e: 'update:modelValue', value: unknown): void;
}

const emits = defineEmits<InputFieldEmits>();

const props = withDefaults(defineProps<InputField>(), {
  hideLabel: true,
  type: 'text',
});
</script>

<template>
  <div>
    <label
      v-if="!placeholder && !label"
      class="sr-only"
    >{{ label }}</label>
    <slot name="label">
      <BaseText v-if="label && !placeholder">
        {{ label }}
      </BaseText>
    </slot>
    <InputText
      v-bind="$attrs"
      :id="id"
      :class="['default']"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<style scoped>
.default {
    @apply border-accent-100 rounded text-black w-full;
}
.default:not(:disabled):hover {
    @apply drop-shadow-md;
}
.default:focus {
    @apply border-primary-100 caret-primary-100;
}
.default:disabled {
    @apply bg-accent-100;
}
</style>
