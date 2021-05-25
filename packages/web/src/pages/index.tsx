import Navbar from '../components/Navbar';
import { withUrqlClient } from 'next-urql';
import { createURQLclient } from '../utils/createURQLclient';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <div>
      <Navbar />
      <h1>Hello Lireddit</h1>
      <hr />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </div>
  );
};

export default withUrqlClient(createURQLclient, { ssr: true })(Index);
