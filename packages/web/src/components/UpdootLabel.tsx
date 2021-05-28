import { FC, useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import { BasePostFieldFragment, useVoteMutation } from '../generated/graphql';

interface Props {
  post: BasePostFieldFragment;
}

export const UpdootLabel: FC<Props> = ({ post }) => {
  const [loading, setLoading] =
    useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>(
      'not-loading'
    );
  const [, vote] = useVoteMutation();

  const handleUpdoot = async () => {
    setLoading('updoot-loading');
    await vote({ postId: post.id, value: 1 });
    setLoading('not-loading');
  };

  const handleDowndoot = async () => {
    setLoading('downdoot-loading');
    await vote({ postId: post.id, value: -1 });
    setLoading('not-loading');
  };
  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      <IconButton
        aria-label="updoot post"
        size="xs"
        isLoading={loading === 'updoot-loading'}
        onClick={handleUpdoot}
      >
        <ChevronUpIcon size="24px" />
      </IconButton>
      {post.points}
      <IconButton
        aria-label="downdoot post"
        size="xs"
        isLoading={loading === 'downdoot-loading'}
        onClick={handleDowndoot}
      >
        <ChevronDownIcon size="24px" />
      </IconButton>
    </Flex>
  );
};
