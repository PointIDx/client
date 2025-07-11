import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CompanyInfo } from '@/interfaces/company-info';
import type { FiltresDeRecherche } from '@/interfaces/filtres-de-recherche';
import { SEARCH_PRESTATAIRES_QUERY } from '@/graphql/queries/search-prestataires';
import { GET_ASSUREUR_MISSIONS_QUERY } from '@/graphql/queries/get-assureur-missions';
import { GET_MISSION_DETAILS_QUERY } from '@/graphql/queries/get-mission-details';
import { CREATE_MISSION_MUTATION } from '@/graphql/mutations/create-mission';
import { UPDATE_MISSION_STATUS_MUTATION } from '@/graphql/mutations/update-mission-status';
import { useQuery, useMutation } from '@vue/apollo-composable';
import type { Prestataire } from '@/interfaces/prestataire';
import type { Mission } from '@/interfaces/mission';

// Import new utilities
import { fetchSiretInfo } from '@/utils/siret';
import { handleError, handleGraphQLError, showSuccess } from '@/utils/error-handling';
import { DEFAULT_VALUES } from '@/constants';

export const useAssureurStore = defineStore('assureur', () => {
  const siretValidated = ref(false);
  const companyInfo = ref<CompanyInfo>({
    raisonSociale: '',
    siret: '',
    formeJuridique: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: DEFAULT_VALUES.COUNTRY,
    dateCreation: '',
  });

  const prestataires = ref<Prestataire[]>([]);
  const missions = ref<Mission[]>([]);
  const mission = ref<Mission | null>(null);

  const validateSiret = async (siret: string) => {
    try {
      const result = await fetchSiretInfo(siret);
      
      if (result.isValid && result.companyInfo) {
        // Update the company info with the validated data
        companyInfo.value = { ...companyInfo.value, ...result.companyInfo };
        siretValidated.value = true;
        showSuccess('SIRET validé avec succès');
        return true;
      } else {
        siretValidated.value = false;
        throw new Error(result.error || 'Erreur lors de la validation SIRET');
      }
    } catch (error) {
      siretValidated.value = false;
      handleError(error, 'SIRET Validation', { showToast: true });
      throw error;
    }
  };

  const searchPrestataires = (filters: FiltresDeRecherche) => {
    const { onResult, onError } = useQuery(SEARCH_PRESTATAIRES_QUERY, filters);

    onResult((queryResult) => {
      if (queryResult.data) {
        prestataires.value = queryResult.data.searchPrestataires;
      }
    });

    onError((error) => {
      console.error('Error searching prestataires:', error);
      throw new Error('Erreur lors de la recherche des prestataires.');
    });
  };

  const fetchMissions = () => {
    const { onResult, onError } = useQuery(GET_ASSUREUR_MISSIONS_QUERY);

    onResult((queryResult) => {
      if (queryResult.data) {
        missions.value = queryResult.data.missions;
      }
    });

    onError((error) => {
      console.error('Error fetching missions:', error);
      throw new Error('Erreur lors de la récupération des missions.');
    });
  };

  const getMissionDetails = (missionId: string) => {
    const { onResult, onError } = useQuery(GET_MISSION_DETAILS_QUERY, { missionId });

    onResult((queryResult) => {
      if (queryResult.data) {
        mission.value = queryResult.data.mission;
      }
    });

    onError((error) => {
      console.error('Error fetching mission details:', error);
      throw new Error('Erreur lors de la récupération des détails de la mission.');
    });
  };

  const { mutate: createMission } = useMutation(CREATE_MISSION_MUTATION);
  const { mutate: updateMissionStatus } = useMutation(UPDATE_MISSION_STATUS_MUTATION);

  return {
    siretValidated,
    companyInfo,
    prestataires,
    missions,
    mission,
    validateSiret,
    searchPrestataires,
    fetchMissions,
    getMissionDetails,
    createMission,
    updateMissionStatus,
  };
});
