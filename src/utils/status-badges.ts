import { MissionStatutPrestataire } from '@/enums/mission-statut-prestataire'
import { MissionStatutAssureur } from '@/enums/mission-statut-assureur'
import { MissionStatut } from '@/enums/mission-statut'
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  PlayCircle 
} from 'lucide-vue-next'

export interface StatusBadgeConfig {
  text: string
  class: string
  icon: any
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
}

/**
 * Gets badge configuration for prestataire mission status
 */
export function getPrestataireMissionStatusBadge(status: MissionStatutPrestataire): StatusBadgeConfig {
  switch (status) {
    case MissionStatutPrestataire.Nouvelle:
      return {
        text: 'Nouvelle',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Bell,
        variant: 'secondary'
      }
    case MissionStatutPrestataire.Acceptee:
      return {
        text: 'Acceptée',
        class: 'bg-black text-white border-black',
        icon: CheckCircle,
        variant: 'default'
      }
    case MissionStatutPrestataire.Refusee:
      return {
        text: 'Refusée',
        class: 'bg-gray-700 text-white border-gray-700',
        icon: XCircle,
        variant: 'destructive'
      }
    case MissionStatutPrestataire.EnCours:
      return {
        text: 'En cours',
        class: 'bg-gray-200 text-gray-800 border-gray-400',
        icon: Clock,
        variant: 'outline'
      }
    case MissionStatutPrestataire.Terminee:
      return {
        text: 'Terminée',
        class: 'bg-black text-white border-black',
        icon: CheckCircle,
        variant: 'default'
      }
    case MissionStatutPrestataire.Annulee:
      return {
        text: 'Annulée',
        class: 'bg-gray-400 text-gray-800 border-gray-400',
        icon: XCircle,
        variant: 'secondary'
      }
    default:
      return {
        text: 'Inconnu',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: AlertTriangle,
        variant: 'outline'
      }
  }
}

/**
 * Gets badge configuration for assureur mission status
 */
export function getAssureurMissionStatusBadge(status: MissionStatutAssureur): StatusBadgeConfig {
  switch (status) {
    case MissionStatutAssureur.Brouillon:
      return {
        text: 'Brouillon',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Clock,
        variant: 'outline'
      }
    case MissionStatutAssureur.Envoyee:
      return {
        text: 'Envoyée',
        class: 'bg-gray-200 text-gray-800 border-gray-400',
        icon: Eye,
        variant: 'secondary'
      }
    case MissionStatutAssureur.Acceptee:
      return {
        text: 'Acceptée',
        class: 'bg-black text-white border-black',
        icon: CheckCircle,
        variant: 'default'
      }
    case MissionStatutAssureur.EnCours:
      return {
        text: 'En cours',
        class: 'bg-gray-200 text-gray-800 border-gray-400',
        icon: PlayCircle,
        variant: 'outline'
      }
    case MissionStatutAssureur.Terminee:
      return {
        text: 'Terminée',
        class: 'bg-black text-white border-black',
        icon: CheckCircle,
        variant: 'default'
      }
    default:
      return {
        text: 'Inconnu',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: AlertTriangle,
        variant: 'outline'
      }
  }
}

/**
 * Gets badge configuration for general mission status
 */
export function getGeneralMissionStatusBadge(status: MissionStatut): StatusBadgeConfig {
  switch (status) {
    case MissionStatut.Brouillon:
      return {
        text: 'Brouillon',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Bell,
        variant: 'secondary'
      }
    case MissionStatut.Envoyee:
      return {
        text: 'Envoyée',
        class: 'bg-gray-200 text-gray-800 border-gray-400',
        icon: Eye,
        variant: 'secondary'
      }
    case MissionStatut.Acceptee:
      return {
        text: 'Acceptée',
        class: 'bg-black text-white border-black',
        icon: CheckCircle,
        variant: 'default'
      }
    case MissionStatut.EnCours:
      return {
        text: 'En cours',
        class: 'bg-gray-200 text-gray-800 border-gray-400',
        icon: Clock,
        variant: 'outline'
      }
    case MissionStatut.Terminee:
      return {
        text: 'Terminée',
        class: 'bg-black text-white border-black',
        icon: CheckCircle,
        variant: 'default'
      }
    default:
      return {
        text: 'Inconnu',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: AlertTriangle,
        variant: 'outline'
      }
  }
}

/**
 * Gets badge configuration for urgency level
 */
export function getUrgencyBadge(urgency: string): StatusBadgeConfig {
  switch (urgency.toLowerCase()) {
    case 'faible':
    case 'low':
      return {
        text: 'Faible',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: CheckCircle,
        variant: 'secondary'
      }
    case 'moyenne':
    case 'medium':
      return {
        text: 'Moyenne',
        class: 'bg-gray-200 text-gray-800 border-gray-400',
        icon: Clock,
        variant: 'outline'
      }
    case 'elevee':
    case 'haute':
    case 'high':
      return {
        text: 'Élevée',
        class: 'bg-gray-700 text-white border-gray-700',
        icon: AlertTriangle,
        variant: 'destructive'
      }
    default:
      return {
        text: 'Inconnue',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: AlertTriangle,
        variant: 'outline'
      }
  }
}

/**
 * Gets badge configuration for document status
 */
export function getDocumentStatusBadge(status: string): StatusBadgeConfig {
  switch (status.toLowerCase()) {
    case 'valide':
    case 'approved':
      return {
        text: 'Validé',
        class: 'bg-black text-white border-black',
        icon: CheckCircle,
        variant: 'default'
      }
    case 'en_attente':
    case 'pending':
      return {
        text: 'En attente',
        class: 'bg-gray-200 text-gray-800 border-gray-400',
        icon: Clock,
        variant: 'outline'
      }
    case 'rejete':
    case 'rejected':
      return {
        text: 'Rejeté',
        class: 'bg-gray-700 text-white border-gray-700',
        icon: XCircle,
        variant: 'destructive'
      }
    default:
      return {
        text: 'Inconnu',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: AlertTriangle,
        variant: 'outline'
      }
  }
}