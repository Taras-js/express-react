import { Router } from 'express';
import ChatController from '@controllers/chat.controller';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import { ChatNewMessageDto, ChatNewChannelDto } from '@dtos/users.dto';

class ChatRoute implements Routes {
  public path = '/chat';
  public router = Router();
  public chatController = new ChatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/channels`, authMiddleware, this.chatController.getChannels);
    this.router.get(`${this.path}/:id/messages`, authMiddleware, this.chatController.getMessages);
    this.router.post(`${this.path}/new-channel`, authMiddleware, validationMiddleware(ChatNewChannelDto, 'body'), this.chatController.newChannel);
    this.router.post(
      `${this.path}/rename-channel`,
      authMiddleware,
      validationMiddleware(ChatNewChannelDto, 'body'),
      this.chatController.renameChannel,
    );
    this.router.post(`${this.path}/:id/message`, authMiddleware, validationMiddleware(ChatNewMessageDto, 'body'), this.chatController.sendMessage);
    this.router.put(`${this.path}/read-message`, authMiddleware, this.chatController.readMessage);
    this.router.put(`${this.path}/read-all-messages`, authMiddleware, this.chatController.readAllMessages);
    this.router.put(`${this.path}/unread-message`, authMiddleware, this.chatController.unreadMessage);
  }
}

export default ChatRoute;
