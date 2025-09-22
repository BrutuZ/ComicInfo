<script setup lang="ts">
import { MangaBaka } from '@/parsers/Mangabaka'
import { MangaInfo } from '@/types'
import { ref } from 'vue'

const mangaEntries = defineModel<MangaInfo[]>('mangaEntries', { default: [] })
defineProps<{
  DEV: boolean
}>()
const query = ref('')
const results = ref<MangaInfo[]>([])
const searchers = [MangaBaka]

const search = () => {
  console.log(query.value)
  if (!query.value) return
  searchers[0]()
    .search(query.value)
    .then(sr => (results.value = sr))
}
</script>

<template>
  <form @submit.prevent="search" novalidate>
    <div class="position-relative">
      <span class="input-group">
        <input
          v-model="query"
          type="search"
          title="Search query"
          class="form-control"
          id="search-input"
          aria-describedby="search-input"
          placeholder="One Piece"
          @submit="search"
        />
        <button
          class="btn btn-outline-success"
          type="button"
          id="button-search"
          title="Search"
          @click="search"
          :disabled="!DEV && !query"
        >
          <i class="bi bi-search"></i>
        </button>
      </span>
    </div>
  </form>
  <ul v-if="results.length" id="search-results">
    <li
      v-for="manga in results"
      :key="manga.uuid"
      class="dropdown-item d-flex"
      @click="mangaEntries.push(manga)"
    >
      <img :src="manga.cover" class="p-2" />
      <span>
        {{ manga.title }} ({{ manga.dateObj.getFullYear() }})<br />
        <small>{{ manga.artist?.join(', ') }}</small>
      </span>
    </li>
  </ul>
</template>

<style lang="scss">
#search-results {
  > li {
    overflow: clip;
  }
  & img {
    height: calc(($small-font-size + $form-text-margin-top) * 3);
  }
}
</style>
