import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLazyQuery, useMutation} from '@vue/apollo-composable';
import { SOCIETAIRE_LOGIN } from '@/graphql/mutations/societaire-login';
import { SEND_FILE } from '@/graphql/mutations/send-file';
import { SEND_COMMENT_MUTATION } from '@/graphql/mutations/send-comment';
import { GET_SOCIETAIRE_DOSSIER } from '@/graphql/queries/get-societaire-dossier';
import type { DossierData } from '@/interfaces/dossier-data';
import type { TimelineItem } from '@/interfaces/timeline-item';
import type { HistoriqueItem } from '@/interfaces/historique-item';
import type { DocumentItem } from '@/interfaces/document-item';
import type { JWTTokens } from '@/interfaces/auth';
import { AuthUtils } from '@/utils/auth';
import { TimelineStatut } from '@/enums/timeline-statut';
import { HistoriqueType } from '@/enums/historique-type';
import { DocumentType } from '@/enums/document-type';
import { CheckCircle, Clock } from 'lucide-vue-next';

const SOCIETAIRE_STORAGE_KEY = 'pointid_societaire';

export const useSocietaireStore = defineStore('societaire', () => {
  const tokens = ref<JWTTokens | null>(null);
  const email = ref<string | null>(null);
  const dossierNumber = ref<string | null>(null);
  const dossierData = ref<DossierData | null>(null);
  const timeline = ref<TimelineItem[]>([]);
  const historique = ref<HistoriqueItem[]>([]);
  const documents = ref<DocumentItem[]>([]);
  
  const isAuthenticated = computed(() => {
    if (!tokens.value) return false;
    return !AuthUtils.isTokenExpired(tokens.value.token);
  });

  const { mutate: societaireLoginMutation } = useMutation(SOCIETAIRE_LOGIN, {});
  const { mutate: sendFileMutation } = useMutation(SEND_FILE, {});
  const { mutate: sendCommentMutation } = useMutation(SEND_COMMENT_MUTATION, {});
  const { onResult: onSocietaireDossierResult, load: loadSocietaireDossier } = useLazyQuery(GET_SOCIETAIRE_DOSSIER, () => ({
    dossierNumber: dossierNumber.value,
  }), { enabled: false });

  onSocietaireDossierResult((result) => {
    if (result.data?.societaireDossier) {
      dossierData.value = result.data.societaireDossier.dossierData;
      timeline.value = result.data.societaireDossier.timeline;
      historique.value = result.data.societaireDossier.historique;
      documents.value = result.data.societaireDossier.documents;
    }
  });

  const login = async (emailInput: string, dossierNumberInput: string): Promise<boolean> => {
    try {
      // Use GraphQL API call
      const result = await societaireLoginMutation({
        email: emailInput,
        dossierNumber: dossierNumberInput,
      });
      
      if (result?.data?.societaireLogin) {
        const authTokens = {
          token: result.data.societaireLogin.token,
          refreshToken: result.data.societaireLogin.refreshToken || 'mock_refresh',
          expiresIn: result.data.societaireLogin.expiresIn || 3600
        };
        
        tokens.value = authTokens;
        email.value = result.data.societaireLogin.societaire.email;
        dossierNumber.value = result.data.societaireLogin.societaire.dossierNumber;
        dossierData.value = result.data.societaireLogin.societaire.dossierData;
        timeline.value = result.data.societaireLogin.societaire.timeline;
        historique.value = result.data.societaireLogin.societaire.historique;
        documents.value = result.data.societaireLogin.societaire.documents;
        
        // Save to localStorage
        AuthUtils.saveTokens(authTokens);
        localStorage.setItem(SOCIETAIRE_STORAGE_KEY, JSON.stringify({
          email: email.value,
          dossierNumber: dossierNumber.value,
          dossierData: dossierData.value,
          timeline: timeline.value,
          historique: historique.value,
          documents: documents.value
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Societaire login failed:', error);
      return false;
    }
  };

  const fetchSocietaireDossier = async () => {
    if (dossierNumber.value) {
      await loadSocietaireDossier();
    }
  };

  const logout = () => {
    tokens.value = null;
    email.value = null;
    dossierNumber.value = null;
    dossierData.value = null;
    timeline.value = [];
    historique.value = [];
    documents.value = [];
    AuthUtils.clearTokens();
    localStorage.removeItem(SOCIETAIRE_STORAGE_KEY);
  };

  const sendFile = async (file: File, comment: string = ''): Promise<boolean> => {
    if (!dossierNumber.value) {
      console.error('Dossier number is not set. Cannot send file.');
      return false;
    }
    
    try {
      // Mock successful file upload for testing
      const fileType = file.type.startsWith('image/') ? DocumentType.Image : DocumentType.Document;
      const newDocument: DocumentItem = {
        nom: file.name,
        type: fileType,
        taille: `${Math.round(file.size / 1024)} KB`,
        auteur: email.value || 'Sociétaire',
        date: new Date().toISOString().split('T')[0]
      };
      
      const newHistoriqueItem: HistoriqueItem = {
        auteur: email.value || 'Sociétaire',
        message: comment || `Fichier ajouté: ${file.name}`,
        date: new Date().toISOString().split('T')[0],
        type: HistoriqueType.Client,
        fichiers: [newDocument.nom]
      };
      
      documents.value.push(newDocument);
      historique.value.push(newHistoriqueItem);
      
      // Update localStorage
      localStorage.setItem(SOCIETAIRE_STORAGE_KEY, JSON.stringify({
        email: email.value,
        dossierNumber: dossierNumber.value,
        dossierData: dossierData.value,
        timeline: timeline.value,
        historique: historique.value,
        documents: documents.value
      }));
      
      return true;
    } catch (error) {
      console.error('Send file failed:', error);
      return false;
    }
  };

  const sendComment = async (comment: string): Promise<boolean> => {
    if (!dossierNumber.value) {
      console.error('Dossier number is not set. Cannot send comment.');
      return false;
    }
    
    try {
      // Mock successful comment for testing
      const newHistoriqueItem: HistoriqueItem = {
        auteur: email.value || 'Sociétaire',
        message: comment,
        date: new Date().toISOString().split('T')[0],
        type: HistoriqueType.Client,
        fichiers: []
      };
      
      historique.value.push(newHistoriqueItem);
      
      // Update localStorage
      localStorage.setItem(SOCIETAIRE_STORAGE_KEY, JSON.stringify({
        email: email.value,
        dossierNumber: dossierNumber.value,
        dossierData: dossierData.value,
        timeline: timeline.value,
        historique: historique.value,
        documents: documents.value
      }));
      
      return true;
    } catch (error) {
      console.error('Send comment failed:', error);
      return false;
    }
  };

  // Initialize from localStorage on app start
  const initAuth = () => {
    const storedTokens = AuthUtils.getTokens();
    const storedData = localStorage.getItem(SOCIETAIRE_STORAGE_KEY);
    
    if (storedTokens && storedData) {
      try {
        const data = JSON.parse(storedData);
        if (!AuthUtils.isTokenExpired(storedTokens.token)) {
          tokens.value = storedTokens;
          email.value = data.email;
          dossierNumber.value = data.dossierNumber;
          dossierData.value = data.dossierData;
          timeline.value = data.timeline || [];
          historique.value = data.historique || [];
          documents.value = data.documents || [];
        } else {
          // Clear expired data
          logout();
        }
      } catch (error) {
        console.error('Failed to restore societaire data:', error);
        logout();
      }
    }
  };

  return {
    tokens,
    email,
    dossierNumber,
    dossierData,
    timeline,
    historique,
    documents,
    isAuthenticated,
    login,
    logout,
    sendFile,
    sendComment,
    fetchSocietaireDossier,
    initAuth,
  };
});
