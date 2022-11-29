import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import { CreateUserDto } from '@dtos/users.dto';
import AuthService from '@services/auth.service';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const avatars = [
    'jana',
    'jazebelle',
    'jocelyn',
    'jeane',
    'jeri',
    'jai',
    'jean',
    'jodi',
    'jude',
    'joe',
    'jed',
    'jacques',
    'julie',
    'josh',
    'jake',
    'jon',
    'jordan',
    'jia',
    'jack',
    'jenni',
    'jaqueline',
    'james',
    'jolee',
    'jerry',
    'jess',
    'jabala',
    'jane',
    'josephine',
  ];
  const userData: CreateUserDto = {
    email: req.query.email?.toString(),
    name: req.query.name?.toString(),
    picture: 'https://joeschmoe.io/api/v1/' + avatars[Math.floor(Math.random() * avatars.length)],
    password: '',
  };
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const { id } = (await verify(Authorization, secretKey)) as DataStoredInToken;
      const findUser = await UserEntity.findOne(id, { select: ['id', 'email', 'password'] });

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        await createOrAuthorize(userData, req, res, next);
        //next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      await createOrAuthorize(userData, req, res, next);
      //next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

const createOrAuthorize = async (userData: CreateUserDto, req, res, next) => {
  const authService = new AuthService();
  if (userData.email && userData.name) {
    let cookie, findUser;
    try {
      const userLoginResult = await authService.login(userData);
      cookie = userLoginResult.cookie;
      findUser = userLoginResult.findUser;
    } catch (error) {
      findUser = await authService.signup(userData);
      cookie = authService.createCookie(authService.createToken(findUser));
    }
    res.setHeader('Set-Cookie', [cookie]);
    req.user = findUser;
    next();
  } else next(new HttpException(401, 'Wrong authentication token or user data missing'));
};

export default authMiddleware;
