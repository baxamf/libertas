import { ConflictException } from '@nestjs/common';
import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { CreateUserInput, User } from '@repo/shared-types';
import { UserCreatedEvent } from '../events/user-created.handler.js';
import { PrismaService } from '../../database/prisma.service.js';

export class CreateUserCommand extends Command<User> {
  constructor(public readonly input: CreateUserInput) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  User
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: CreateUserCommand): Promise<User> {
    const { email, password, role } = input;

    const existing = await this.prisma.orm.public.User.where({
      email,
    }).first();

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await argon2.hash(password);

    const user = await this.prisma.orm.public.User.create({
      email,
      password: hashedPassword,
      role,
    });

    this.eventBus.publish(new UserCreatedEvent(user.userId, email));

    return user;
  }
}
