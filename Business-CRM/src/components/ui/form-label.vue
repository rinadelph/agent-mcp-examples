<script setup lang="ts">
import { Label, type LabelProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface FormLabelProps extends LabelProps {
  class?: string
  required?: boolean
}

const props = defineProps<FormLabelProps>()
</script>

<template>
  <Label
    :class="cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      props.class
    )"
    v-bind="props"
  >
    <slot />
    <span v-if="required" class="text-destructive ml-1">*</span>
  </Label>
</template>