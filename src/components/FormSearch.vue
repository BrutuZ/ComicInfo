<script setup lang="ts">
import { capitalizeTags, unique } from '@/main'
import { MangaBaka } from '@/parsers/Mangabaka'
import { MangaInfo, type ParserOptions, type SearchResult } from '@/types'
import { ref } from 'vue'

const mangaEntries = defineModel<MangaInfo[]>('mangaEntries', { default: [] })
const options = defineModel<{ url: string; parserParams: ParserOptions }>('options', {
  required: true,
})
const query = ref('')
const searching = ref(false)
const results = ref<SearchResult[]>([])
const searchers = [MangaBaka]
const showResults = ref(false)

const search = () => {
  results.value = []
  if (!query.value) return
  searching.value = true
  showResults.value = true
  searchers[0]('', options.value.parserParams)
    .search(query.value)
    .then(sr => {
      results.value = sr
    })
    .finally(() => (searching.value = false))
}

const addResult = (manga: MangaInfo) => {
  showResults.value = false
  mangaEntries.value.unshift(manga)
  results.value = results.value.filter(e => e.parsed.uuid != manga.uuid)
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
          @focusin="showResults = !query == false && results.length > 0"
          :disabled="searching"
        />
        <button
          class="btn btn-outline-success"
          type="button"
          id="button-search"
          title="Search"
          @click="search"
          :disabled="searching || !query"
        >
          <i class="bi bi-search" v-if="!searching"></i>
          <template v-else>
            <span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
            <span class="visually-hidden" role="status">Searching...</span>
          </template>
        </button>
      </span>
    </div>
  </form>
  <Transition name="unfold">
    <ul id="search-results" class="ps-0" v-show="showResults">
      <li v-if="results.length == 0 || searching" class="p-3 text-center" style="cursor: default">
        <h4>{{ searching ? 'Searching...' : 'No Results' }}</h4>
      </li>
      <li
        v-for="manga in results"
        :key="manga.parsed.uuid"
        class="dropdown-item d-flex"
        @click="addResult(manga.parsed)"
      >
        <img :src="manga.raw.cover.small || manga.raw.cover.default" class="p-2" />
        <span>
          [{{ manga.raw.year }}] {{ manga.raw.title }}
          <br />
          <i>{{ manga.parsed.status }} | </i>
          <small>{{
            unique([...(manga.raw.artists || []), ...(manga.raw.authors || [])]).join(', ')
          }}</small>
          <br />
          <small>{{
            (manga.raw.genres || ['Unknown Genres'])
              .map(g => capitalizeTags(g))
              .sort()
              .slice(0, 6)
              .join(', ')
          }}</small>
        </span>
      </li>
    </ul>
  </Transition>
</template>

<style lang="scss">
#search-results {
  cursor: pointer;
  > li {
    overflow: clip;
  }
  & img {
    height: calc(($font-size-base + $form-text-margin-top) * 4);
  }
}

.unfold-move, /* apply transition to moving elements */
.unfold-enter-active,
.unfold-leave-active {
  transition: all 0.5s ease;
}

.unfold-enter-from,
.unfold-leave-to {
  opacity: 0;
  transform: scaleY(15%);
  translate: 0 -50%;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.unfold-leave-active {
  position: absolute;
}
</style>
