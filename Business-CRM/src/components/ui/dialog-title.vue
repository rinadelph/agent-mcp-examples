<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface DialogTitleCustomProps extends DialogTitleProps {
  class?: string
}

const props = defineProps<DialogTitleCustomProps>()
</script>

<template>
  <DialogTitle
    :class="cn(
      'text-lg font-semibold leading-none tracking-tight',
      props.class
    )"
    v-bind="props"
  >
    <slot />
  </DialogTitle>
</template>