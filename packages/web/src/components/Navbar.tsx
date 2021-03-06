import NextLink from 'next/link';
import { Box, Flex, Heading, Link } from '@chakra-ui/layout';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Spinner } from '@chakra-ui/spinner';
import { Button } from '@chakra-ui/button';
import { isServer } from '../utils/isServer';
import { useApolloClient } from '@apollo/client';

const Navbar = () => {
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  const [logout, { loading: isLogoutLoading }] = useLogoutMutation();

  const apolloClient = useApolloClient();

  let body = null;

  // ? Data is loading
  if (loading) {
    body = <Spinner />;
    // ? User is not logged in!
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Button mr={2}>Login</Button>
        </NextLink>

        <NextLink href="/register">
          <Button mr={2}>Register</Button>
        </NextLink>
      </>
    );
    // ? User is Logged IN!
  } else {
    body = (
      <Flex position="sticky" zIndex={1} top={0}>
        <Button mr={2}>@{data.me.username}</Button>

        <NextLink href="/create-post">
          <Button mr={2}>Create Post</Button>
        </NextLink>

        <Button
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={isLogoutLoading}
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tomato" p={4} alignItems="center">
      <Box>
        <NextLink href="/">
          <Link>
            <Heading fontFamily="monospace" fontSize="xx-large">
              LiReddit
            </Heading>
          </Link>
        </NextLink>
      </Box>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};

export default Navbar;
