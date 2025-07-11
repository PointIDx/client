import type { JWTTokens } from '@/interfaces/auth'

const TOKEN_KEY = 'pointid_tokens'
const USER_KEY = 'pointid_user'

export class AuthUtils {
  static saveTokens(tokens: JWTTokens): void {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
  }

  static getTokens(): JWTTokens | null {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) return null
    
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  static clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  static saveUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  static getUser(): any | null {
    const stored = localStorage.getItem(USER_KEY)
    if (!stored) return null
    
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  static async refreshTokens(refreshToken: string): Promise<JWTTokens | null> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      return data.tokens
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  static getAuthHeaders(): Record<string, string> {
    const tokens = this.getTokens()
    if (!tokens) return {}

    return {
      'Authorization': `Bearer ${tokens.token}`,
    }
  }

  static async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    let tokens = this.getTokens()
    
    if (!tokens) {
      throw new Error('No authentication tokens available')
    }

    // Check if token is expired and refresh if needed
    if (this.isTokenExpired(tokens.token)) {
      const newTokens = await this.refreshTokens(tokens.refreshToken)
      if (!newTokens) {
        this.clearTokens()
        throw new Error('Failed to refresh authentication tokens')
      }
      tokens = newTokens
      this.saveTokens(tokens)
    }

    const authHeaders = this.getAuthHeaders()
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    }

    return fetch(url, requestOptions)
  }
}