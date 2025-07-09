import { graphql, HttpResponse } from 'msw'

export const handlers = [
  // Intercept "viewer" GraphQL query.
  graphql.query('viewer', () => {
    return HttpResponse.json({
      data: {
        viewer: {
          id: '1',
          __typename: 'User',
          firstName: 'John',
          lastName: 'Maverick',
        },
      },
    })
  }),
]
