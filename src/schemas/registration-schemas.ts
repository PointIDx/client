import { z } from 'zod';

export const companyInfoSchema = z.object({
  siret: z.string().length(14, "Le SIRET doit contenir exactement 14 chiffres"),
  raisonSociale: z.string().min(1, "La raison sociale est requise"),
  formeJuridique: z.string().min(1, "La forme juridique est requise"),
  adresse: z.string().min(1, "L'adresse est requise"),
  codePostal: z.string().min(1, "Le code postal est requis"),
  ville: z.string().min(1, "La ville est requise"),
  pays: z.string().min(1, "Le pays est requis"),
  dateCreation: z.string().min(1, "La date de création est requise"),
});

export const documentsSchema = z.object({
  kbis: z.any().refine(file => file !== null, "Le Kbis est requis"),
  assurance: z.any().refine(file => file !== null, "L'attestation d'assurance est requise"),
  agrement: z.any().optional(), // Optional for prestataire, required for assureur
});

export const contactSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(10, "Le numéro de téléphone est requis"),
});

export const accountSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const providerInfoSchema = z.object({
  secteursActivite: z.string().min(1, "Les secteurs d'activité sont requis"),
  zonesGeographiques: z.object({
    departements: z.array(z.string()).optional(),
    regions: z.array(z.string()).min(1, "Au moins une région est requise"),
    codesPostaux: z.array(z.string()).optional(),
  }),
});

export const insurerInfoSchema = z.object({
  numeroAgrement: z.string().min(1, "Le numéro d'agrément est requis"),
  typesAssurance: z.array(z.string()).min(1, "Au moins un type d'assurance est requis"),
  zonesCouverture: z.object({
    departements: z.array(z.string()).optional(),
    regions: z.array(z.string()).min(1, "Au moins une zone de couverture est requise"),
    codesPostaux: z.array(z.string()).optional(),
  }),
  garantiesProposees: z.string().min(1, "Les garanties proposées sont requises"),
});

export const societaireInfoSchema = z.object({
  civilite: z.string().min(1, "La civilité est requise"),
  prenom: z.string().min(1, "Le prénom est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  dateNaissance: z.string().min(1, "La date de naissance est requise"),
  adresseBien: z.string().min(1, "L'adresse du bien est requise"),
  codePostalBien: z.string().min(1, "Le code postal du bien est requis"),
  villeBien: z.string().min(1, "La ville du bien est requise"),
  typeProjet: z.string().optional(),
  numeroDossier: z.string().optional(),
  descriptionProjet: z.string().optional(),
});
