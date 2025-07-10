export interface InsurerInfo {
  numeroAgrement: string
  typesAssurance: string[]
  zonesCouverture: {
    departements: string[]
    regions: string[]
    codesPostaux: string[]
  }
  garantiesProposees: string
}
