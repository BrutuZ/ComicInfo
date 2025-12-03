<script setup lang="ts">
import { thumbHashToDataURL } from 'thumbhash'
import { ref } from 'vue'

const props = defineProps(['hash', 'src', 'srcset', 'class'])

const coverLoaded = ref(false)
const coverEvent = () => {
  coverLoaded.value = true
}

const b64toDataUrl = (b64ThumbHash: string) =>
  thumbHashToDataURL(
    new Uint8Array(
      atob(b64ThumbHash)
        .split('')
        .map(x => x.charCodeAt(0)),
    ),
  )
</script>

<template>
  <img v-if="props.hash && !coverLoaded" :src="b64toDataUrl(props.hash)" :class="props.class" />
  <img
    v-show="!props.hash || coverLoaded"
    :src="src"
    :srcset="props.srcset"
    :class="props.class"
    @load="coverEvent"
  />
</template>
