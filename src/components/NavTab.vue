<script setup lang="ts">
const activeTab = defineModel<'url' | 'search' | 'file'>('activeTab', { default: 'url' })
defineProps(['tabName', 'disabled'])
</script>

<template>
  <li class="nav-item">
    <button
      @click="activeTab = tabName"
      class="nav-link"
      :class="{ active: activeTab == tabName }"
      :aria-current="activeTab == tabName && 'page'"
      :disabled="disabled"
    >
      <slot />
    </button>
  </li>
</template>
