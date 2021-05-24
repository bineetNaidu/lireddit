import { FC } from 'react';
import { Formik, Form } from 'formik';
import { Box } from '@chakra-ui/layout';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { Button } from '@chakra-ui/button';
import { useRegisterMutation } from '../generated/graphql';

interface Props {}

const register: FC<Props> = ({}) => {
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          await register(values);
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
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default register;
