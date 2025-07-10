import { DocumentType } from "../enums/document-type";

export interface DocumentItem {
  nom: string;
  type: DocumentType;
  taille: string;
  auteur: string;
  date: string;
}
