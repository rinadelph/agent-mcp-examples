<script setup lang="ts">
import { DropdownMenuSeparator, type DropdownMenuSeparatorProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface DropdownMenuSeparatorCustomProps extends DropdownMenuSeparatorProps {
  class?: string
}

const props = defineProps<DropdownMenuSeparatorCustomProps>()
</script>

<template>
  <DropdownMenuSeparator
    v-bind="props"
    :class="cn('-mx-1 my-1 h-px bg-muted', props.class)"
  />
</template>