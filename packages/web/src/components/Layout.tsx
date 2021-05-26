import Navbar from './Navbar';
import { FC } from 'react';
import { VariantType, Wrapper } from './Wrapper';

interface Props {
  variant?: VariantType;
}

export const Layout: FC<Props> = ({ children, variant }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};
