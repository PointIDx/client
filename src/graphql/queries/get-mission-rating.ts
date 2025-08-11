import { gql } from '@apollo/client/core'

export const GET_MISSION_RATING_QUERY = gql`
  query GetMissionRating($missionId: UUID!) {
    missionRating(missionId: $missionId) {
      id
      missionId
      missionTitle
      missionReference
      assureurCompanyName
      prestataireCompanyName
      rating
      comment
      createdAt
    }
  }
`

export const GET_PRESTATAIRE_RATING_SUMMARY = gql`
  query GetPrestataireRatingSummary($prestataireId: UUID!) {
    prestataireRatingSummary(prestataireId: $prestataireId) {
      prestataireId
      prestataireCompanyName
      totalRatings
      averageRating
      ratingBreakdown {
        fiveStars
        fourStars
        threeStars
        twoStars
        oneStar
      }
      latestRatings {
        id
        missionTitle
        missionReference
        assureurCompanyName
        rating
        comment
        createdAt
      }
    }
  }
`

export const GET_MY_GIVEN_RATINGS = gql`
  query GetMyGivenRatings {
    myGivenRatings {
      id
      missionId
      missionTitle
      missionReference
      prestataireCompanyName
      rating
      comment
      createdAt
    }
  }
`

export const GET_MY_RECEIVED_RATINGS = gql`
  query GetMyReceivedRatings {
    myReceivedRatings {
      id
      missionId
      missionTitle
      missionReference
      assureurCompanyName
      rating
      comment
      createdAt
    }
  }
`

export const GET_PRESTATAIRE_RATINGS = gql`
  query GetPrestataireRatings($prestataireId: UUID!) {
    prestataireRatings(prestataireId: $prestataireId) {
      id
      missionId
      missionTitle
      missionReference
      assureurCompanyName
      rating
      comment
      createdAt
    }
  }
`