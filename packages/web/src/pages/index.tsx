import { withUrqlClient } from 'next-urql';
import { createURQLclient } from '../utils/createURQLclient';
import { usePostsQuery } from '../generated/graphql';
import { Layout } from '../components/Layout';
import NextLink from 'next/link';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Spinner } from '@chakra-ui/spinner';

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });

  if (!fetching && !data) {
    return <div>Something Went Wrong!</div>;
  }

  return (
    <Layout>
      <Flex>
        <Heading fontFamily="monospace" fontSize="xxx-large">
          LiReddit
        </Heading>
        <Box ml="auto" mt="auto" mb="auto">
          <NextLink href="/create-post">
            <Link>Create Post</Link>
          </NextLink>
        </Box>
      </Flex>
      <br />
      <hr />
      {!data && fetching ? (
        <Spinner size="xl" />
      ) : (
        <Stack spacing={8}>
          {data!.posts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="x-large">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data && (
        <Flex>
          <Button px={8} mx="auto" my={5}>
            Load more!
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createURQLclient, { ssr: true })(Index);
