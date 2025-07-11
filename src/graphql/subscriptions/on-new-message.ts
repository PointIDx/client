import { gql } from 'graphql-tag'

export const ON_NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription OnNewMessage($missionId: ID!) {
    onNewMessage(missionId: $missionId) {
      id
      missionId
      expediteur
      contenu
      dateEnvoi
      lu
    }
  }
`
