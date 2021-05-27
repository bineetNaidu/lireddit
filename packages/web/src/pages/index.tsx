import { withUrqlClient } from 'next-urql';
import { createURQLclient } from '../utils/createURQLclient';
import { usePostsQuery } from '../generated/graphql';
import { Layout } from '../components/Layout';
import NextLink from 'next/link';
import { Link } from '@chakra-ui/layout';

const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });
  return (
    <Layout>
      <h1>Hello Lireddit</h1>
      <br />
      <br />
      <NextLink href="/create-post">
        <Link>Create Post</Link>
      </NextLink>
      <hr />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createURQLclient, { ssr: true })(Index);
