<script setup lang="ts">
import { capitalizeTags, unique } from '@/main'
import { MangaBaka } from '@/parsers/Mangabaka'
import { MangaInfo, type ParserOptions, type SearchResult } from '@/types'
import { ref } from 'vue'

const mangaEntries = defineModel<MangaInfo[]>('mangaEntries', { default: [] })
defineProps<{
  DEV: boolean
}>()
const query = ref('')
const results = ref<SearchResult[]>([])
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
      :key="manga.parsed.uuid"
      class="dropdown-item d-flex"
      @click="mangaEntries.push(manga.parsed)"
    >
      <img :src="manga.raw.cover.small || manga.raw.cover.default" class="p-2" />
      <span>
        {{ manga.raw.title }} ({{ manga.raw.year }}) <i>{{ manga.parsed.status }}</i
        ><br />
        <small>{{ unique([...manga.raw.artists, ...manga.raw.authors]).join(', ') }}</small
        ><br />
        <small>{{
          (manga.raw.genres || ['Unknown Genres'])
            .map(g => capitalizeTags(g))
            .sort()
            .join(', ')
        }}</small>
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
