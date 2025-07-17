import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { LOGIN_MUTATION } from '@/graphql/mutations/login';
import { SIGNUP_MUTATION } from '@/graphql/mutations/signup';
import type { User, JWTTokens, AuthResponse } from '@/interfaces/auth';
import { AuthUtils } from '@/utils/auth';
import { useGraphQL } from '@/composables/useGraphQL';

export const useAuthStore = defineStore('auth', () => {
  const tokens = ref<JWTTokens | null>(AuthUtils.getTokens());
  const user = ref<User | null>(AuthUtils.getUser());
  const { executeMutation } = useGraphQL();
  
  const isAuthenticated = computed(() => {
    if (!tokens.value) return false;
    return !AuthUtils.isTokenExpired(tokens.value.token);
  });

  async function login(email: string, password: string, accountType: 'ASSUREUR' | 'PRESTATAIRE'): Promise<boolean> {
    try {
      console.log('Attempting login with:', email, password, accountType);
      
      // Use GraphQL API call
      const result = await executeMutation<{ login: AuthResponse }>(
        LOGIN_MUTATION,
        { 
          input: {
            email, 
            password, 
            accountType 
          }
        },
        {
          context: 'User Login',
          showErrorToast: false
        }
      );

      if (!result?.login) {
        throw new Error('Login failed');
      }

      tokens.value = result.login.tokens;
      user.value = result.login.user;
      AuthUtils.saveTokens(result.login.tokens);
      AuthUtils.saveUser(result.login.user);
      return true;
      
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async function signup(email: string, password: string): Promise<boolean> {
    try {
      console.log('Attempting signup with:', email, password);

      const result = await executeMutation<{ signup: AuthResponse }>(
        SIGNUP_MUTATION,
        { email, password },
        {
          context: 'User Signup',
          showErrorToast: false
        }
      );

      if (!result?.signup) {
        throw new Error('Signup failed');
      }

      tokens.value = result.signup.tokens;
      user.value = result.signup.user;
      AuthUtils.saveTokens(result.signup.tokens);
      AuthUtils.saveUser(result.signup.user);
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
