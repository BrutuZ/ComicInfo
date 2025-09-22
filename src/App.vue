<script setup lang="ts">
import EntryCard from '@/components/EntryCard.vue'
import FormURL from '@/components/FormURL.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { bsTooltips } from '@/main'
import { MangaInfo } from '@/types'
import { onMounted, ref } from 'vue'
import FormSearch from './components/FormSearch.vue'
import NavTab from './components/NavTab.vue'

const DEV = import.meta.env.DEV

const mangaEntries = ref<MangaInfo[]>([])
const xml = ref('')
const activeTab = ref<'url' | 'search' | 'file'>('url')
onMounted(() => bsTooltips().create())
</script>

<template>
  <TransitionGroup name="entry-cards">
    <ModalDialog v-if="xml" v-model:xml="xml" />
  </TransitionGroup>

  <ul id="nav-bar" class="nav nav-tabs mt-2">
    <NavTab v-model:active-tab="activeTab" tab-name="url">URL</NavTab>
    <NavTab v-model:active-tab="activeTab" tab-name="search">Search</NavTab>
    <NavTab v-model:active-tab="activeTab" tab-name="file">File</NavTab>
  </ul>

  <div class="mb-3 border rounded-bottom p-2">
    <FormURL v-if="activeTab == 'url'" :DEV v-model:manga-entries="mangaEntries" />
    <FormSearch v-else-if="activeTab == 'search'" :DEV v-model:manga-entries="mangaEntries" />
  </div>

  <TransitionGroup name="entry-cards">
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
