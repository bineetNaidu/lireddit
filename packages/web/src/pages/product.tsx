import { Text, Flex, Heading } from '@chakra-ui/react';
import { Layout } from '../components/Layout';

const product = () => (
  <Layout variant="regular">
    <Flex
      justifyContent="center"
      alignItems="center"
      bgGradient="linear(to-l, #7928CA, #FF0080)"
      bgClip="text"
    >
      <Heading fontSize="6vw">Lireddit</Heading>
    </Flex>

    <Flex as="footer">
      <Text>Next ❤️ Chakra</Text>
    </Flex>
  </Layout>
);

export default product;
