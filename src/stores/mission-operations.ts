import { defineStore } from 'pinia'
import { useMutation } from '@vue/apollo-composable'
import {
  UPLOAD_MISSION_DOCUMENT_MUTATION,
  UPLOAD_MISSION_FILE_MUTATION,
  DELETE_DOCUMENT_MUTATION,
  UPDATE_DOCUMENT_METADATA_MUTATION
} from '@/graphql/mutations/mission-documents'
import {
  SEND_COMMENT_MUTATION,
  SEND_FILE_WITH_MESSAGE_MUTATION
} from '@/graphql/mutations/mission-comments'
import { handleGraphQLError, showSuccess } from '@/utils/error-handling'
import { useAuthStore } from '@/stores/auth'

export const useMissionOperationsStore = defineStore('mission-operations', () => {
  // Document management mutations
  const { mutate: uploadMissionDocumentMutation } = useMutation(UPLOAD_MISSION_DOCUMENT_MUTATION)
  const { mutate: uploadMissionFileMutation } = useMutation(UPLOAD_MISSION_FILE_MUTATION)
  const { mutate: deleteDocumentMutation } = useMutation(DELETE_DOCUMENT_MUTATION)
  const { mutate: updateDocumentMetadataMutation } = useMutation(UPDATE_DOCUMENT_METADATA_MUTATION)

  // Comment mutations
  const { mutate: sendCommentMutation } = useMutation(SEND_COMMENT_MUTATION)
  const { mutate: sendFileWithMessageMutation } = useMutation(SEND_FILE_WITH_MESSAGE_MUTATION)

  // Document management functions
  const uploadMissionDocument = async (input: any) => {
    try {
      const result = await uploadMissionDocumentMutation({ input })
      
      if (result?.data?.uploadMissionDocument) {
        showSuccess('Document téléchargé avec succès')
        return result.data.uploadMissionDocument
      }
    } catch (error) {
      handleGraphQLError(error, 'Upload Document', { showToast: true })
      throw error
    }
  }

  const uploadMissionFile = async (input: any) => {
    try {
      // Use direct fetch for file upload with multipart/form-data
      const formData = new FormData()
      
      // Add the GraphQL operation
      formData.append('operations', JSON.stringify({
        query: `
          mutation UploadMissionFile($input: MissionDocumentUploadInput!) {
            uploadMissionFile(input: $input) {
              id
              filename
              url
              contentType
              size
              uploadDate
              description
              uploadedBy
            }
          }
        `,
        variables: {
          input: {
            missionId: input.missionId,
            file: null,
            description: input.description
          }
        }
      }))
      
      // Map the file to the correct variable
      formData.append('map', JSON.stringify({
        '0': ['variables.input.file']
      }))
      
      // Add the actual file
      formData.append('0', input.file)
      
      // Get auth token
      const authStore = useAuthStore()
      const tokens = authStore.tokens
      
      // Make the request
      const response = await fetch(import.meta.env.VITE_APP_SERVER_GRAPHQL_URL || '/graphql', {
        method: 'POST',
        headers: {
          'Authorization': tokens?.token ? `Bearer ${tokens.token}` : ''
        },
        body: formData
      })
      
      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload response not ok:', response.status, response.statusText, errorText)
        throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`)
      }
      
      // Get response text first to debug
      const responseText = await response.text()
      console.log('Upload response text:', responseText)
      
      // Try to parse as JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        console.error('Response was:', responseText)
        throw new Error(`Server returned invalid JSON response: ${responseText.substring(0, 200)}`)
      }
      
      if (result.data?.uploadMissionFile) {
        showSuccess('Fichier téléchargé avec succès')
        return result.data.uploadMissionFile
      } else if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Upload failed')
      } else {
        throw new Error('Unknown upload error')
      }
    } catch (error) {
      handleGraphQLError(error, 'Upload File', { showToast: true })
      throw error
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      await deleteDocumentMutation({ documentId })
      showSuccess('Document supprimé avec succès')
    } catch (error) {
      handleGraphQLError(error, 'Delete Document', { showToast: true })
      throw error
    }
  }

  const updateDocumentMetadata = async (input: any) => {
    try {
      const result = await updateDocumentMetadataMutation({ input })
      
      if (result?.data?.updateDocumentMetadata) {
        showSuccess('Métadonnées du document mises à jour')
        return result.data.updateDocumentMetadata
      }
    } catch (error) {
      handleGraphQLError(error, 'Update Document Metadata', { showToast: true })
      throw error
    }
  }

  // Comment management functions
  const sendComment = async (input: any) => {
    try {
      const result = await sendCommentMutation({ input })
      
      if (result?.data?.sendComment) {
        showSuccess('Commentaire envoyé avec succès')
        return result.data.sendComment
      }
    } catch (error) {
      handleGraphQLError(error, 'Send Comment', { showToast: true })
      throw error
    }
  }

  const sendFileWithMessage = async (input: any) => {
    try {
      const result = await sendFileWithMessageMutation({ input })
      
      if (result?.data?.sendFileWithMessage) {
        showSuccess('Fichier avec message envoyé avec succès')
        return result.data.sendFileWithMessage
      }
    } catch (error) {
      handleGraphQLError(error, 'Send File With Message', { showToast: true })
      throw error
    }
  }

  return {
    // Document management
    uploadMissionDocument,
    uploadMissionFile,
    deleteDocument,
    updateDocumentMetadata,
    // Comment management
    sendComment,
    sendFileWithMessage,
  }
})