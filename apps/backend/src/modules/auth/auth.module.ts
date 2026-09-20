import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { LoginHandler } from './commands/login.handler.js';
import { RegisterHandler } from './commands/register.handler.js';
import { GetMeHandler } from './queries/me.handler.js';
import { SessionService } from './session.service.js';
import { UserLoggedOutHandler } from './events/user-logged-out.handler.js';
import { ChangePasswordHandler } from './commands/change-password.handler.js';
import { DeleteSessionHandler } from './commands/delete-session.handler.js';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    LoginHandler,
    RegisterHandler,
    ChangePasswordHandler,
    DeleteSessionHandler,
    GetMeHandler,
    UserLoggedOutHandler,
  ],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
