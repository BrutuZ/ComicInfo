<script setup lang="ts">
import BSAlert from '@/components/BSAlert.vue'
import { bsTooltips } from '@/main'
import { onMounted, onUnmounted, ref } from 'vue'

const xml = defineModel<string>('xml', { required: true })
const alertRef = ref()

const downloadXML = () => {
  return URL.createObjectURL(new Blob([xml.value], { type: 'application/xml' }))
}

function clipboard() {
  alertRef.value = true
  navigator.clipboard.writeText(xml.value)
}

onMounted(() => {
  bsTooltips(document.querySelector('.modal')).create({
    trigger: 'hover focus',
    placement: 'auto',
  })
})

onUnmounted(() => {
  bsTooltips(document.querySelector('.modal')).destroy()
})
</script>

<script lang="ts">
import { listField } from '@/main'
import type { MangaInfo } from '@/types'
import { create } from 'xmlbuilder2'

export function buildXML(manga: MangaInfo) {
  const schema = 'http://www.w3.org/2001/XMLSchema'
  const comicInfo = create({ version: '1.0', encoding: 'UTF-8' }).ele('ComicInfo', {
    'xmlns:xsd': schema,
    'xmlns:xsi': `${schema}-instance`,
  })
  const date = new Date(manga.date)
  comicInfo.ele('Series').txt(manga.title)
  comicInfo.ele('Summary').txt(manga.description)
  comicInfo.ele('Writer').txt(listField(manga.author))
  comicInfo.ele('Penciller').txt(listField(manga.artist))
  comicInfo.ele('Translator').txt(manga.publisher)
  comicInfo.ele('Genre').txt(listField(manga.genre))
  comicInfo.ele('Web').txt(manga.url)
  if (date) {
    comicInfo.ele('Year').txt(date.getUTCFullYear().toString())
    comicInfo.ele('Month').txt((date.getUTCMonth() + 1).toString())
    comicInfo.ele('Day').txt(date.getUTCDate().toString())
  }
  comicInfo.ele('ty:PublishingStatusTachiyomi', { 'xmlns:ty': schema }).txt(manga.status)
  // comicInfo.ele('mh:SourceMihon', { 'xmlns:ty': schema }).txt(manga.source)
  return comicInfo.end({ prettyPrint: true })
}
</script>

<template>
  <div class="modal" id="outputModal" aria-labelledby="outputModalLabel">
    <BSAlert v-if="alertRef" v-model="alertRef" :style="'info'">
      <i class="bi bi-info" role="img" aria-label="Info:"></i>
      XML Copied to clipboard
    </BSAlert>
    <div class="modal-dialog modal-dialog-scrollable modal-xl">
      <div class="modal-content">
        <div class="modal-header justify-content-between">
          <h1 class="modal-title fs-5" id="outputModalLabel">ComicInfo.xml</h1>
        </div>
        <div class="modal-body d-flex user-select-all">
          <button
            data-bs-toggle="tooltip"
            role="button"
            class="btn btn-outline-secondary translate-middle-x m-3 end-0 top-0 position-absolute"
            aria-label="Copy to Clipboard"
            title="Copy to Clipboard"
            @click="clipboard"
          >
            <i class="bi bi-copy"></i>
          </button>
          <pre>{{ xml }}</pre>
        </div>
        <div class="modal-footer gap-2">
          <a
            data-bs-toggle="tooltip"
            aria-label="Download ComicInfo.xml"
            title="Download ComicInfo.xml"
            class="btn btn-success icon-link icon-link-hover"
            :href="downloadXML()"
            download="ComicInfo.xml"
          >
            <i class="bi bi-download" role="button"></i>Download
          </a>
          <button
            type="button"
            class="btn btn-secondary"
            aria-label="Close dialog"
            title="Close dialog"
            data-bs-dismiss="modal"
            data-bs-toggle="tooltip"
            @click="xml = ''"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
// $icon-link-icon-transform: translateX($icon-link-underline-offset);
.modal {
  display: block !important;
  & pre {
    text-wrap: wrap;
  }
  & .bi-download {
    translate: 0 $icon-link-underline-offset * -1;
  }
  .icon-link-hover:hover > .bi {
    transform: translateY($icon-link-underline-offset);
  }
}
/* offsetY: 0.25em; */
</style>
