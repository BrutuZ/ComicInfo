<script setup lang="ts">
import { ref } from 'vue'

const genres = defineModel<string[]>()
const collapsed = ref(true)
</script>

<template>
  <span class="tags-container" :class="{ collapsed: collapsed }">
    <span class="d-flex flex-wrap gap-2 justify-content-evenly mx-2 mb-2">
      <span
        v-for="genre in genres"
        :key="genre"
        class="tag-badge badge rounded-pill text-bg-secondary"
        @click="genres = genres?.filter(g => g != genre)"
      >
        {{ genre }}
        <i class="tab-button bi bi-x"></i>
      </span>
    </span>
  </span>
  <i
    class="tags-resizer text-center bi"
    :class="{ 'bi-arrow-bar-down': collapsed, 'bi-arrow-bar-up': !collapsed }"
    @click="collapsed = !collapsed"
  ></i>
</template>

<style lang="scss">
.tags-container {
  transition: max-height 0.3s ease-in-out;
  max-height: 150vh;
  overflow: hidden;
  // overflow: auto;
}
.tags-container.collapsed {
  max-height: calc(($spacer + $badge-font-size) * 3);
}
.tags-resizer {
  cursor: pointer;
}
</style>
