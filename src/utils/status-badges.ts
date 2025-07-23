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
 * Gets badge configuration for GraphQL mission status (used in prestataire dashboard)
 */
export function getMissionStatusBadge(status: string): StatusBadgeConfig {
  switch (status) {
    case 'EN_ATTENTE':
      return {
        text: 'Nouvelle',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Bell,
        variant: 'outline'
      }
    case 'ASSIGNEE':
      return {
        text: 'Assignée',
        class: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: CheckCircle,
        variant: 'default'
      }
    case 'EN_COURS':
      return {
        text: 'En cours',
        class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: PlayCircle,
        variant: 'default'
      }
    case 'COMPLETEE':
      return {
        text: 'Terminée',
        class: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
        variant: 'default'
      }
    case 'ANNULEE':
      return {
        text: 'Annulée',
        class: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
        variant: 'destructive'
      }
    case 'SUSPENDUE':
      return {
        text: 'Suspendue',
        class: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: AlertTriangle,
        variant: 'secondary'
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
    case MissionStatut.EN_ATTENTE:
      return {
        text: 'En attente',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Bell,
        variant: 'secondary'
      }
    case MissionStatut.ASSIGNEE:
      return {
        text: 'Assignée',
        class: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: CheckCircle,
        variant: 'default'
      }
    case MissionStatut.EN_COURS:
      return {
        text: 'En cours',
        class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: PlayCircle,
        variant: 'outline'
      }
    case MissionStatut.COMPLETEE:
      return {
        text: 'Terminée',
        class: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
        variant: 'default'
      }
    case MissionStatut.ANNULEE:
      return {
        text: 'Annulée',
        class: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
        variant: 'destructive'
      }
    case MissionStatut.SUSPENDUE:
      return {
        text: 'Suspendue',
        class: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: AlertTriangle,
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
 * Gets badge configuration for urgency level
 */
export function getUrgencyBadge(urgency: string): StatusBadgeConfig {
  switch (urgency.toUpperCase()) {
    case 'BASSE':
    case 'FAIBLE':
    case 'LOW':
      return {
        text: 'Basse',
        class: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
        variant: 'secondary'
      }
    case 'MOYENNE':
    case 'MEDIUM':
      return {
        text: 'Moyenne',
        class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
        variant: 'outline'
      }
    case 'HAUTE':
    case 'ELEVEE':
    case 'HIGH':
      return {
        text: 'Haute',
        class: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: AlertTriangle,
        variant: 'destructive'
      }
    case 'CRITIQUE':
    case 'CRITICAL':
      return {
        text: 'Critique',
        class: 'bg-red-100 text-red-800 border-red-300',
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