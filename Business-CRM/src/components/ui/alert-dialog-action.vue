<script setup lang="ts">
import { AlertDialogAction, type AlertDialogActionProps } from 'radix-vue'

const props = defineProps<AlertDialogActionProps>()
</script>

<template>
  <AlertDialogAction v-bind="props" as-child>
    <slot />
  </AlertDialogAction>
</template>