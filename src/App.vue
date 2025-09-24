<script setup lang="ts">
import EntryCard from '@/components/EntryCard.vue'
import FormSearch from '@/components/FormSearch.vue'
import FormURL from '@/components/FormURL.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import NavTab from '@/components/NavTab.vue'
import { bsTooltips } from '@/main'
import { MangaInfo, type FormTabs, type ParserOptions } from '@/types'
import { onMounted, ref } from 'vue'

const DEV = import.meta.env.DEV

const mangaEntries = ref<MangaInfo[]>([])
const xml = ref('')
const activeTab = ref<FormTabs>('URL')
onMounted(() => bsTooltips().create())
const options = ref({
  url: DEV ? 'https://mangabaka.dev/84926' : '',
  parserParams: { english: true, proxy: false } as ParserOptions,
})

const tabs = { URL: FormURL, Search: FormSearch, File: FormURL }
</script>

<template>
  <TransitionGroup name="entry-cards">
    <ModalDialog v-if="xml" v-model:xml="xml" />
  </TransitionGroup>

  <ul id="nav-bar" class="nav nav-tabs mt-2">
    <NavTab v-for="(_, name) in tabs" :key="name" :tab-name="name" v-model:active-tab="activeTab">
      {{ name }}
    </NavTab>
  </ul>

  <div class="mb-3 border rounded-bottom p-2">
    <component
      :is="tabs[activeTab]"
      :DEV
      v-model:options="options"
      v-model:manga-entries="mangaEntries"
    ></component>
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
