import { getRepository } from 'typeorm';
import { ChatChannelEntity } from '@entities/chatChannel.entity';
import { ChatMessageEntity } from '@entities/chatMessage.entity';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { ChatChannel, ChatMessage } from '@/interfaces/chat.interface';
import { ChatNewMessageDto, ChatNewChannelDto } from '@dtos/users.dto';
import * as PusherTypes from 'pusher';

class ChatService {
  public channels = ChatChannelEntity;
  public messages = ChatMessageEntity;
  public users = UserEntity;

  public async findChannels(userData: User): Promise<ChatChannel[]> {
    const channelRepository = getRepository(this.channels);
    const channels: ChatChannel[] = await channelRepository
      .createQueryBuilder('channel')
      .loadRelationCountAndMap('channel.unread', 'channel.messages', 'message', q =>
        q.where(':userId NOT IN (SELECT "userEntityId" FROM chat_message_entity_read_by_user_entity WHERE "chatMessageEntityId" = message.id)', {
          userId: userData.id,
        }),
      )
      .loadRelationCountAndMap('channel.manualUnread', 'channel.messages', 'message', q =>
        q.where(':userId IN (SELECT "userEntityId" FROM chat_message_entity_un_read_by_user_entity WHERE "chatMessageEntityId" = message.id)', {
          userId: userData.id,
        }),
      )
      .getMany();
    return channels;
  }

  public async createChannel(pusher: PusherTypes, userData: User, channelData: ChatNewChannelDto) {
    if (isEmpty(channelData)) throw new HttpException(400, "You're not commentData");

    const channelRepository = getRepository(this.channels);

    const createChannelData = await channelRepository.save({
      ...channelData,
    });

    pusher.trigger('chat-base-events', 'chat:new-channel-created', JSON.stringify(createChannelData));

    return createChannelData;
  }

  public async renameChannel(pusher: PusherTypes, userData: User, channelData: ChatNewChannelDto) {
    if (isEmpty(channelData)) throw new HttpException(400, "You're not commentData");

    const channelRepository = getRepository(this.channels);

    const renameChannelData = await channelRepository.save({
      ...channelData,
    });

    pusher.trigger('chat-base-events', 'chat:channel-renamed', JSON.stringify(renameChannelData));

    return renameChannelData;
  }

  public async findMessages(channelId: string): Promise<ChatMessage[]> {
    const messagesRepository = getRepository(this.messages);
    const messages: ChatMessage[] = await messagesRepository
      .createQueryBuilder('messages')
      .andWhere('messages.channel = :channelId AND messages.replyTo IS NULL', { channelId })
      .leftJoinAndSelect('messages.channel', 'channel')
      .leftJoinAndSelect('messages.author', 'author')
      .leftJoinAndSelect('messages.readBy', 'readBy')
      .leftJoinAndSelect('messages.unReadBy', 'unReadBy')
      .leftJoinAndSelect('messages.thread', 'thread')
      .leftJoinAndSelect('thread.channel', 'channelThread')
      .leftJoinAndSelect('thread.author', 'authorThread')
      .leftJoinAndSelect('thread.readBy', 'readByThread')
      .leftJoinAndSelect('thread.unReadBy', 'unReadByThread')
      .leftJoin('thread.replyTo', 'replyThread')
      .addSelect('replyThread.id')
      .orderBy('messages.createdAt', 'ASC')
      .addOrderBy('thread.createdAt', 'ASC')
      .getMany();
    return messages;
  }

  public async createMessage(pusher: PusherTypes, channelId: string, userData: User, messageData: ChatNewMessageDto) {
    if (isEmpty(messageData)) throw new HttpException(400, "You're not commentData");

    const channelRepository = getRepository(this.channels);
    const messagesRepository = getRepository(this.messages);
    const usersRepository = getRepository(this.users);

    const user: User = await usersRepository.findOne({ id: userData.id });
    let channel: ChatChannel = await channelRepository.findOne({ id: channelId });

    if (!channel?.id && messageData.createChannel) {
      channel = await this.createChannel(pusher, userData, { name: messageData.createChannel, id: channelId });
    }

    let replyTo: any;
    if (messageData.replyToId) replyTo = await messagesRepository.findOne({ where: { id: messageData.replyToId }, relations: ['thread'] });

    const createMessageData = await messagesRepository.save({
      channel: channel,
      author: {
        id: user.id,
        name: user.name,
        picture: user.picture,
      },
      text: messageData.text,
      replyTo,
      thread: [],
      readBy: [user],
      unReadBy: [],
    });

    if (replyTo) {
      if (replyTo.thread) replyTo.thread.push({ id: createMessageData.id });
      else replyTo.thread = [{ id: createMessageData.id }];

      // await messagesRepository.update({ id: messageData.replyToId }, { thread: replyTo.thread });
      await messagesRepository.save(replyTo);
    }

    pusher.trigger('chat-base-events', 'chat:new-message-in-channel', { channel: { id: channelId }, author: { id: user.id } });
    pusher.trigger(channelId, 'chat:new-message', createMessageData);

    return messageData;
  }

  public async readMessage(userData: User, messageId: string) {
    if (isEmpty(messageId)) throw new HttpException(400, "You're not commentData");

    const messagesRepository = getRepository(this.messages);
    const usersRepository = getRepository(this.users);

    const user: User = await usersRepository.findOne({ id: userData.id });
    const message: ChatMessage = await messagesRepository.findOne({
      where: { id: messageId },
      relations: ['readBy'],
    });
    if (!message.readBy) message.readBy = [];
    if (message.readBy.findIndex((u: User) => u.id === userData.id) === -1) message.readBy.push(user);

    const readMessageData = await messagesRepository.save(message);

    return readMessageData;
  }

  public async manualReadMessage(userData: User, messageId: string) {
    if (isEmpty(messageId)) throw new HttpException(400, "You're not commentData");

    const messagesRepository = getRepository(this.messages);

    const message: ChatMessage = await messagesRepository.findOne({
      where: { id: messageId },
      relations: ['unReadBy'],
    });
    if (message.unReadBy && message.unReadBy.length) {
      const delIndex = message.unReadBy.findIndex((u: User) => u.id === userData.id);
      if (delIndex > -1) message.unReadBy.splice(delIndex, 1);
    }

    const unreadMessageData = await messagesRepository.save(message);

    return unreadMessageData;
  }

  public async readAllMessages(userData: User, channelId: string) {
    if (isEmpty(channelId)) throw new HttpException(400, "You're not commentData");

    const usersRepository = getRepository(this.users);
    const messagesRepository = getRepository(this.messages);

    const user: User = await usersRepository.findOne({ id: userData.id });
    const messages: ChatMessage[] = await messagesRepository.find({
      where: { channel: channelId },
      relations: ['readBy', 'unReadBy'],
    });
    messages.forEach((message: ChatMessage) => {
      if (!message.readBy) message.readBy = [];
      if (message.readBy.findIndex((u: User) => u.id === userData.id) === -1) message.readBy.push(user);
      if (message.unReadBy && message.unReadBy.length) {
        const delIndex = message.unReadBy.findIndex((u: User) => u.id === userData.id);
        if (delIndex > -1) message.unReadBy.splice(delIndex, 1);
      }
    });

    const readAllMessagesData = await messagesRepository.save(messages);

    return readAllMessagesData;
  }

  public async unreadMessage(userData: User, messageId: string) {
    if (isEmpty(messageId)) throw new HttpException(400, "You're not commentData");

    const messagesRepository = getRepository(this.messages);
    const usersRepository = getRepository(this.users);

    const user: User = await usersRepository.findOne({ id: userData.id });

    const message: ChatMessage = await messagesRepository.findOne({
      where: { id: messageId },
      relations: ['unReadBy'],
    });
    if (!message.unReadBy) message.unReadBy = [];
    message.unReadBy.push(user);

    const unreadMessageData = await messagesRepository.save(message);

    return unreadMessageData;
  }
}

export default ChatService;
