import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { CreateUserHandler } from './commands/create-user.handler.js';
import { UpdateUserHandler } from './commands/update-user.handler.js';
import { DeleteUserHandler } from './commands/delete-user.handler.js';
import { GetUsersHandler } from './queries/get-users.handler.js';
import { GetUserByIdHandler } from './queries/get-user-by-id.handler.js';
import { UserCreatedHandler } from './events/user-created.handler.js';
import { GetProfileHandler } from './queries/get-profile.handler.js';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    GetUsersHandler,
    GetUserByIdHandler,
    GetProfileHandler,
    UserCreatedHandler,
  ],
})
export class UsersModule {}
