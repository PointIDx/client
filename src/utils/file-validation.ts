import { FILE_SIZE_LIMITS, ACCEPTED_FILE_TYPES, VALIDATION_MESSAGES } from '@/constants'

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export interface FileValidationOptions {
  maxSize?: number
  acceptedTypes?: string[]
  allowMultiple?: boolean
}

/**
 * Validates file type
 */
export function validateFileType(file: File, acceptedTypes: string[]): boolean {
  return acceptedTypes.includes(file.type)
}

/**
 * Validates file size
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Comprehensive file validation
 */
export function validateFile(file: File, options: FileValidationOptions = {}): FileValidationResult {
  const {
    maxSize = FILE_SIZE_LIMITS.MAX_FILE_SIZE,
    acceptedTypes = [...ACCEPTED_FILE_TYPES.DOCUMENTS, ...(ACCEPTED_FILE_TYPES.IMAGES as readonly string[])]
  } = options

  // Check file type
  if (!validateFileType(file, acceptedTypes)) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.INVALID_FILE_TYPE
    }
  }

  // Check file size
  if (!validateFileSize(file, maxSize)) {
    return {
      isValid: false,
      error: `${VALIDATION_MESSAGES.FILE_TOO_LARGE} (max: ${formatFileSize(maxSize)})`
    }
  }

  return { isValid: true }
}

/**
 * Validates PDF files specifically
 */
export function validatePdfFile(file: File): FileValidationResult {
  return validateFile(file, {
    maxSize: FILE_SIZE_LIMITS.MAX_FILE_SIZE,
    acceptedTypes: [ACCEPTED_FILE_TYPES.PDF]
  })
}

/**
 * Validates image files specifically
 */
export function validateImageFile(file: File): FileValidationResult {
  return validateFile(file, {
    maxSize: FILE_SIZE_LIMITS.MAX_IMAGE_SIZE,
    acceptedTypes: ACCEPTED_FILE_TYPES.IMAGES
  })
}

/**
 * Validates multiple files
 */
export function validateFiles(files: File[], options: FileValidationOptions = {}): FileValidationResult[] {
  return files.map(file => validateFile(file, options))
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Checks if file is an image
 */
export function isImageFile(file: File): boolean {
  return (ACCEPTED_FILE_TYPES.IMAGES as readonly string[]).includes(file.type)
}

/**
 * Checks if file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === ACCEPTED_FILE_TYPES.PDF
}

/**
 * Creates a file preview URL for images
 */
export function createFilePreviewUrl(file: File): string | null {
  if (!isImageFile(file)) return null
  return URL.createObjectURL(file)
}

/**
 * Revokes a file preview URL
 */
export function revokeFilePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}