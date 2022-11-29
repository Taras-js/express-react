import { Spin } from 'antd';
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useSession, useChat } from '../../dal';
import Layout from '../../layouts/chat/Chat';
import Messages from '../../components/chat/Messages';
import ReplyForm from '../../components/chat/Editor';

import './index.css';

type UrlParams = {
  id: string;
};


const controlFunctions: any = {};

const ChannelChat = () => {
  const { id } = useParams<UrlParams>();
  const [, updateState] = useState({});
  controlFunctions.forceUpdate = useCallback(() => updateState({}), []);

  const [ searchParams ] = useSearchParams();
  const { session } = useSession(searchParams);

  const {
    chatChannels,
    activeChannelId,
    handleChannel,
    messages,
    replyTo,
    setReplyTo
  } = useChat(controlFunctions, session, searchParams);

  const chatChannel = chatChannels?.[chatChannels.findIndex(c => c.id === id)];

  useEffect(() => {
    if (!activeChannelId && chatChannels?.length && id) {
      handleChannel(id);
    }
  });

  if (!chatChannels || !session || !id)
    return (
      <Layout>
        <Spin />
      </Layout>
    );

  return (
    <Layout>
      <div style={{ padding: 20 }}>
        <Messages
          user={session}
          chatChannel={chatChannel}
          messages={messages[id]}
          setReplyTo={setReplyTo}
          controlFunctions={controlFunctions}
          style={{ height: "calc(100vh - 230px)" }}
        />
        <ReplyForm
          session={session}
          channel={id}
          channelName={searchParams.get('channel-name') || id}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
        />
      </div>
    </Layout>
  );
};

export default ChannelChat;
