import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public name: string;

  @IsString()
  public password: string;

  @IsString()
  public picture: string;
}

export class ChatNewChannelDto {
  @IsString()
  public name: string;

  @IsOptional()
  public id: string;
}

export class ChatNewMessageDto {
  @IsString()
  public text: string;
  @IsOptional()
  public replyToId: string;

  @IsOptional()
  public createChannel: string;
}
