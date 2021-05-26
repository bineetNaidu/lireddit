import { Box } from '@chakra-ui/layout';
import { FC } from 'react';

export type VariantType = 'small' | 'regular';

interface WrapperProps {
  variant?: VariantType;
}

export const Wrapper: FC<WrapperProps> = ({
  children,
  variant = 'regular',
}) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === 'regular' ? '800px' : '400px'}
      w="100%"
    >
      {children}
    </Box>
  );
};
