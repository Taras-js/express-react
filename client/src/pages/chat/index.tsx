import { PageHeader, Spin, Tabs, Form, Input, Button, Badge, Row, Col, Typography } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from 'antd/lib/form/Form';
import { usePermissions } from '../../common/usePermissions/usePermissions';
import { ChatPermissions } from '../../common/usePermissions/permissions';
import { useSession, useChat } from '../../dal';
import { ChatChannel } from '../../entities/chat';
import Layout from '../../layouts/chat/Chat';
import Messages from '../../components/chat/Messages';
import ReplyForm from '../../components/chat/Editor';

import axios from 'axios';
import './index.css';

const { TabPane } = Tabs;
const { Paragraph } = Typography;

const controlFunctions: any = {};

const Chat = () => {
  const [, updateState] = useState({});
  controlFunctions.forceUpdate = useCallback(() => updateState({}), []);

  const [ searchParams ] = useSearchParams();
  const { session } = useSession(searchParams);
  const [formNewChannel] = useForm();
  const { hasPermission } = usePermissions();

  const {
    chatChannels,
    activeChannelId,
    handleChannel,
    messages,
    replyTo,
    setReplyTo
  } = useChat(controlFunctions, session, searchParams);

  const createNewChannel = async (values: { name: string; }) => {
    const result = await axios.post(`/chat/new-channel`, { name: values.name });
    if (result.data?.data?.id){
      chatChannels.push({ id: result.data.data.id, name: result.data.data.name, unread: 0, manualUnread: 0 });
      handleChannel(result.data.data.id);
      formNewChannel.resetFields();
    }
  };

  const renameChannel = async (name: string) => {
    const result = await axios.post(`/chat/rename-channel`, { id: activeChannelId, name: name });
    if (result.data?.data?.id){
      chatChannels[chatChannels.findIndex(c => c.id === activeChannelId)].name = name;
      controlFunctions.forceUpdate();
    }
  };

  useEffect(() => {
    if (!activeChannelId && chatChannels?.length) {
      const firstUnread = chatChannels.findIndex(c => c.unread > 0);
      handleChannel(chatChannels[firstUnread > -1 ? firstUnread : 0].id);
    }
  });

  if (!chatChannels || !session)
    return (
      <Layout>
        <Spin />
      </Layout>
    );

  return (
    <Layout>
      <Tabs
        tabPosition="left"
        style={{ height: "100vh", padding: 15 }}
        tabBarStyle={{ width: 200 }}
        tabBarGutter={0}
        activeKey={activeChannelId}
        onChange={handleChannel}
        className="chat-tabs"
        tabBarExtraContent={{ left: (
          <Form form={formNewChannel} onFinish={createNewChannel} className="new-channel-header">
            <Row>
              <Col span={19}>
                <Form.Item name="name" style={{ marginBottom: 0 }} rules={[{ required: true, message: 'Channel name is required' }]}>
                  <Input placeholder="New channel..." style={{ borderColor: "rgba(0,0,0,0)", paddingLeft: 0 }} />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item style={{ marginBottom: '10px' }}>
                  <Button type="text" icon={<PlusOutlined />} htmlType="submit" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        ) }}
      >
        {chatChannels.sort((a,b) => a.name.localeCompare(b.name, "en", {sensitivity: 'variant', caseFirst: "upper"})).map((channel: ChatChannel) => (
          <TabPane
            tab={(
              <Row wrap={false} align="middle">
                <Col flex="auto" className="chat-tab-channel">{channel.name}</Col>
                <Col flex="none" className="tab-badges">
                  {!channel.unread && <Badge dot={Boolean(channel.manualUnread)} />}
                  <Badge count={channel.unread} />
                </Col>
              </Row>
            )}
            key={channel.id}
          >
            <PageHeader
              className="chat-header"
              title={
                <Paragraph
                  editable={
                    hasPermission(ChatPermissions.CHAT_MANAGE)
                      ? { onChange: renameChannel, triggerType: ['icon', 'text'], enterIcon: null }
                      : false
                  }
                >
                  {channel.name}
                </Paragraph>
              }
              extra={[
                (channel.unread || channel.manualUnread ? <Button key="1" type="default" onClick={() => { controlFunctions.handleAllRead(messages[channel.id]); controlFunctions.forceUpdate(); }}>Mark all as read</Button> : null)
              ]}
            />
            <Messages
              user={session}
              chatChannel={chatChannels[chatChannels.findIndex(c => c.id === activeChannelId)]}
              messages={messages[channel.id]}
              setReplyTo={setReplyTo}
              controlFunctions={controlFunctions}
              style={{ height: "calc(100vh - 269px)" }}
            />
          </TabPane>
        ))}
      </Tabs>
      <ReplyForm
        session={session}
        channel={activeChannelId}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        style={{ position: "absolute", bottom: "30px", right: "30px", width: "calc(100vw - 270px)" }}
      />
    </Layout>
  );
};

export default Chat;
