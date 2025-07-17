import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLazyQuery, useMutation, useSubscription } from '@vue/apollo-composable';
import { SOCIETAIRE_LOGIN } from '@/graphql/mutations/societaire-login';
import { SEND_FILE } from '@/graphql/mutations/send-file';
import { SEND_COMMENT_MUTATION } from '@/graphql/mutations/send-comment';
import { GET_SOCIETAIRE_DOSSIER } from '@/graphql/queries/get-societaire-dossier';
import { GET_SOCIETAIRE_NOTIFICATIONS } from '@/graphql/queries/get-societaire-notifications';
import { MARK_SOCIETAIRE_NOTIFICATION_READ } from '@/graphql/mutations/mark-societaire-notification-read';
import { GET_SOCIETAIRE_MESSAGES } from '@/graphql/queries/get-societaire-messages';
import { SEND_SOCIETAIRE_MESSAGE } from '@/graphql/mutations/send-societaire-message';
import { UPLOAD_SOCIETAIRE_DOCUMENT } from '@/graphql/mutations/upload-societaire-document';
import { UPLOAD_SOCIETAIRE_FILE_MUTATION } from '@/graphql/mutations/upload-file';
import { GET_SOCIETAIRE_DOCUMENTS } from '@/graphql/queries/get-societaire-documents';
import { UPDATE_SOCIETAIRE_CLAIM_STATUS } from '@/graphql/mutations/update-societaire-claim-status';
import { GET_SOCIETAIRE_PROFILE } from '@/graphql/queries/get-societaire-profile';
import { UPDATE_SOCIETAIRE_PROFILE } from '@/graphql/mutations/update-societaire-profile';
import { ON_SOCIETAIRE_NOTIFICATION } from '@/graphql/subscriptions/on-societaire-notification';
import { ON_SOCIETAIRE_TIMELINE_UPDATE } from '@/graphql/subscriptions/on-societaire-timeline-update';
import type { DossierData } from '@/interfaces/dossier-data';
import type { TimelineItem } from '@/interfaces/timeline-item';
import type { HistoriqueItem } from '@/interfaces/historique-item';
import type { DocumentItem } from '@/interfaces/document-item';
import type { JWTTokens } from '@/interfaces/auth';
import { AuthUtils } from '@/utils/auth';
import { TimelineStatut } from '@/enums/timeline-statut';
import { HistoriqueType } from '@/enums/historique-type';
import { DocumentType } from '@/enums/document-type';

const SOCIETAIRE_STORAGE_KEY = 'pointid_societaire';

export const useSocietaireStore = defineStore('societaire', () => {
  const tokens = ref<JWTTokens | null>(null);
  const email = ref<string | null>(null);
  const dossierNumber = ref<string | null>(null);
  const dossierData = ref<DossierData | null>(null);
  const timeline = ref<TimelineItem[]>([]);
  const historique = ref<HistoriqueItem[]>([]);
  const documents = ref<DocumentItem[]>([]);
  const notifications = ref<any[]>([]);
  const messages = ref<any[]>([]);
  const profile = ref<any | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const isAuthenticated = computed(() => {
    if (!tokens.value) return false;
    return !AuthUtils.isTokenExpired(tokens.value.token);
  });

  const unreadNotificationsCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length;
  });

  const { mutate: societaireLoginMutation } = useMutation(SOCIETAIRE_LOGIN);
  const { mutate: sendFileMutation } = useMutation(SEND_FILE);
  const { mutate: sendCommentMutation } = useMutation(SEND_COMMENT_MUTATION);
  const { mutate: markNotificationReadMutation } = useMutation(MARK_SOCIETAIRE_NOTIFICATION_READ);
  const { mutate: sendMessageMutation } = useMutation(SEND_SOCIETAIRE_MESSAGE);
  const { mutate: uploadDocumentMutation } = useMutation(UPLOAD_SOCIETAIRE_DOCUMENT);
  const { mutate: uploadFileMutation } = useMutation(UPLOAD_SOCIETAIRE_FILE_MUTATION);
  const { mutate: updateClaimStatusMutation } = useMutation(UPDATE_SOCIETAIRE_CLAIM_STATUS);
  const { mutate: updateProfileMutation } = useMutation(UPDATE_SOCIETAIRE_PROFILE);
  
  const { onResult: onSocietaireDossierResult, load: loadSocietaireDossier } = useLazyQuery(GET_SOCIETAIRE_DOSSIER, () => ({
    dossierNumber: dossierNumber.value,
  }), { enabled: false });

  const { onResult: onNotificationsResult, load: loadNotifications } = useLazyQuery(GET_SOCIETAIRE_NOTIFICATIONS, () => ({
    dossierNumber: dossierNumber.value,
  }), { enabled: false });

  const { onResult: onMessagesResult, load: loadMessages } = useLazyQuery(GET_SOCIETAIRE_MESSAGES, () => ({
    dossierNumber: dossierNumber.value,
  }), { enabled: false });

  const { onResult: onDocumentsResult, load: loadDocuments } = useLazyQuery(GET_SOCIETAIRE_DOCUMENTS, () => ({
    dossierNumber: dossierNumber.value,
  }), { enabled: false });

  const { onResult: onProfileResult, load: loadProfile } = useLazyQuery(GET_SOCIETAIRE_PROFILE, () => ({
    dossierNumber: dossierNumber.value,
  }), { enabled: false });

  // Subscriptions for real-time updates
  const { onResult: onNotificationSubscription } = useSubscription(ON_SOCIETAIRE_NOTIFICATION, () => ({
    dossierNumber: dossierNumber.value,
  }), { enabled: computed(() => !!dossierNumber.value) });

  const { onResult: onTimelineUpdateSubscription } = useSubscription(ON_SOCIETAIRE_TIMELINE_UPDATE, () => ({
    dossierNumber: dossierNumber.value,
  }), { enabled: computed(() => !!dossierNumber.value) });

  onSocietaireDossierResult((result) => {
    if (result.data?.societaireDossier) {
      dossierData.value = result.data.societaireDossier.dossierData;
      timeline.value = result.data.societaireDossier.timeline;
      historique.value = result.data.societaireDossier.historique;
      documents.value = result.data.societaireDossier.documents;
    }
  });

  onNotificationsResult((result) => {
    if (result.data?.getSocietaireNotifications) {
      notifications.value = result.data.getSocietaireNotifications;
    }
  });

  onMessagesResult((result) => {
    if (result.data?.getSocietaireMessages) {
      messages.value = result.data.getSocietaireMessages.messages;
    }
  });

  onDocumentsResult((result) => {
    if (result.data?.getSocietaireDocuments) {
      documents.value = result.data.getSocietaireDocuments.documents;
    }
  });

  onProfileResult((result) => {
    if (result.data?.getSocietaireProfile) {
      profile.value = result.data.getSocietaireProfile;
    }
  });

  // Handle real-time notifications
  onNotificationSubscription((result) => {
    if (result.data?.onSocietaireNotification) {
      const newNotification = result.data.onSocietaireNotification;
      // Update notification to match new schema structure
      notifications.value.unshift({
        ...newNotification,
        isRead: newNotification.isRead ?? false,
        notificationType: newNotification.notificationType || newNotification.type
      });
    }
  });

  // Handle real-time timeline updates
  onTimelineUpdateSubscription((result) => {
    if (result.data?.onSocietaireTimelineUpdate) {
      const update = result.data.onSocietaireTimelineUpdate;
      timeline.value = update.timeline;
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

  // Notifications Management
  const fetchNotifications = async () => {
    if (!dossierNumber.value) return false;
    try {
      isLoading.value = true;
      await loadNotifications();
      return true;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      error.value = 'Failed to fetch notifications';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationReadMutation({ notificationId });
      if (result?.data?.markSocietaireNotificationRead) {
        const notification = notifications.value.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  };

  // Enhanced Communication System
  const fetchMessages = async () => {
    if (!dossierNumber.value) return false;
    try {
      isLoading.value = true;
      await loadMessages();
      return true;
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      error.value = 'Failed to fetch messages';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const sendMessage = async (input: any) => {
    if (!dossierNumber.value) return false;
    try {
      const result = await sendMessageMutation({ 
        input: { 
          ...input, 
          dossierNumber: dossierNumber.value 
        } 
      });
      if (result?.data?.sendSocietaireMessage) {
        messages.value.push(result.data.sendSocietaireMessage);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  // Enhanced Document Management
  const uploadDocument = async (input: any) => {
    if (!dossierNumber.value) return false;
    try {
      const result = await uploadDocumentMutation({ 
        input: { 
          ...input, 
          dossierNumber: dossierNumber.value 
        } 
      });
      if (result?.data?.uploadSocietaireDocument) {
        documents.value.push(result.data.uploadSocietaireDocument);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to upload document:', error);
      return false;
    }
  };

  // File Upload with actual file content
  const uploadFileWithContent = async (file: File, category: string, description?: string) => {
    if (!dossierNumber.value) return false;
    try {
      const result = await uploadFileMutation({
        input: {
          dossierNumber: dossierNumber.value,
          file: file,
          category: category,
          description: description
        }
      });
      if (result?.data?.uploadSocietaireFile) {
        documents.value.push(result.data.uploadSocietaireFile);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to upload file:', error);
      return false;
    }
  };

  const fetchDocuments = async (category?: string) => {
    if (!dossierNumber.value) return false;
    try {
      isLoading.value = true;
      await loadDocuments();
      return true;
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      error.value = 'Failed to fetch documents';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Claim Status Management
  const updateClaimStatus = async (input: any) => {
    if (!dossierNumber.value) return false;
    try {
      const result = await updateClaimStatusMutation({ 
        input: { 
          ...input, 
          dossierNumber: dossierNumber.value 
        } 
      });
      if (result?.data?.updateSocietaireClaimStatus) {
        // Update local timeline with new status
        timeline.value = result.data.updateSocietaireClaimStatus.timeline;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update claim status:', error);
      return false;
    }
  };

  // Export Functionality
  const exportData = async (input: any) => {
    if (!dossierNumber.value) return null;
    try {
      // For now, return a mock export object
      // This would be replaced with actual GraphQL query execution
      return {
        url: `/exports/societaire-export-${Date.now()}.pdf`,
        filename: `societaire-export-${dossierNumber.value}-${new Date().toISOString().split('T')[0]}.pdf`,
        contentType: 'application/pdf',
        size: 1024000,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  };

  // Profile Management
  const fetchProfile = async () => {
    if (!dossierNumber.value) return false;
    try {
      isLoading.value = true;
      await loadProfile();
      return true;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      error.value = 'Failed to fetch profile';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const updateProfile = async (input: any) => {
    if (!dossierNumber.value) return false;
    try {
      const result = await updateProfileMutation({ 
        input: { 
          ...input, 
          dossierNumber: dossierNumber.value 
        } 
      });
      if (result?.data?.updateSocietaireProfile) {
        profile.value = result.data.updateSocietaireProfile;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  };

  // Search and History
  const searchHistory = async (input: any) => {
    if (!dossierNumber.value) return null;
    try {
      // For now, return mock search results
      // This would be replaced with actual GraphQL query execution
      return {
        results: historique.value.filter(item => 
          input.searchTerm ? item.message.toLowerCase().includes(input.searchTerm.toLowerCase()) : true
        ),
        totalCount: historique.value.length,
        hasMore: false,
        filters: {
          categories: ['Client', 'Prestataire', 'Assureur'],
          authors: Array.from(new Set(historique.value.map(h => h.auteur))),
          dateRange: { min: '2024-01-01', max: new Date().toISOString().split('T')[0] },
          tags: []
        }
      };
    } catch (error) {
      console.error('Failed to search history:', error);
      return null;
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
          notifications.value = data.notifications || [];
          messages.value = data.messages || [];
          profile.value = data.profile || null;
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
    notifications,
    messages,
    profile,
    isLoading,
    error,
    isAuthenticated,
    unreadNotificationsCount,
    login,
    logout,
    sendFile,
    sendComment,
    fetchSocietaireDossier,
    initAuth,
    // Notifications Management
    fetchNotifications,
    markNotificationAsRead,
    // Enhanced Communication
    fetchMessages,
    sendMessage,
    // Document Management
    uploadDocument,
    uploadFileWithContent,
    fetchDocuments,
    // Claim Status Management
    updateClaimStatus,
    // Export Functionality
    exportData,
    // Profile Management
    fetchProfile,
    updateProfile,
    // Search and History
    searchHistory,
  };
});
