import { withUrqlClient } from 'next-urql';
import { Box, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import { createURQLclient } from '../../utils/createURQLclient';
import { useRouter } from 'next/router';
import { useGetPostQuery } from '../../generated/graphql';
import { Layout } from '../../components/Layout';

const Post = () => {
  const router = useRouter();
  const intId =
    typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const [{ data, fetching }] = useGetPostQuery({
    pause: intId === -1,
    variables: { id: intId },
  });

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
