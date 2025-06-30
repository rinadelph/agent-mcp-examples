<script setup lang="ts">
import { cn } from '@/lib/utils'

interface CardProps {
  class?: string
}

defineProps<CardProps>()
</script>

<template>
  <div
    :class="cn(
      'rounded-lg border border-gray-200 bg-white text-gray-900 shadow',
      $props.class
    )"
  >
    <slot />
  </div>
</template>