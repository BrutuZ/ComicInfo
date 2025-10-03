<script setup lang="ts">
import EntryCard from '@/components/EntryCard.vue'
import FormSearch from '@/components/FormSearch.vue'
import FormURL from '@/components/FormURL.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import NavTab from '@/components/NavTab.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { bsTooltips, DEV } from '@/main'
import { MangaInfo, type ParserOptions } from '@/types'
import { onMounted, ref } from 'vue'

const mangaEntries = ref<MangaInfo[]>([])
const xml = ref('')
const activeTab = ref<'url' | 'search' | 'file'>('search')
onMounted(() => bsTooltips().create())
const options = ref({
  url: DEV ? 'https://mangabaka.dev/84926' : '',
  parserParams: { english: true, groupTags: true, proxy: false } as ParserOptions,
})
</script>

<template>
  <TransitionGroup name="fade-down">
    <ModalDialog v-if="xml" v-model:xml="xml" />
  </TransitionGroup>

  <ul id="nav-bar" class="nav nav-tabs mt-2">
    <NavTab v-model:active-tab="activeTab" tab-name="search">Search</NavTab>
    <NavTab v-model:active-tab="activeTab" tab-name="url">URL</NavTab>
    <NavTab v-model:active-tab="activeTab" tab-name="file" disabled>File</NavTab>
  </ul>

  <div class="mb-3 border rounded-bottom p-2">
    <SettingsPanel v-model:options="options" />
    <FormSearch
      v-if="activeTab == 'search'"
      v-model:options="options"
      v-model:manga-entries="mangaEntries"
    />
    <FormURL
      v-if="activeTab == 'url'"
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
