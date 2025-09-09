<template>
  <InputNumber
    :modelValue="modelValue"
    @update:modelValue="onUpdate"
    :min="0"
    :disabled="disabled || !hasPermission"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
  hasPermission: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

function onUpdate(val) {
  // Ensure number >= 0
  emit("update:modelValue", Math.max(0, Number(val) || 0));
}
</script>
