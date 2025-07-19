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
      const result = await uploadMissionFileMutation({ input })
      
      if (result?.data?.uploadMissionFile) {
        showSuccess('Fichier téléchargé avec succès')
        return result.data.uploadMissionFile
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