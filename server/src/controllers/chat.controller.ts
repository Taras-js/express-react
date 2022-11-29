import { NextFunction, Response } from 'express';
import { ChatChannel, ChatMessage } from '@interfaces/chat.interface';
import ChatService from '@services/chat.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ChatNewMessageDto, ChatNewChannelDto } from '@dtos/users.dto';
import { User } from '@/interfaces/users.interface';
import Pusher from 'pusher';

class ChatController {
  public chatService = new ChatService();

  public pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });

  public getChannels = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const findChannels: ChatChannel[] = await this.chatService.findChannels(userData);
      res.status(200).json({ data: findChannels, message: 'findChannels' });
    } catch (error) {
      next(error);
    }
  };

  public newChannel = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const newChannelData: ChatNewChannelDto = req.body;
      const createChannelData = await this.chatService.createChannel(this.pusher, userData, newChannelData);
      res.status(201).json({ data: createChannelData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public renameChannel = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const renameChannelData: ChatNewChannelDto = req.body;
      const renamedChannelData = await this.chatService.renameChannel(this.pusher, userData, renameChannelData);
      res.status(201).json({ data: renamedChannelData, message: 'renamed' });
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findMessages: ChatMessage[] = await this.chatService.findMessages(req.params.id);
      res.status(200).json({ data: findMessages, message: 'findMessages' });
    } catch (error) {
      next(error);
    }
  };

  public sendMessage = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const channelId = req.params.id;
      const userData: User = req.user;
      const messageData: ChatNewMessageDto = req.body;
      const createMessageData = await this.chatService.createMessage(this.pusher, channelId, userData, messageData);

      res.status(201).json({ data: createMessageData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public readMessage = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const messageId: string = req.body.id;
      const manualRead: boolean = req.body.manual;
      const readMessageData = manualRead
        ? await this.chatService.manualReadMessage(userData, messageId)
        : await this.chatService.readMessage(userData, messageId);

      res.status(201).json({ data: readMessageData, message: 'read' });
    } catch (error) {
      next(error);
    }
  };

  public readAllMessages = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const channleId: string = req.body.channelId;
      const readAllMessagesData = await this.chatService.readAllMessages(userData, channleId);

      res.status(201).json({ data: readAllMessagesData, message: 'read' });
    } catch (error) {
      next(error);
    }
  };

  public unreadMessage = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const messageId: string = req.body.id;
      const unreadMessageData = await this.chatService.unreadMessage(userData, messageId);

      res.status(201).json({ data: unreadMessageData, message: 'unread' });
    } catch (error) {
      next(error);
    }
  };
}

export default ChatController;
