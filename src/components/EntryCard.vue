<script setup lang="ts">
import { MangaInfo } from '@/types'
import { ref } from 'vue'
import MetadataField from './MetadataField.vue'
import { buildXML } from './ModalDialog.vue'
import TagsButtons from './TagsButtons.vue'

// const props = defineProps<{ manga: MangaInfo }>()
// const manga = ref(props.manga)
const manga = defineModel('manga', { type: MangaInfo, default: new MangaInfo() })
const xml = defineModel('xml', { type: String, default: '' })

const coverLoaded = ref(false)
const coverEvent = () => {
  coverLoaded.value = true
}
</script>

<template>
  <div class="card mb-3">
    <div class="row g-0">
      <div v-if="manga.source" class="card-header text-center">
        <img v-if="manga.source.icon" :src="`/assets/${manga.source.icon}`" class="source-icons" />
        {{ manga.source.name }}
      </div>
      <div v-if="manga.cover" class="col-md-4 p-2 align-self-center text-center cover-container">
        <span v-if="!coverLoaded" class="align-items-center d-inline-flex flex-column h-50 w-100">
          <div class="spinner-border" style="" role="status"></div>
          <strong>Loading Cover...</strong>
        </span>
        <img
          :src="manga.cover"
          class="w-100 img-fluid rounded"
          :alt="manga.title"
          @load="coverEvent"
          v-show="coverLoaded"
        />
      </div>
      <div class="col-md-8 pe-2">
        <div class="card-body d-flex flex-column">
          <MetadataField v-model="manga.title">Title</MetadataField>
          <div class="d-inline-flex flex-wrap justify-content-between gap-3 mb-3">
            <MetadataField v-model="manga.status" type="status">Publishing Status</MetadataField>
            <MetadataField v-model.date="manga.date" type="date">Release Date</MetadataField>
          </div>
          <MetadataField v-model="manga.description" type="textarea" rows="5">
            Description
          </MetadataField>
          <div class="text-center d-flex align-middle">
            <hr class="flex-fill" />
            <div class="text-body-secondary px-2 fw-light small">
              Fields below are comma-separated multiple values
            </div>
            <hr class="flex-fill" />
          </div>
          <MetadataField v-model.list="manga.author">Author</MetadataField>
          <MetadataField v-model.list="manga.artist">Artist</MetadataField>
          <MetadataField v-model.list="manga.genre" type="textarea" rows="3">Genres</MetadataField>
          <TagsButtons v-model="manga.genre" />
          <div class="text-end">
            <i class="bi bi-download" role="button" @click="xml = buildXML(manga)"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.entry-cards-move, /* apply transition to moving elements */
.entry-cards-enter-active,
.entry-cards-leave-active {
  transition: all 0.5s ease;
}

.entry-cards-enter-from,
.entry-cards-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
// .entry-cards-leave-active {
//   position: absolute;
// }

.cover-container.spinner-border {
  width: 5em;
  height: 5em;
  offset: 10em;
  z-index: 5;
}

.tag-badge {
  cursor: pointer;
}
</style>
