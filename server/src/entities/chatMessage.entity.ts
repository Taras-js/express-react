import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from '@/entities/users.entity';
import { ChatChannelEntity } from '@/entities/chatChannel.entity';
import { ChatMessage } from '@/interfaces/chat.interface';

@Entity()
export class ChatMessageEntity implements ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity)
  author: UserEntity;

  @ManyToOne(() => ChatChannelEntity, channel => channel.messages)
  channel: ChatChannelEntity;

  @Column()
  text: string;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  readBy: UserEntity[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
  unReadBy: UserEntity[];

  @ManyToOne(() => ChatMessageEntity, message => message.thread)
  replyTo: ChatMessageEntity;

  @OneToMany(() => ChatMessageEntity, message => message.replyTo)
  thread: ChatMessageEntity[];

  @CreateDateColumn({ type: 'timestamptz', select: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
