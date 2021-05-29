import NextLink from 'next/link';
import { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { createURQLclient } from '../utils/createURQLclient';
import { useDeletePostMutation, usePostsQuery } from '../generated/graphql';
import { Layout } from '../components/Layout';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import { Button, IconButton } from '@chakra-ui/button';
import { Spinner } from '@chakra-ui/spinner';
import { UpdootLabel } from '../components/UpdootLabel';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return (
      <Text textAlign="center" mt={8} fontSize="xx-large" color="red">
        Something Went Wrong!
      </Text>
    );
  }

  return (
    <Layout>
      {!data && fetching ? (
        <Flex justifyContent="center">
          <Spinner size="xl" mx="auto" />
        </Flex>
      ) : (
        <Stack spacing={8} my={4}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Flex
                key={p.id}
                p={5}
                shadow="md"
                borderWidth="1px"
                position="relative"
              >
                <UpdootLabel post={p} />
                <Box ml={3} flex={1}>
                  <NextLink href={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="x-large">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text
                    fontSize="small"
                    fontStyle="italic"
                    fontWeight={200}
                    letterSpacing="0.8px"
                  >
                    @{p.creator.username}
                  </Text>

                  <Text flex={1} mt={4}>
                    {p.textSnippet}
                  </Text>
                  <Box position="absolute" top={4} right={4}>
                    <IconButton
                      aria-label="edit button"
                      mr={2}
                      colorScheme="teal"
                      variant="ghost"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete button"
                      colorScheme="red"
                      variant="ghost"
                      onClick={async () => await deletePost({ id: p.id })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Flex>
            )
          )}
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
