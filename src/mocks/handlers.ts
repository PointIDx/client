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

  // Intercept "Login" GraphQL mutation.
  graphql.mutation<{}>('Login', (req) => {
    const { email, password } = req.variables;

    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        data: {
          login: {
            token: 'mock-jwt-token',
            user: {
              id: 'user-123',
              email: 'test@example.com',
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid credentials',
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          },
        ],
      }, { status: 401 });
    }
  }),

  // Intercept "Signup" GraphQL mutation.
  graphql.mutation('Signup', (req) => {
    const { email, password } = req.variables

    if (email && password) {
      return HttpResponse.json({
        data: {
          signup: {
            token: 'mock-jwt-token-new-user',
            user: {
              id: 'new-user-456',
              email: email,
            },
          },
        },
      });
    } else {
      return HttpResponse.json({
        errors: [
          {
            message: 'Missing email or password',
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          },
        ],
      }, { status: 400 });
    }
  }),
];