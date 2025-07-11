import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useLazyQuery, useMutation} from '@vue/apollo-composable';
import { SOCIETAIRE_LOGIN } from '@/graphql/mutations/societaire-login';
import { SEND_FILE } from '@/graphql/mutations/send-file';
import { SEND_COMMENT_MUTATION } from '@/graphql/mutations/send-comment';
import { GET_SOCIETAIRE_DOSSIER } from '@/graphql/queries/get-societaire-dossier';
import type { DossierData } from '@/interfaces/dossier-data';
import type { TimelineItem } from '@/interfaces/timeline-item';
import type { HistoriqueItem } from '@/interfaces/historique-item';
import type { DocumentItem } from '@/interfaces/document-item';

export const useSocietaireStore = defineStore('societaire', () => {
  const token = ref<string | null>(null);
  const email = ref<string | null>(null);
  const dossierNumber = ref<string | null>(null);
  const dossierData = ref<DossierData | null>(null);
  const timeline = ref<TimelineItem[]>([]);
  const historique = ref<HistoriqueItem[]>([]);
  const documents = ref<DocumentItem[]>([]);

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

  const login = async (emailInput: string, dossierNumberInput: string) => {
    try {
      const result = await societaireLoginMutation({
        email: emailInput,
        dossierNumber: dossierNumberInput,
      });
      if (result?.data?.societaireLogin) {
        token.value = result.data.societaireLogin.token;
        email.value = result.data.societaireLogin.societaire.email;
        dossierNumber.value = result.data.societaireLogin.societaire.dossierNumber;
        dossierData.value = result.data.societaireLogin.societaire.dossierData;
        timeline.value = result.data.societaireLogin.societaire.timeline;
        historique.value = result.data.societaireLogin.societaire.historique;
        documents.value = result.data.societaireLogin.societaire.documents;
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
    token.value = null;
    email.value = null;
    dossierNumber.value = null;
    dossierData.value = null;
    timeline.value = [];
    historique.value = [];
    documents.value = [];
  };

  const sendFile = async (file: File, comment: string = '') => {
    if (!dossierNumber.value) {
      console.error('Dossier number is not set. Cannot send file.');
      return false;
    }
    try {
      const result = await sendFileMutation({
        dossierNumber: dossierNumber.value,
        file: file,
        comment: comment,
      });

      if (result?.data?.sendFile?.success) {
        if (result.data.sendFile.document) {
          documents.value.push(result.data.sendFile.document);
        }
        if (result.data.sendFile.historiqueItem) {
          historique.value.push(result.data.sendFile.historiqueItem);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Send file failed:', error);
      return false;
    }
  };

  const sendComment = async (comment: string) => {
    if (!dossierNumber.value) {
      console.error('Dossier number is not set. Cannot send comment.');
      return false;
    }
    try {
      const result = await sendCommentMutation({
        dossierNumber: dossierNumber.value,
        comment: comment,
      });

      if (result?.data?.sendComment?.success) {
        if (result.data.sendComment.historiqueItem) {
          historique.value.push(result.data.sendComment.historiqueItem);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Send comment failed:', error);
      return false;
    }
  };

  return {
    token,
    email,
    dossierNumber,
    dossierData,
    timeline,
    historique,
    documents,
    login,
    logout,
    sendFile,
    sendComment,
    fetchSocietaireDossier,
  };
});
