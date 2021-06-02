import { withApollo as createWithApollo } from 'next-apollo';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { PaginatedPosts } from '../generated/graphql';
import { NextPageContext } from 'next';
import { isServer } from '../utils/isServer';

const createClient = (ctx?: NextPageContext) =>
  new ApolloClient({
    uri: 'http://localhost:4242/graphql',
    credentials: 'include',
    headers: {
      cookie: (isServer() ? ctx?.req?.headers.cookie : undefined) || '',
    },
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: ['limit'],
              merge(
                existings: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existings?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
  });

export const withApollo = createWithApollo(createClient);
