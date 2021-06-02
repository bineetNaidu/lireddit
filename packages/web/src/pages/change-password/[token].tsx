import NextLink from 'next/link';
import { useState } from 'react';
import { Button, Box, Link, Flex } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from '../../generated/graphql';
import { withApollo } from '../../lib/withApollo';

const ChangePassword: NextPage<{}> = () => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [tokenErr, setTokenErr] = useState('');
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const res = await changePassword({
            variables: {
              newPassword: values.newPassword,
              token:
                typeof router.query.token === 'string'
                  ? router.query.token
                  : '',
            },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.changePassword.user,
                },
              });

              cache.evict({ fieldName: 'posts:{}' });
            },
          });

          if (res.data?.changePassword!.errors) {
            const errMap = toErrorMap(res.data.changePassword.errors);
            if ('token' in errMap) {
              setTokenErr(errMap.token);
            }
            setErrors(errMap);
          }
          if (res.data?.changePassword!.user) {
            // worked
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New Password"
              label="New Password"
              type="password"
            />
            {tokenErr ? (
              <Flex mt={4}>
                <Box mr={4} color="red">
                  {tokenErr}
                </Box>
                <NextLink href="/forgot-password">
                  <Link>Forgot your password?</Link>
                </NextLink>
              </Flex>
            ) : null}
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo()(ChangePassword);
