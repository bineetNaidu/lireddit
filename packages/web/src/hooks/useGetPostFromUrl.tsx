import { useRouter } from 'next/router';
import { useGetPostQuery } from '../generated/graphql';

export const useGetPostFromUrl = () => {
  const router = useRouter();

  const intId =
    typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;

  return useGetPostQuery({
    pause: intId === -1,
    variables: { id: intId },
  });
};
