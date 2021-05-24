import { ChakraProvider } from '@chakra-ui/react';
import { createClient, Provider } from 'urql';
import theme from '../theme';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  const client = createClient({
    url: 'http://localhost:4242/graphql',
    fetchOptions: {
      credentials: 'include',
    },
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
