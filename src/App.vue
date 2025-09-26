<script setup lang="ts">
import EntryCard from '@/components/EntryCard.vue'
import FormURL from '@/components/FormURL.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { bsTooltips } from '@/main'
import { MangaInfo, type ParserOptions } from '@/types'
import { onMounted, ref } from 'vue'
import FormSearch from './components/FormSearch.vue'
import NavTab from './components/NavTab.vue'

const DEV = import.meta.env.DEV

const mangaEntries = ref<MangaInfo[]>([])
const xml = ref('')
const activeTab = ref<'url' | 'search' | 'file'>('search')
onMounted(() => bsTooltips().create())
const options = ref({
  url: DEV ? 'https://mangabaka.dev/84926' : '',
  parserParams: { english: true, proxy: false } as ParserOptions,
})
</script>

<template>
  <TransitionGroup name="fade-down">
    <ModalDialog v-if="xml" v-model:xml="xml" />
  </TransitionGroup>

  <ul id="nav-bar" class="nav nav-tabs mt-2">
    <NavTab v-model:active-tab="activeTab" tab-name="search">Search</NavTab>
    <NavTab v-model:active-tab="activeTab" tab-name="url">URL</NavTab>
    <NavTab v-model:active-tab="activeTab" tab-name="file">File</NavTab>
  </ul>

  <div class="mb-3 border rounded-bottom p-2">
    <FormSearch
      v-if="activeTab == 'search'"
      :DEV
      v-model:options="options"
      v-model:manga-entries="mangaEntries"
    />
    <FormURL
      v-if="activeTab == 'url'"
      :DEV
      v-model:options="options"
      v-model:manga-entries="mangaEntries"
    />
  </div>

  <TransitionGroup name="fade-down">
    <EntryCard
      v-for="(manga, index) in mangaEntries"
      :key="manga.uuid"
      v-model:manga="mangaEntries[index]"
      v-model:xml="xml"
    />
  </TransitionGroup>
</template>

<style lang="scss">
// ul.nav {
//   --bs-nav-link-color: var(--bs-success);
//   --bs-nav-link-hover-color: var(--bs-success-text-emphasis);
// }
</style>
