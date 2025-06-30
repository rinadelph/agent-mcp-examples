<script setup lang="ts">
import {
  DropdownMenuItem,
  type DropdownMenuItemEmits,
  type DropdownMenuItemProps,
} from 'radix-vue'
import { cn } from '@/lib/utils'

interface DropdownMenuItemCustomProps extends DropdownMenuItemProps {
  class?: string
  inset?: boolean
}

const props = defineProps<DropdownMenuItemCustomProps>()
const emits = defineEmits<DropdownMenuItemEmits>()
</script>

<template>
  <DropdownMenuItem
    v-bind="props"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      props.class
    )"
    @select="emits('select', $event)"
  >
    <slot />
  </DropdownMenuItem>
</template>