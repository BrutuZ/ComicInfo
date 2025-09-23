<script setup lang="ts">
import type { SourceInfo } from '@/types'

const props = defineProps<{ source: SourceInfo }>()
</script>

<template>
  <a :href="props.source.url" target="_blank">
    <img
      class="source-icons"
      :title="props.source.name"
      :src="`/assets/${props.source.icon}`"
      data-bs-toggle="tooltip"
      data-bs-placement="bottom"
    />
  </a>
</template>
