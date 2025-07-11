import { ref, computed } from 'vue'
import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/constants'
import { validateSiretFormat } from '@/utils/siret'
import { validateFile } from '@/utils/file-validation'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export function useFormValidation() {
  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})

  const setError = (field: string, message: string) => {
    errors.value[field] = message
  }

  const clearError = (field: string) => {
    delete errors.value[field]
  }

  const clearAllErrors = () => {
    errors.value = {}
  }

  const setTouched = (field: string, value: boolean = true) => {
    touched.value[field] = value
  }

  const validateField = (field: string, value: any, rules: ValidationRule): string | null => {
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return VALIDATION_MESSAGES.REQUIRED_FIELD
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      return null
    }

    // String length validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Ce champ doit contenir au moins ${rules.minLength} caractères`
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Ce champ ne peut pas dépasser ${rules.maxLength} caractères`
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        return 'Format invalide'
      }
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value)
      if (typeof result === 'string') {
        return result
      }
      if (result === false) {
        return 'Valeur invalide'
      }
    }

    return null
  }

  const validateForm = (data: Record<string, any>, rules: ValidationRules): boolean => {
    clearAllErrors()
    let isValid = true

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field]
      const error = validateField(field, value, fieldRules)
      
      if (error) {
        setError(field, error)
        isValid = false
      }
    }

    return isValid
  }

  const hasErrors = computed(() => Object.keys(errors.value).length > 0)
  const getError = (field: string) => errors.value[field]
  const isTouched = (field: string) => touched.value[field]

  return {
    errors: errors.value,
    touched: touched.value,
    hasErrors,
    setError,
    clearError,
    clearAllErrors,
    setTouched,
    validateField,
    validateForm,
    getError,
    isTouched
  }
}

// Predefined validation rules
export const commonValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!value) return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) || VALIDATION_MESSAGES.INVALID_EMAIL
    }
  },

  password: {
    required: true,
    minLength: VALIDATION_RULES.MIN_PASSWORD_LENGTH,
    custom: (value: string) => {
      if (!value) return true
      if (value.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
        return `Le mot de passe doit contenir au moins ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} caractères`
      }
      return true
    }
  },

  siret: {
    required: true,
    custom: (value: string) => {
      if (!value) return true
      return validateSiretFormat(value) || VALIDATION_MESSAGES.INVALID_SIRET
    }
  },

  phone: {
    required: true,
    pattern: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    custom: (value: string) => {
      if (!value) return true
      const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
      return phoneRegex.test(value) || 'Numéro de téléphone invalide'
    }
  },

  postalCode: {
    required: true,
    pattern: /^\d{5}$/,
    custom: (value: string) => {
      if (!value) return true
      const postalCodeRegex = /^\d{5}$/
      return postalCodeRegex.test(value) || 'Code postal invalide (5 chiffres requis)'
    }
  },

  file: {
    required: true,
    custom: (value: File) => {
      if (!value) return true
      const validation = validateFile(value)
      return validation.isValid || validation.error || 'Fichier invalide'
    }
  }
}

// Specialized validation composable for registration forms
export function useRegistrationValidation() {
  const { validateForm, ...formValidation } = useFormValidation()

  const validateCompanyInfo = (data: Record<string, any>) => {
    const rules: ValidationRules = {
      siret: commonValidationRules.siret,
      raisonSociale: { required: true, minLength: 2 },
      formeJuridique: { required: true },
      adresse: { required: true },
      codePostal: commonValidationRules.postalCode,
      ville: { required: true },
      dateCreation: { required: true }
    }

    return validateForm(data, rules)
  }

  const validateContact = (data: Record<string, any>) => {
    const rules: ValidationRules = {
      prenom: { required: true, minLength: 2 },
      nom: { required: true, minLength: 2 },
      email: commonValidationRules.email,
      telephone: commonValidationRules.phone
    }

    return validateForm(data, rules)
  }

  const validateAccount = (data: Record<string, any>) => {
    const rules: ValidationRules = {
      email: commonValidationRules.email,
      password: commonValidationRules.password,
      confirmPassword: {
        required: true,
        custom: (value: string) => {
          if (!value) return true
          return value === data.password || VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH
        }
      }
    }

    return validateForm(data, rules)
  }

  const validateDocuments = (data: Record<string, any>) => {
    const rules: ValidationRules = {
      kbis: commonValidationRules.file,
      assurance: commonValidationRules.file,
      agrement: { required: false, custom: commonValidationRules.file.custom }
    }

    return validateForm(data, rules)
  }

  return {
    ...formValidation,
    validateCompanyInfo,
    validateContact,
    validateAccount,
    validateDocuments
  }
}