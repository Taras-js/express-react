import { IsNotEmpty } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, Column, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '@/entities/users.entity';
import { ChatChannel } from '@/interfaces/chat.interface';
import { ChatMessageEntity } from '@/entities/chatMessage.entity';

@Entity()
@Unique(['name'])
export class ChatChannelEntity implements ChatChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @OneToMany(() => ChatMessageEntity, message => message.channel)
  messages: ChatMessageEntity[];

  unread: number;
  manualUnread: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamptz', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', select: false })
  updatedAt: Date;
}
