import { Box, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import { Layout } from '../../components/Layout';
import { useGetPostFromUrl } from '../../hooks/useGetIntId';
import { useGetPostQuery } from '../../generated/graphql';

const Post = () => {
  const intId = useGetPostFromUrl();
  const { data, loading } = useGetPostQuery({
    skip: intId === -1,
    variables: { id: intId },
  });

  if (loading) {
    return (
      <Layout>
        <Flex justifyContent="center">
          <Spinner size="xl" mx="auto" />
        </Flex>
      </Layout>
    );
  }

  if (!loading && !data) {
    return (
      <Layout>
        <Text textAlign="center" mt={8} fontSize="xx-large" color="red">
          Something Went Wrong!
        </Text>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Box>
        <Text textAlign="center" mt={8} fontSize="xx-large" color="red">
          Couldn't Look up the post. Sorry!
        </Text>
      </Box>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Text>{data.post.text}</Text>
    </Layout>
  );
};

export default Post;
