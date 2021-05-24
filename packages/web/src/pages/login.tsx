import { FC } from 'react';
import { Formik, Form } from 'formik';
import { Box } from '@chakra-ui/layout';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Button } from '@chakra-ui/button';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface Props {}

const login: FC<Props> = ({}) => {
  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const res = await login({ options: values });

          if (res.data?.login?.errors) {
            setErrors(toErrorMap(res.data.login.errors));
          } else if (res.data?.login?.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantcolor="teal"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default login;
