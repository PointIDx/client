<template>
  <Card>
    <CardHeader>
      <CardTitle>Actions Rapides</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" class="h-20 flex-col bg-transparent" @click="$emit('upload-document')">
          <Upload class="h-6 w-6 mb-2" />
          Envoyer document
        </Button>
        <Button variant="outline" class="h-20 flex-col bg-transparent" @click="$emit('new-message')">
          <MessageSquare class="h-6 w-6 mb-2" />
          Nouveau message
        </Button>
        <Button variant="outline" class="h-20 flex-col bg-transparent" @click="$emit('schedule-appointment')">
          <Clock class="h-6 w-6 mb-2" />
          Planifier RDV
        </Button>
        <Button variant="outline" class="h-20 flex-col bg-transparent" @click="$emit('report-issue')">
          <AlertTriangle class="h-6 w-6 mb-2" />
          Signaler problème
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, MessageSquare, Clock, AlertTriangle } from 'lucide-vue-next'

defineEmits<{
  'upload-document': []
  'new-message': []
  'schedule-appointment': []
  'report-issue': []
}>()
</script>