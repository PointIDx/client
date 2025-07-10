import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LOGIN_MUTATION } from '@/graphql/mutations/login';
import { SIGNUP_MUTATION } from '@/graphql/mutations/signup';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<{ id: string; email: string } | null>(null);

  async function login(email: string, password: string) {
    // In a real application, you would use a GraphQL client like Apollo or urql
    // For now, we'll simulate the GraphQL request
    console.log('Attempting login with:', email, password);
    
    // Simulate GraphQL request
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: LOGIN_MUTATION.loc?.source.body,
        variables: { email, password },
      }),
    });

    const result = await response.json();

    if (result.data && result.data.login) {
      token.value = result.data.login.token;
      user.value = result.data.login.user;
      return true;
    } else {
      console.error('Login failed:', result.errors);
      return false;
    }
  }

  async function signup(email: string, password: string) {
    console.log('Attempting signup with:', email, password);

    // Simulate GraphQL request
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SIGNUP_MUTATION.loc?.source.body,
        variables: { email, password },
      }),
    });

    const result = await response.json();

    if (result.data && result.data.signup) {
      token.value = result.data.signup.token;
      user.value = result.data.signup.user;
      return true;
    } else {
      console.error('Signup failed:', result.errors);
      return false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
  }

  return { token, user, login, signup, logout };
});
