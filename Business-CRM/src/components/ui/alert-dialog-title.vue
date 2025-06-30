<script setup lang="ts">
import { AlertDialogTitle, type AlertDialogTitleProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface AlertDialogTitleCustomProps extends AlertDialogTitleProps {
  class?: string
}

const props = defineProps<AlertDialogTitleCustomProps>()
</script>

<template>
  <AlertDialogTitle
    :class="cn('text-lg font-semibold', props.class)"
    v-bind="props"
  >
    <slot />
  </AlertDialogTitle>
</template>