<script setup lang="ts">
const genres = defineModel<string[]>()
</script>

<template>
  <span class="tags-container d-flex flex-wrap gap-2 justify-content-evenly mx-2 mb-2">
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
</template>
