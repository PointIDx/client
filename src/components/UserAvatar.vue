<template>
  <div 
    :class="[
      'rounded-full bg-gray-300 flex items-center justify-center',
      `h-${size/4} w-${size/4}`
    ]"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img
      v-if="avatar"
      :src="avatar"
      :alt="name"
      :class="[
        'rounded-full object-cover',
        `h-${size/4} w-${size/4}`
      ]"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
    <span v-else class="text-sm font-medium">
      {{ getInitials(name) }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  avatar?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 40
})

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}
</script>