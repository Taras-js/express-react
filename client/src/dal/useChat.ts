import { useState } from "react";
import { User } from '../entities';
import { ChatChannel, ChatMessage, ChatMessageHeaders, ChatMessageReplyProps } from '../entities/chat';
import { useChatChannels } from '../dal';
import Pusher from 'pusher-js';
import axios from 'axios';

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

type Result = {
  chatChannels: ChatChannel[],
  handleChannel: (channelId: string) => void,
  activeChannelId: string,
  messages: any,
  retrieveMessages: (channelId: string) => Promise<void>,
  replyTo?: ChatMessageReplyProps,
  setReplyTo: (message?: ChatMessageReplyProps) => void
};

const APP_KEY = process.env.REACT_APP_PUSHER_APP_KEY || '',
  APP_CLUSTER = process.env.REACT_APP_PUSHER_APP_CLUSTER;

const pusher = new Pusher(APP_KEY, {
  cluster: APP_CLUSTER,
});

const baseEventsSubscriber = pusher.subscribe('chat-base-events');

let channelSubscriber: any;
// const channels: any = {};
const messages: any = {};
const refreshChannels: any = {};

export function useChat(controlFunctions: any, user?: User, searchParams?: URLSearchParams): Result {

  const [replyTo, setReplyTo] = useState<ChatMessageReplyProps>();
  const [activeChannelId, setActiveChannelId] = useState('');
  const { chatChannels, mutate: mutateChatChannels } = useChatChannels(searchParams);

  const retrieveMessages = async (channelId: string) => {
    if (!messages[channelId]?.length || refreshChannels[channelId]) {
      messages[channelId] = (await axios.get('/chat/' + channelId + '/messages')).data?.data;
      delete refreshChannels[channelId];
    }
  }

  const pushMessage = async (message: ChatMessage) => {
    if (!message.channel?.id) return;
    if (!messages[message.channel.id]?.length) {
      await retrieveMessages(message.channel.id)
    } else {
      if (message.replyTo?.id) {
        messages[message.channel.id].find((m: ChatMessage) => m.id === message.replyTo.id)?.thread?.push(message);
      } else messages[message.channel.id].push(message);
    }
    controlFunctions.forceUpdate();
  }

  const cancelSubscription = (channelId: string) => {
    channelSubscriber.unbind()
    pusher.unsubscribe(channelId);
  }

  const subscribeChannel = (channelId: string) => {
    if (channelSubscriber?.name === channelId) return;
    if (channelSubscriber) cancelSubscription(channelId);
    channelSubscriber = pusher.subscribe(channelId);
    channelSubscriber.bind('chat:new-message', (message: ChatMessage) => pushMessage(message));
  }

  const handleChannel = async (channelId: string) => {
    setActiveChannelId(channelId);
    subscribeChannel(channelId);
    await retrieveMessages(channelId);
    controlFunctions.forceUpdate();
  }

  baseEventsSubscriber.unbind();
  baseEventsSubscriber.bind('chat:new-channel-created', (channel: ChatChannel) => {
    mutateChatChannels();
  });
  baseEventsSubscriber.bind('chat:channel-renamed', (channel: ChatChannel) => {
    const chatChannel = chatChannels[chatChannels.findIndex(c => c.id === channel.id)];
    if (chatChannel) {
      chatChannel.name = channel.name;
      controlFunctions.forceUpdate();
    }
  });
  baseEventsSubscriber.bind('chat:new-message-in-channel', (message: ChatMessageHeaders) => {
    refreshChannels[message.channel.id] = true;
    if (message.author.id !== user?.id) {
      const chatChannel = chatChannels[chatChannels.findIndex(c => c.id === message.channel.id)];
      if (chatChannel) {
        chatChannel.unread++;
        controlFunctions.forceUpdate();
      }
    }
  });

  return {
    chatChannels,
    handleChannel,
    activeChannelId,
    messages,
    retrieveMessages,
    replyTo,
    setReplyTo
  };
}
