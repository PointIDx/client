import type { JWTTokens } from '@/interfaces/auth'
import apolloClient from '@/apollo-client'
import { REFRESH_TOKEN_MUTATION } from '@/graphql/mutations/refresh-token'

const TOKEN_KEY = 'pointid_tokens';
const USER_KEY = 'pointid_user'

export class AuthUtils {
  static saveTokens(tokens: JWTTokens): void {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
  }

  static async getTokens(): Promise<JWTTokens | null> {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
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
      const { data } = await apolloClient.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { 
          input: { 
            refreshToken 
          } 
        },
      })

      if (!data?.refreshToken) {
        throw new Error('Failed to refresh token')
      }

      return data.refreshToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  static async getAuthHeaders(): Promise<Record<string, string>> {
    const tokens = await this.getTokens();
    if (!tokens) return {};

    return {
      'Authorization': `Bearer ${tokens.token}`,
    };
  }

  static async makeAuthenticatedGraphQLRequest<T>(
    mutation: any,
    variables?: Record<string, any>
  ): Promise<T | null> {
    try {
      const { data } = await apolloClient.mutate<T>({
        mutation,
        variables,
      });
      return data ?? null;
    } catch (error) {
      console.error('Authenticated GraphQL request failed:', error);
      throw error;
    }
  }
}