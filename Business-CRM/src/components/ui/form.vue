<script setup lang="ts">
import { Form as VeeForm } from 'vee-validate'
import type { ZodSchema } from 'zod'

interface FormProps {
  validationSchema?: ZodSchema
  initialValues?: Record<string, any>
  keepValues?: boolean
}

defineProps<FormProps>()
</script>

<template>
  <VeeForm
    v-slot="slotProps"
    v-bind="$attrs"
  >
    <form @submit="slotProps.handleSubmit">
      <slot v-bind="slotProps" />
    </form>
  </VeeForm>
</template>