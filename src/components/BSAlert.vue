<script setup lang="ts">
import { Alert } from 'bootstrap'
import { onMounted, type PropType } from 'vue'

type alertStyles = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
const props = defineProps({
  duration: { type: Number, default: 3000 },
  alertStyle: { type: String as PropType<alertStyles>, default: 'primary' },
})
const alertRef = defineModel<boolean | { element: Element; alert: Alert }>()

onMounted(() => {
  document.querySelectorAll('[role="alert"]').forEach(el => {
    if (el) {
      alertRef.value = { element: el, alert: Alert.getOrCreateInstance(el) }
      // el.addEventListener('closed.bs.alert', () => (alertToggle.value = false))
    }
  })
})

setTimeout(() => {
  if (typeof alertRef.value == 'object') alertRef.value.alert.close()
  alertRef.value = undefined
}, props.duration)
</script>

<template>
  <TransitionGroup name="fade-down">
    <div
      :class="`alert alert-${props.alertStyle} fixed-top align-items-center`"
      role="alert"
      style="z-index: 65535"
    >
      <slot />
    </div>
  </TransitionGroup>
</template>
