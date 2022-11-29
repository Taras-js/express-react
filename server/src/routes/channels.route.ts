import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import ChannelsController from '@/controllers/channels.controller';

class ChannelsRoute implements Routes {
  public path = '/channels';
  public router = Router();
  public channelsController = new ChannelsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.channelsController.createChannel);
    this.router.post(`${this.path}/:id/messages`, this.channelsController.sendMessage);
    this.router.get(`${this.path}/:id/messages`, this.channelsController.getMessages);
  }
}

export default ChannelsRoute;
