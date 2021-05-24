import { Text, Flex, Heading } from '@chakra-ui/react';
import { Container } from '../components/Container';

const product = () => (
  <Container height="100vh">
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgGradient="linear(to-l, #7928CA, #FF0080)"
      bgClip="text"
    >
      <Heading fontSize="6vw">Lireddit</Heading>
    </Flex>

    <Flex as="footer" py="8rem">
      <Text>Next ❤️ Chakra</Text>
    </Flex>
  </Container>
);

export default product;
