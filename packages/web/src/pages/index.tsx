import NextLink from 'next/link';
import { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { createURQLclient } from '../utils/createURQLclient';
import { usePostsQuery } from '../generated/graphql';
import { Layout } from '../components/Layout';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Spinner } from '@chakra-ui/spinner';
import { UpdootLabel } from '../components/UpdootLabel';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return (
      <Text textAlign="center" mt={8} fontSize="xx-large" color="red">
        Something Went Wrong!
      </Text>
    );
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
        <Flex justifyContent="center">
          <Spinner size="xl" mx="auto" />
        </Flex>
      ) : (
        <Stack spacing={8} my={4}>
          {data!.posts.posts.map((p) => (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpdootLabel post={p} />
              <Box ml={3}>
                <Heading fontSize="x-large">{p.title}</Heading>
                <Text
                  fontSize="small"
                  fontStyle="italic"
                  fontWeight={200}
                  letterSpacing="0.8px"
                >
                  @{p.creator.username}
                </Text>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            px={8}
            mx="auto"
            my={5}
            onClick={() => {
              setVariables((prevState) => ({
                limit: prevState.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              }));
            }}
          >
            Load more!
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createURQLclient, { ssr: true })(Index);
