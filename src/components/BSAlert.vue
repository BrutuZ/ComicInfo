<script setup lang="ts">
import { Alert } from 'bootstrap'
import { onMounted } from 'vue'

const props = withDefaults(defineProps<{ duration: number }>(), { duration: 1500 })
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
      class="alert alert-success fixed-top align-items-center"
      role="alert"
      style="z-index: 65535"
    >
      <slot />
    </div>
  </TransitionGroup>
</template>
