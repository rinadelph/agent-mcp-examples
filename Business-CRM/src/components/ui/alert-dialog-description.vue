<script setup lang="ts">
import { AlertDialogDescription, type AlertDialogDescriptionProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface AlertDialogDescriptionCustomProps extends AlertDialogDescriptionProps {
  class?: string
}

const props = defineProps<AlertDialogDescriptionCustomProps>()
</script>

<template>
  <AlertDialogDescription
    :class="cn('text-sm text-muted-foreground', props.class)"
    v-bind="props"
  >
    <slot />
  </AlertDialogDescription>
</template>