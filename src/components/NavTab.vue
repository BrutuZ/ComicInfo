<script setup lang="ts">
import type { FormTabs } from '@/types'

const activeTab = defineModel<FormTabs>('activeTab', { default: 'URL' })
defineProps(['tabName'])
</script>

<template>
  <li class="nav-item">
    <button
      @click="activeTab = tabName"
      class="nav-link"
      :class="{ active: activeTab == tabName }"
      :aria-current="activeTab == tabName && 'page'"
    >
      <slot />
    </button>
  </li>
</template>
