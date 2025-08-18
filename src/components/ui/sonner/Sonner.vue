<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner'

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :style="{
      '--normal-bg': 'white',
      '--normal-text': 'rgb(15 23 42)',
      '--normal-border': 'rgb(226 232 240)',
      '--error-bg': 'white',
      '--error-text': 'rgb(220 38 38)',
      '--error-border': 'rgb(239 68 68)',
      '--success-bg': 'white',
      '--success-text': 'rgb(34 197 94)',
      '--success-border': 'rgb(74 222 128)',
    }"
  />
</template>
