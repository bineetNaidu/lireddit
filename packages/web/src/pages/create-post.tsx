import { Box, Flex, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { createURQLclient } from '../utils/createURQLclient';

const CreatePost = () => {
  const [{ data, fetching }] = useMeQuery();
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();

  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace('/login');
    }
  }, [data, router, fetching]);

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ text: '', title: '' }}
        onSubmit={async (values) => {
          // ! No error handlings..
          const res = await createPost({ input: values });
          if (res.data?.createPost) {
            router.push('/');
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
                Create Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createURQLclient)(CreatePost);
