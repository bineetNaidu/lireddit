import { ChakraProvider } from '@chakra-ui/react';
import { createClient, Provider, dedupExchange, fetchExchange } from 'urql';
import { Cache, cacheExchange, QueryInput } from '@urql/exchange-graphcache';
import theme from '../theme';
import { AppProps } from 'next/app';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

function MyApp({ Component, pageProps }: AppProps) {
  const client = createClient({
    url: 'http://localhost:4242/graphql',
    fetchOptions: {
      credentials: 'include',
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        updates: {
          Mutation: {
            logout: (_result, _args, cache, _info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, _args, cache, _info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result?.login?.errors) {
                    return query;
                  } else {
                    return {
                      me: result?.login?.user,
                    };
                  }
                }
              );
            },
            register: (_result, _args, cache, _info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      fetchExchange,
    ],
  });

  return (
    <ChakraProvider resetCSS theme={theme}>
      <Provider value={client}>
        <Component {...pageProps} />
      </Provider>
    </ChakraProvider>
  );
}

export default MyApp;
