import { User } from '../entities';

export interface ChatMessage {
  id: string;
  author: User;
  channel: ChatChannel;
  text: string;
  updatedAt: Date;
  thread: ChatMessage[];
  replyTo: ChatMessage;
  readBy: User[];
  unReadBy: User[];
}

export interface ChatMessageHeaders {
  author: User;
  channel: ChatChannel;
}

export interface ChatChannel {
  id: string;
  name: string;
  unread: number;
  manualUnread: number;
}

export interface ChatNotify {
  unread: number;
  manualUnread: number;
}

export interface ChatMessageReplyProps {
  id: string;
  text: string;
}
