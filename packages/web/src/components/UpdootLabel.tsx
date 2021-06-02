import { FC, useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import {
  BasePostFieldFragment,
  useVoteMutation,
  VoteMutation,
} from '../generated/graphql';
import gql from 'graphql-tag';
import { ApolloCache } from '@apollo/client';
import { useRouter } from 'next/router';

interface Props {
  post: BasePostFieldFragment;
}

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });
  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints =
      (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

export const UpdootLabel: FC<Props> = ({ post }) => {
  const router = useRouter();
  const [loading, setLoading] =
    useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>(
      'not-loading'
    );
  const [vote, { error }] = useVoteMutation();
  if (error && error.message.toLowerCase().includes('not authenticated')) {
    router.replace('/login');
  }
  const handleUpdoot = async () => {
    if (post.voteStatus === 1) return;
    setLoading('updoot-loading');
    await vote({
      variables: { postId: post.id, value: 1 },
      update: (cache) => updateAfterVote(1, post.id, cache),
    });
    setLoading('not-loading');
  };

  const handleDowndoot = async () => {
    if (post.voteStatus === -1) return;
    setLoading('downdoot-loading');
    await vote({
      variables: { postId: post.id, value: -1 },
      update: (cache) => updateAfterVote(-1, post.id, cache),
    });
    setLoading('not-loading');
  };
  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      <IconButton
        aria-label="updoot post"
        size="xs"
        isLoading={loading === 'updoot-loading'}
        onClick={handleUpdoot}
        colorScheme={post.voteStatus === 1 ? 'green' : undefined}
      >
        <ChevronUpIcon size="24px" />
      </IconButton>
      {post.points}
      <IconButton
        aria-label="downdoot post"
        size="xs"
        isLoading={loading === 'downdoot-loading'}
        onClick={handleDowndoot}
        colorScheme={post.voteStatus === -1 ? 'red' : undefined}
      >
        <ChevronDownIcon size="24px" />
      </IconButton>
    </Flex>
  );
};
