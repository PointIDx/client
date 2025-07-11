<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-vue-next"
import type { FunctionalComponent } from "vue"
import type { IconNode } from "lucide-vue-next"

interface Props {
  icon: FunctionalComponent | IconNode;
  iconBgClass: string;
  iconTextColorClass: string;
  title: string;
  description: string;
  youAreList: string[];
  youCanList: string[];
  buttonText: string;
  buttonVariant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
}

const props = withDefaults(defineProps<Props>(), {
  buttonVariant: "default",
})

const emit = defineEmits(["select"])

import { computed } from "vue"

const onSelect = () => {
  emit("select")
}

const hoverBgClass = computed(() => {
  // For gray themes, create darker hover state
  if (props.iconBgClass.includes("gray-100")) return "group-hover:bg-gray-200"
  if (props.iconBgClass.includes("gray-200")) return "group-hover:bg-gray-300"
  if (props.iconBgClass.includes("gray-300")) return "group-hover:bg-gray-400"
  return props.iconBgClass.replace("-100", "-200")
})
</script>

<template>
  <Card class="relative hover:shadow-lg transition-shadow cursor-pointer group border-gray-300 bg-white">
    <CardHeader class="text-center pb-4">
      <div
        class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors"
        :class="[iconBgClass, hoverBgClass]"
      >
        <component :is="icon" class="h-8 w-8" :class="iconTextColorClass" />
      </div>
      <CardTitle class="text-xl text-black">{{ title }}</CardTitle>
      <CardDescription class="text-gray-700">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <h4 class="font-medium text-black">Vous êtes :</h4>
        <ul class="text-sm text-gray-700 space-y-1">
          <li v-for="(item, i) in youAreList" :key="i">• {{ item }}</li>
        </ul>
      </div>

      <div class="space-y-2">
        <h4 class="font-medium text-black">Vous pourrez :</h4>
        <ul class="text-sm text-gray-700 space-y-1">
          <li v-for="(item, i) in youCanList" :key="i">• {{ item }}</li>
        </ul>
      </div>

      <Button @click="onSelect" class="w-full mt-6" size="lg" :variant="buttonVariant" :class="buttonVariant === 'default' ? 'bg-black text-white hover:bg-gray-800' : 'border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500'">
        {{ buttonText }}
        <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
    </CardContent>
  </Card>
</template>
