<script setup lang="ts">
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface DropdownMenuLabelCustomProps extends DropdownMenuLabelProps {
  class?: string
  inset?: boolean
}

const props = defineProps<DropdownMenuLabelCustomProps>()
</script>

<template>
  <DropdownMenuLabel
    v-bind="props"
    :class="cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      props.class
    )"
  >
    <slot />
  </DropdownMenuLabel>
</template>