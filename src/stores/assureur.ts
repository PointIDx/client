import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CompanyInfo } from '@/interfaces/company-info';

export const useAssureurStore = defineStore('assureur', () => {
  const siretValidated = ref(false);
  const companyInfo = ref<CompanyInfo>({
    raisonSociale: '',
    siret: '',
    formeJuridique: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    dateCreation: '',
  });

  const validateSiret = async (siret: string) => {
    if (siret.length !== 14) {
      siretValidated.value = false;
      throw new Error('Le SIRET doit contenir exactement 14 chiffres');
    }

    try {
      // In a real application, this would be an actual API call to INSEE
      // For now, we'll simulate the API call with a mock
      const response = await fetch(`/api/siret/${siret}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du SIRET. Veuillez réessayer.');
      }
      const data = await response.json();

      companyInfo.value.raisonSociale = data.etablissement.uniteLegale.denominationUniteLegale;
      companyInfo.value.adresse = `${data.etablissement.adresseEtablissement.numeroVoieEtablissement} ${data.etablissement.adresseEtablissement.typeVoieEtablissement} ${data.etablissement.adresseEtablissement.libelleVoieEtablissement}`;
      companyInfo.value.codePostal = data.etablissement.adresseEtablissement.codePostalEtablissement;
      companyInfo.value.ville = data.etablissement.adresseEtablissement.libelleCommuneEtablissement;
      companyInfo.value.dateCreation = data.etablissement.dateCreationEtablissement;

      siretValidated.value = true;
      return true;
    } catch (error: any) {
      siretValidated.value = false;
      throw new Error(error.message || 'Erreur lors de la vérification du SIRET. Veuillez réessayer.');
    }
  };

  return {
    siretValidated,
    companyInfo,
    validateSiret,
  };
});
