<script setup lang="ts">
import { cn } from '@/lib/utils'

interface FormMessageProps {
  class?: string
  error?: boolean
}

const props = defineProps<FormMessageProps>()
</script>

<template>
  <p
    :class="cn(
      'text-sm font-medium',
      error ? 'text-destructive' : 'text-muted-foreground',
      props.class
    )"
  >
    <slot />
  </p>
</template>