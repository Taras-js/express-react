import { List, Comment, Tooltip } from 'antd';
import moment from "moment";
import { User } from '../../entities';
import { ChatChannel, ChatMessage, ChatMessageReplyProps } from '../../entities/chat';
import axios from 'axios';
import "./Messages.css";

interface MessagesProps {
  user: User;
  chatChannel: ChatChannel;
  messages: ChatMessage[];
  setReplyTo: (message?: ChatMessageReplyProps) => void;
  controlFunctions: any;
  style?: any;
}

interface MessageListProps {
  messages: ChatMessage[];
  user: User;
  setReplyTo: (message?: ChatMessageReplyProps) => void;
  handleReadMessage: (message: ChatMessage, user: User, manual?: boolean) => void;
  setUnread: (message: ChatMessage, user: User) => void
}

const MessageList = ({ messages, user, setReplyTo, handleReadMessage, setUnread }: MessageListProps ) => (
  <List
    loading={!messages}
    className="comment-list"
    itemLayout="horizontal"
    dataSource={messages}
    renderItem={(item: ChatMessage) => {
      const manualUnread = item.unReadBy.find(u => u.id === user.id);
      const read = !manualUnread && item.readBy.find(u => u.id === user.id);
      return (
        <li id={item.id} className={read ? '' : 'unread'} onMouseLeave={(e) => { if (!read && !manualUnread) handleReadMessage(item, user); e.stopPropagation(); }}>
          <Comment
            actions={[
              <span onClick={() => setReplyTo(item.replyTo ? { id: item.replyTo.id, text: item.text } : item)}>Reply to</span>,
              (read && <span onClick={() => setUnread(item, user) }>Mark as unread</span>),
              (manualUnread && <span onClick={() => handleReadMessage(item, user, true) }>Mark as read</span>)
            ]}
            author={item.author?.name}
            avatar={item.author?.picture}
            content={item.text}
            datetime={(
              <Tooltip title={moment(item.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}>
                <span>{moment(item.updatedAt).fromNow()}</span>
              </Tooltip>
            )}
          >
            {item.thread?.length && <MessageList messages={item.thread} setReplyTo={setReplyTo} handleReadMessage={handleReadMessage} user={user} setUnread={setUnread} />}
          </Comment>
        </li>
      )}
    }
  />
);

const Messages = ({ user, chatChannel, messages, setReplyTo, controlFunctions, style }: MessagesProps) => {
  const readMessage = (chatChannel: ChatChannel, message: ChatMessage, user: User, manual?: boolean, autoAlso?: boolean) => {
    if (manual) {
      const delIndex = message.unReadBy.findIndex((u: User) => u.id === user?.id);
      if (delIndex > -1) {
        message.unReadBy.splice(delIndex, 1);
        if (chatChannel?.manualUnread > 0) chatChannel.manualUnread--;
      }
    }
    if (autoAlso && message.readBy.findIndex((u: User) => u.id === user.id) === -1) {
        message.readBy.push(user);
        if (chatChannel?.unread > 0) chatChannel.unread--;
    }
  }
  controlFunctions.handleAllRead = async (messages: ChatMessage[]) => {
    if (!user) return;
    axios.put(`/chat/read-all-messages`, { channelId: chatChannel.id });
    messages.forEach((message: ChatMessage) => {
      if (message.thread.length) message.thread.forEach((m: ChatMessage) => {
        readMessage(chatChannel, m, user, true, true);
      });
      readMessage(chatChannel, message, user, true, true);
    });
  };
  const setUnread = async (message: ChatMessage, user: User, ) => {
    axios.put(`/chat/unread-message`, { id: message.id });
    message.unReadBy.push(user);
    chatChannel.manualUnread++;
    controlFunctions.forceUpdate();
  }
  const handleReadMessage = async (message: ChatMessage, user: User, manual?: boolean) => {
    axios.put(`/chat/read-message`, { id: message.id, manual });
    readMessage(chatChannel, message, user, manual, !manual);
    controlFunctions.forceUpdate();
  }
  return (
    <div className="messages-window" style={style}>
      <MessageList messages={messages} setReplyTo={setReplyTo} handleReadMessage={handleReadMessage} setUnread={setUnread} user={user} />
    </div>
  )
};

export default Messages;
