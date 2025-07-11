import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { LOGIN_MUTATION } from '@/graphql/mutations/login';
import { SIGNUP_MUTATION } from '@/graphql/mutations/signup';
import type { User, JWTTokens, AuthResponse } from '@/interfaces/auth';
import { AuthUtils } from '@/utils/auth';

export const useAuthStore = defineStore('auth', () => {
  const tokens = ref<JWTTokens | null>(AuthUtils.getTokens());
  const user = ref<User | null>(AuthUtils.getUser());
  
  const isAuthenticated = computed(() => {
    if (!tokens.value) return false;
    return !AuthUtils.isTokenExpired(tokens.value.token);
  });

  async function login(email: string, password: string): Promise<boolean> {
    try {
      console.log('Attempting login with:', email, password);
      
      // For testing purposes, simulate successful login with mock data
      if (email === 'assureur@test.com' && password === 'password123') {
        const mockTokens: JWTTokens = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFzc3VyZXVyIFRlc3QiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.Twj8hZhS7ZX6vJl9NwJdJKQlQcH3KnM0hFkB1sP4aZw',
          refreshToken: 'refresh_token_assureur_123',
          expiresIn: 3600
        };
        const mockUser: User = {
          id: '1',
          email: email,
          type: 'assureur',
          profile: {
            companyName: 'Test Insurance Company',
            agreementNumber: 'AGR123456',
            regions: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur']
          }
        };
        
        tokens.value = mockTokens;
        user.value = mockUser;
        AuthUtils.saveTokens(mockTokens);
        AuthUtils.saveUser(mockUser);
        return true;
      }
      
      if (email === 'prestataire@test.com' && password === 'password123') {
        const mockTokens: JWTTokens = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOTg3NjU0MzIxIiwibmFtZSI6IlByZXN0YXRhaXJlIFRlc3QiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
          refreshToken: 'refresh_token_prestataire_456',
          expiresIn: 3600
        };
        const mockUser: User = {
          id: '2',
          email: email,
          type: 'prestataire',
          profile: {
            companyName: 'Test Construction SARL',
            siret: '12345678901234',
            sectors: ['Plomberie', 'Chauffage'],
            regions: ['Île-de-France']
          }
        };
        
        tokens.value = mockTokens;
        user.value = mockUser;
        AuthUtils.saveTokens(mockTokens);
        AuthUtils.saveUser(mockUser);
        return true;
      }
      
      // For other cases, try real API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result: AuthResponse = await response.json();
      
      tokens.value = result.tokens;
      user.value = result.user;
      AuthUtils.saveTokens(result.tokens);
      AuthUtils.saveUser(result.user);
      return true;
      
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async function signup(email: string, password: string): Promise<boolean> {
    try {
      console.log('Attempting signup with:', email, password);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const result: AuthResponse = await response.json();
      
      tokens.value = result.tokens;
      user.value = result.user;
      AuthUtils.saveTokens(result.tokens);
      AuthUtils.saveUser(result.user);
      return true;
      
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  }

  function logout() {
    tokens.value = null;
    user.value = null;
    AuthUtils.clearTokens();
  }

  async function refreshTokens(): Promise<boolean> {
    if (!tokens.value) return false;
    
    try {
      const newTokens = await AuthUtils.refreshTokens(tokens.value.refreshToken);
      if (!newTokens) {
        logout();
        return false;
      }
      
      tokens.value = newTokens;
      AuthUtils.saveTokens(newTokens);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }

  // Initialize from localStorage on app start
  function initAuth() {
    const storedTokens = AuthUtils.getTokens();
    const storedUser = AuthUtils.getUser();
    
    if (storedTokens && storedUser) {
      if (!AuthUtils.isTokenExpired(storedTokens.token)) {
        tokens.value = storedTokens;
        user.value = storedUser;
      } else {
        // Try to refresh expired token
        refreshTokens();
      }
    }
  }

  return { 
    tokens, 
    user, 
    isAuthenticated, 
    login, 
    signup, 
    logout, 
    refreshTokens,
    initAuth 
  };
});
