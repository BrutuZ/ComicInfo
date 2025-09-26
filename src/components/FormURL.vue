<script setup lang="ts">
import SourceIcon from '@/components/SourceIcon.vue'
import { AniList } from '@/parsers/Anilist'
import { HNexus } from '@/parsers/HNexus'
import { MangaBaka } from '@/parsers/Mangabaka'
import { MangaInfo, type ParserOptions } from '@/types'
import { ref } from 'vue'

const mangaEntries = defineModel<MangaInfo[]>('mangaEntries', { default: [] })
defineProps<{
  DEV: boolean
}>()
const options = defineModel<{ url: string; parserParams: ParserOptions }>('options', {
  required: true,
})
const formValidated = ref(false)
const validUrl = ref(false)
const parsers = [MangaBaka, AniList, HNexus]
// vvv tree-shaking should get rid of this vvv
const stub: MangaInfo[] = !DEV
  ? []
  : [
      new MangaInfo({
        title: 'My Quiet Blacksmith Life in Another World',
        description: `★★★★☆ 8.53

Eizo Tanya is a middle-aged, very burned-out, software engineer. One night after working late, he throws himself in front of a speeding truck to save a cat. Although the cat survives, Eizo is not so lucky. In a spark of divine fate, the cat turns out to be a godlike being who offers him a second chance in another world!

Should he be a legendary warrior? A noble king? Nope! All Eizo wants is a peaceful life making things for others, and what better way to do that than becoming a blacksmith?

He does have one other wish: to live alongside a cute cat. His requests are granted but with a twist - Eizo’s blacksmithing skills are so overpowered that they’re practically cheat abilities. On top of that, the cat companion he wished for turns out to be a half-tiger girl!

With so much commotion in this world, will Eizo be able to forge a quiet new life?

Alternative Titles:
• Kajiya de Hajimeru Isekai Slow Life
• 鍛冶屋ではじめる異世界スローライフ
• 成為鐵匠在異世界度過悠閒人生
• Умеренная жизнь ремесленника в другом мире
• Помірне життя ремісничого в іншому світі
• Different World Slow Life Begun at the Smith
• 成为铁匠在异世界度过悠闲人生
• ชีวิตสโลไลฟ์หลังเกิดใหม่เป็นช่างตีเหล็ก`,
        author: ['Tamamaru', 'たままる'],
        artist: ['Himori Yoshino'],
        genre: [
          'Origination:Manga',
          'Demographic:Shounen',
          'Genre:Action',
          'Format:Adaptation',
          'Genre:Adventure',
          'Genre:Comedy',
          'Content:Ecchi',
          'Genre:Fantasy',
          'Theme:Harem',
          'Genre:Isekai',
          'Theme:Monster Girls',
          'Theme:Reincarnation',
          'Genre:Romance',
          'Genre:Slice of Life',
          'Category:Beast Girl/s',
          'Category:Beastman/men',
          'Category:Big Breasts',
          'Category:Blacksmith/s',
          'Category:Cat Girl/s',
          'Category:Cat/s',
          'Category:Cheat Skill/s',
          'Category:Dwarf/ves',
          'Category:Elf/ves',
          'Category:Fantasy World',
          'Category:First Friend',
          'Category:Herbs/Herbalist',
          'Category:Injury/ies',
          'Category:Magic',
          'Category:Male Protagonist',
          'Category:Medical',
          'Category:Middle-Aged Protagonist',
          'Category:Nudity',
          'Category:Reincarnated in Another World',
          'Category:Sex',
          'Category:Slow Life',
        ],
        status: 'Ongoing',
        date: '1999-01-31',
        source: { name: 'Seven Seas' },
      }),
      // new MangaInfo({
      //   title: 'Isekai Tensei Nanikore',
      // }),
    ]

// ^^^ tree-shaking should get rid of this ^^^
const validateForm = (urlInput: string | Event | undefined) => {
  if (urlInput === undefined) return urlInput
  if (typeof urlInput !== 'string') urlInput = (urlInput.target as HTMLInputElement)?.value || ''
  if (urlInput.trim() == '') {
    formValidated.value = false
    validUrl.value = false
  } else {
    formValidated.value = true
    validUrl.value = parsers.some(parser =>
      parser(urlInput, options.value.parserParams).validateUrl(),
    )
  }
  // options.value.url = urlInput
  // return urlInput
}
const addItem = () => {
  validateForm(options.value.url)
  if (options.value.url) {
    const urls = options.value.url.trim().split(' ')
    urls.forEach(url => {
      parsers.forEach(parser => {
        if (!parser(url).validateUrl()) return
        parser(url, options.value.parserParams)
          .parse()
          .then(info => (mangaEntries.value = [...info, ...mangaEntries.value]))
      })
      options.value.url = options.value.url.replace(url, '').trim()
    })
  }
  // tree-shaking should get rid of this
  if (DEV) {
    if (options.value.url) return
    if (mangaEntries.value.length === stub.length + parsers.length) {
      mangaEntries.value = []
    } else {
      if (mangaEntries.value.length < stub.length) {
        mangaEntries.value.unshift(stub[mangaEntries.value.length])
      } else {
        parsers[mangaEntries.value.length - stub.length]('', options.value.parserParams)
          .parse()
          .then(info => (mangaEntries.value = [...info, ...mangaEntries.value]))
      }
    }
  }
}
</script>

<template>
  <form @submit.prevent="addItem" novalidate>
    <!-- :class="{ 'was-validated': formValidated, 'needs-validation': !formValidated }" -->
    <div class="position-relative">
      <!-- <label for="url-input" class="form-label">URL</label> -->
      <span class="input-group">
        <input
          type="url"
          title="URL"
          class="form-control"
          :class="{
            'is-valid': formValidated && validUrl,
            'is-invalid': formValidated && !validUrl,
          }"
          id="url-input"
          aria-describedby="url-input invalid-tooltip"
          placeholder="https://example.com"
          @submit="addItem"
          @input="validateForm"
          v-model="options.url"
        />
        <button
          class="btn"
          :class="{
            'btn-secondary': !formValidated,
            'btn-success': formValidated && validUrl,
            'btn-outline-danger': formValidated && !validUrl,
          }"
          type="button"
          id="button-add"
          title="Add Links(s)"
          @click="addItem"
          :disabled="!DEV && !options.url"
        >
          +
        </button>
        <!-- <button
          class="btn btn-outline-success"
          type="button"
          id="buton-add"
          @click="addItem"
          v-else
        >
          ♻
        </button> -->
      </span>
      <div class="invalid-tooltip">Please input a valid URL</div>
    </div>
    <div class="row">
      <small class="form-text col-sm-4">
        Supported sites:
        <span>
          <template v-for="source in parsers.map(parser => parser())" :key="source.name">
            <SourceIcon v-if="!Array.isArray(source.sources)" :source />
            <SourceIcon v-else v-for="src in source.sources" :key="src.name" v-bind:source="src" />
          </template>
        </span>
      </small>
      <span
        id="settings-container"
        class="col-sm-8 d-flex mt-1 align-items-center justify-content-around"
      >
        <div id="eng-pref" class="form-check form-switch">
          <label for="english" class="form-check-label">English Titles</label>
          <input
            id="english"
            type="checkbox"
            class="form-check-input"
            role="switch"
            v-model="options.parserParams.english"
          />
        </div>
        <div id="group-pref" class="form-check form-switch">
          <label for="grouping" class="form-check-label">Group Genres</label>
          <input
            id="grouping"
            type="checkbox"
            class="form-check-input"
            role="switch"
            v-model="options.parserParams.groupTags"
          />
        </div>
        <div v-if="DEV" id="proxy-pref" class="form-check form-switch">
          <label for="proxy-switch" class="form-check-label">Proxy Requests</label>
          <input
            id="proxy-switch"
            type="checkbox"
            class="form-check-input"
            role="switch"
            v-model="options.parserParams.proxy"
          />
        </div>
      </span>
    </div>
  </form>
</template>

<style lang="scss">
img.source-icons {
  height: calc($small-font-size + $form-text-margin-top);
}
</style>
