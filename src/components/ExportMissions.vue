<template>
  <div class="export-missions">
    <Dialog v-model:open="isOpen">
      <DialogTrigger as-child>
        <Button variant="outline" data-testid="export-missions-button">
          <Download class="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter les missions</DialogTitle>
          <DialogDescription>
            Sélectionnez les options d'export
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <!-- Export Format -->
          <div>
            <Label for="format">Format</Label>
            <Select v-model="exportFormat" data-testid="export-format-select">
              <SelectTrigger>
                <SelectValue placeholder="Choisir le format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Date Range -->
          <div>
            <Label for="dateRange">Période</Label>
            <Select v-model="dateRange" data-testid="export-date-range-select">
              <SelectTrigger>
                <SelectValue placeholder="Choisir la période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
                <SelectItem value="all">Toutes les données</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Mission Status Filter -->
          <div>
            <Label for="statusFilter">Statut des missions</Label>
            <Select v-model="statusFilter" data-testid="export-status-filter-select">
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="nouvelles">Nouvelles</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="terminees">Terminées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Loading State -->
          <div v-if="isExporting" class="text-center py-4" data-testid="export-loading">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-600">Export en cours...</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isOpen = false">
            Annuler
          </Button>
          <Button @click="handleExport" :disabled="isExporting" data-testid="confirm-export-button">
            <Download class="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Download } from 'lucide-vue-next'

const isOpen = ref(false)
const isExporting = ref(false)
const exportFormat = ref('csv')
const dateRange = ref('month')
const statusFilter = ref('all')

const handleExport = async () => {
  isExporting.value = true
  
  try {
    // Simulate export processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create mock export data
    const exportData = generateMockExportData()
    
    // Generate and download file based on format
    downloadFile(exportData, exportFormat.value)
    
    console.log('✅ Export completed successfully')
    isOpen.value = false
    
  } catch (error) {
    console.error('❌ Export failed:', error)
  } finally {
    isExporting.value = false
  }
}

const generateMockExportData = () => {
  const missions = [
    {
      id: '1',
      titre: 'Réparation plomberie',
      client: 'M. Dupont',
      statut: 'EN_COURS',
      dateCreation: '2024-01-15',
      budget: '750€'
    },
    {
      id: '2',
      titre: 'Installation électrique',
      client: 'Mme Martin',
      statut: 'TERMINEE',
      dateCreation: '2024-01-10',
      budget: '1200€'
    }
  ]
  
  return missions
}

const downloadFile = (data: any[], format: string) => {
  let content = ''
  let filename = `missions_export_${new Date().toISOString().split('T')[0]}`
  let mimeType = 'text/plain'
  
  switch (format) {
    case 'csv':
      content = convertToCSV(data)
      filename += '.csv'
      mimeType = 'text/csv'
      break
    case 'pdf':
      content = 'PDF export would be generated here'
      filename += '.pdf'
      mimeType = 'application/pdf'
      break
    case 'excel':
      content = convertToCSV(data) // Simplified - would use proper Excel format
      filename += '.xlsx'
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
  }
  
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

const convertToCSV = (data: any[]) => {
  const headers = ['ID', 'Titre', 'Client', 'Statut', 'Date création', 'Budget']
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.id,
      `"${item.titre}"`,
      `"${item.client}"`,
      item.statut,
      item.dateCreation,
      `"${item.budget}"`
    ].join(','))
  ].join('\n')
  
  return csvContent
}
</script>