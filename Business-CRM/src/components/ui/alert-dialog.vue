<script setup lang="ts">
import {
  AlertDialogRoot,
  type AlertDialogEmits,
  type AlertDialogProps,
} from 'radix-vue'

const props = defineProps<AlertDialogProps>()
const emits = defineEmits<AlertDialogEmits>()
</script>

<template>
  <AlertDialogRoot
    v-bind="props"
    @update:open="emits('update:open', $event)"
  >
    <slot />
  </AlertDialogRoot>
</template>