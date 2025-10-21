<script setup lang="ts">
import type { ParserOptions } from '@/types'

const options = defineModel<{ url: string; parserParams: ParserOptions }>('options', {
  required: true,
})
</script>

<template>
  <span id="settings-container" class="d-flex align-items-center justify-content-around">
    <div id="eng-pref" class="form-check form-switch">
      <label for="english" class="form-check-label">English Titles</label>
      <input
        id="english"
        type="checkbox"
        class="form-check-input"
        role="switch"
        checked="true"
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
        checked="true"
        v-model="options.parserParams.groupTags"
      />
    </div>
    <div class="form-check form-switch">
      <label for="licensed" class="form-check-label">Show Licensed Status</label>
      <input
        id="licensed"
        type="checkbox"
        class="form-check-input"
        role="switch"
        checked="true"
        v-model="options.parserParams.showLicensed"
      />
    </div>
    <!--
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
     -->
  </span>
</template>
