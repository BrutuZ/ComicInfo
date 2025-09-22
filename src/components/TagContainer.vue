<script setup lang="ts">
import { ref } from 'vue'

const accordion = ref(false)
</script>

<template>
  <div class="accordion mb-3">
    <div class="accordion-item">
      <small class="accordion-header" :class="{ 'mb-2': accordion }">
        <button
          class="accordion-button p-1"
          :class="{ collapsed: !accordion }"
          type="button"
          :aria-expanded="accordion"
          @click="accordion = !accordion"
        >
          Genres Buttons
        </button>
      </small>
      <TransitionGroup name="entry-cards">
        <div v-if="accordion" class="accordion-collapse collapse show mt-2">
          <slot />
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
