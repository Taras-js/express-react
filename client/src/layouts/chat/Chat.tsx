import { ReactNode } from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

const Chat = ({
  children,
}: {
  children: ReactNode;
}) => {


  return (
    <Layout>
      <Content>
        {children}
      </Content>
    </Layout>
  );
};

export default Chat;
