import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { AuthUtils } from '@/utils/auth'

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_SERVER_GRAPHQL_WS_URL || 'ws://localhost:4000/ws',
    connectionParams: () => {
      const tokens = AuthUtils.getTokens()
      return {
        authorization: tokens?.token ? `Bearer ${tokens.token}` : ''
      }
    },
    lazy: true,
    keepAlive: 1
  })
)

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_SERVER_GRAPHQL_URL || 'http://localhost:4000/graphql'
})

const authLink = setContext(async (_, { headers }) => {
  const tokens = AuthUtils.getTokens()
  return {
    headers: {
      ...headers,
      authorization: tokens?.token ? `Bearer ${tokens.token}` : ''
    }
  }
})

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)

const apolloClient = new ApolloClient({
  name: 'client',
  version: '1.0',
  link: link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
})

export default apolloClient