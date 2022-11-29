import { NextFunction, Request, Response } from 'express';

class ChannelsController {
  public createChannel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ data: null, message: 'channel created' });
    } catch (error) {
      next(error);
    }
  };

  public sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ data: null, message: 'message sent' });
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ data: null, message: 'channel messages' });
    } catch (error) {
      next(error);
    }
  };
}

export default ChannelsController;
