import { withUrqlClient } from 'next-urql';
import Navbar from '../components/Navbar';
import { createURQLclient } from '../utils/createURQLclient';

const Index = () => (
  <div>
    <Navbar />
    <h1>Hello Lireddit</h1>
  </div>
);

export default withUrqlClient(createURQLclient, { ssr: true })(Index);
