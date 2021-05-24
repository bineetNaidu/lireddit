import NextLink from 'next/link';
import { Box, Flex, Link } from '@chakra-ui/layout';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Spinner } from '@chakra-ui/spinner';
import { Button } from '@chakra-ui/button';

const Navbar = () => {
  const [{ data, fetching }] = useMeQuery();
  const [{ fetching: isLogoutLoading }, logout] = useLogoutMutation();

  let body = null;

  // ? Data is loading
  if (fetching) {
    body = <Spinner />;
    // ? User is not logged in!
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>

        <NextLink href="/register">
          <Link mr={2}>Register</Link>
        </NextLink>
      </>
    );
    // ? User is Logged IN!
  } else {
    body = (
      <Flex>
        <Box mr={2}>@{data.me.username}</Box>
        <Button
          onClick={() => logout()}
          isLoading={isLogoutLoading}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tomato" p={4}>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};

export default Navbar;
