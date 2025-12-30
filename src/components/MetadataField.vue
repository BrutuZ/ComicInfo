<script setup lang="ts">
// import { dateToString } from '@/main'
import { dateToString as dateField, listField } from '@/main'
import type { MetadataField, TachiStatus } from '@/types'

const STATUSES: TachiStatus[] = [
  'Unknown',
  'Ongoing',
  'Completed',
  'Publishing finished',
  'Cancelled',
  'On hiatus',
  'Licensed',
]

//// @ts-expect-error  Typing snafu
const [modelValue, modelModifiers] = defineModel({
  required: true,
  get(value: string | string[] | Date): string {
    // Data to Field
    if (typeof value == 'string') return value
    if (['undefined', 'null'].includes(String(value))) return ''
    if (modelModifiers.date && 'getDate' in value && !('join' in value)) return dateField(value)
    if (modelModifiers.list && 'join' in value && !('getDate' in value)) return listField(value)
    return String(value)
  },
  set(value: string) {
    // Field to Data
    if (modelModifiers.list) return listField(value)
    if (modelModifiers.date) return dateField(value)
    return value
  },
})
const props = withDefaults(defineProps<MetadataField>(), { selected: 'Unknown', type: 'text' })
// const { msg = 'hello', labels = ['one', 'two'] } = defineProps<MetadataField>()
</script>

<template>
  <div
    class="form-floating"
    :class="['date', 'status'].includes(props.type) ? 'flex-grow-1' : 'mb-3'"
  >
    <textarea
      v-if="props.type == 'textarea'"
      class="form-control"
      :class="'rows-' + props.rows"
      v-model.lazy="modelValue"
      placeholder=""
    ></textarea>
    <select
      v-else-if="props.type == 'status'"
      class="form-select text-capitalize"
      v-model.lazy="modelValue"
      placeholder=""
    >
      <option
        v-for="option in STATUSES"
        :key="option.toLowerCase().replace(' ', '-')"
        placeholder=""
      >
        {{ option }}
      </option>
    </select>
    <input
      v-else
      class="form-control"
      :type="props.type"
      v-model.lazy.trim="modelValue"
      placeholder=""
    />
    <label v-if="$slots.default">
      <slot />
    </label>
  </div>
</template>

<style lang="scss">
$input-row: add($input-font-size, $input-padding-y, $input-line-height);

textarea.form-control {
  resize: none !important;
}
textarea.form-control.rows-3 {
  height: calc((3 * $input-row) + $form-floating-label-height);
}
textarea.form-control.rows-5 {
  height: calc((5 * $input-row) + $form-floating-label-height);
}
.input-group-text {
  max-width: 50%;
  text-wrap-mode: wrap !important;
}
</style>
