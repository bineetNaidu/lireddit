import { withUrqlClient } from 'next-urql';
import { Box, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import { createURQLclient } from '../../utils/createURQLclient';
import { Layout } from '../../components/Layout';
import { useGetPostFromUrl } from '../../hooks/useGetPostFromUrl';

const Post = () => {
  const [{ data, fetching }] = useGetPostFromUrl();

  if (fetching) {
    return (
      <Layout>
        <Flex justifyContent="center">
          <Spinner size="xl" mx="auto" />
        </Flex>
      </Layout>
    );
  }

  if (!fetching && !data) {
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

export default withUrqlClient(createURQLclient, { ssr: true })(Post);
