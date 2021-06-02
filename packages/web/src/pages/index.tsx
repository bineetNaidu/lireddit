import NextLink from 'next/link';
import {
  useDeletePostMutation,
  usePostsQuery,
  useMeQuery,
} from '../generated/graphql';
import { Layout } from '../components/Layout';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import { Button, IconButton } from '@chakra-ui/button';
import { Spinner } from '@chakra-ui/spinner';
import { UpdootLabel } from '../components/UpdootLabel';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { withApollo } from '../lib/withApollo';

const Index = () => {
  const { data, loading, fetchMore } = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });
  const { data: meData } = useMeQuery();

  const [deletePost] = useDeletePostMutation();

  if (!loading && !data) {
    return (
      <Text textAlign="center" mt={8} fontSize="xx-large" color="red">
        Something Went Wrong!
      </Text>
    );
  }

  return (
    <Layout>
      {!data && loading ? (
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
                  {p.creator.id !== meData?.me?.id ? null : (
                    <Box position="absolute" top={4} right={4}>
                      <NextLink href={`/post/edit/${p.id}`}>
                        <IconButton
                          aria-label="edit button"
                          mr={2}
                          colorScheme="teal"
                          variant="ghost"
                        >
                          <EditIcon />
                        </IconButton>
                      </NextLink>
                      <IconButton
                        aria-label="delete button"
                        colorScheme="red"
                        variant="ghost"
                        onClick={async () =>
                          await deletePost({
                            variables: { id: p.id },
                            update: (cache) => {
                              cache.evict({ id: 'Post:' + p.id });
                            },
                          })
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
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
            isLoading={loading}
            onClick={() => {
              fetchMore({
                variables: {
                  limit: 15,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
              });
            }}
          >
            Load more!
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
