// Helper to read runtime (injected) environment variables from window before falling back to Vite build-time vars
// Usage: runtimeEnv('VITE_APP_SERVER_GRAPHQL_URL', '/graphql')
export function runtimeEnv(name: string, fallback?: string): string | undefined {
  if (typeof window !== 'undefined') {
    const w: any = window as any;
    // Support multiple possible containers for injected values
    if (w._env_ && typeof w._env_[name] === 'string' && w._env_[name]) return w._env_[name];
    if (w.__RUNTIME_CONFIG__ && typeof w.__RUNTIME_CONFIG__[name] === 'string' && w.__RUNTIME_CONFIG__[name]) return w.__RUNTIME_CONFIG__[name];
  }
  // @ts-ignore - index access on import.meta.env
  const viteVal = import.meta.env ? import.meta.env[name] : undefined;
  return viteVal || fallback;
}
