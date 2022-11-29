import { User } from './users.interface';

export interface ChatChannel {
  id: string;
  name: string;
  unread?: number;
  manualUnread?: number;
}

export interface ChatMessage {
  id: string;
  author: User;
  channel: ChatChannel;
  text: string;
  readBy: User[] | null;
  unReadBy: User[] | null;
  replyTo: ChatMessage | null;
  thread: ChatMessage[] | null;
  createdAt: Date;
  updatedAt: Date;
}
