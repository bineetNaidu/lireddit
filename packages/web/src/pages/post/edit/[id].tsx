import { Box, Flex, Button, Text, Spinner } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { useGetPostFromUrl } from '../../../hooks/useGetPostFromUrl';
import { createURQLclient } from '../../../utils/createURQLclient';
import {
  useGetPostQuery,
  useUpdatePostMutation,
} from '../../../generated/graphql';
import { useRouter } from 'next/router';

const EditPost = () => {
  const router = useRouter();
  const intId = useGetPostFromUrl();
  const [{ data, fetching }] = useGetPostQuery({
    pause: intId === -1,
    variables: { id: intId },
  });
  const [, updatePost] = useUpdatePostMutation();

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
    <Layout variant="small">
      <Formik
        initialValues={{ text: data.post.text, title: data.post.title }}
        onSubmit={async (values) => {
          const res = await updatePost({ id: intId, ...values });

          if (res.data?.updatePost) {
            router.push(`/post/${intId}`);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Title" label="Title" />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="body..."
                label="Body"
              />
            </Box>
            <Flex>
              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                variantcolor="teal"
              >
                Update Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createURQLclient)(EditPost);
