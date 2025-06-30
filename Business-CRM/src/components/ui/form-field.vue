<script setup lang="ts">
import type { Component } from 'vue'
import { Field } from 'vee-validate'

interface FormFieldProps {
  name: string
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  as?: string | Component
}

withDefaults(defineProps<FormFieldProps>(), {
  type: 'text',
  as: 'input'
})
</script>

<template>
  <Field
    v-slot="{ field, meta, errors }"
    :name="name"
    :label="label"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :as="as"
  >
    <div class="space-y-2">
      <slot
        :field="field"
        :meta="meta"
        :errors="errors"
        :error="errors[0]"
        :valid="meta.valid"
        :touched="meta.touched"
      />
    </div>
  </Field>
</template>