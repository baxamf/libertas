import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SessionService } from '../session.service.js';
import { Logger } from '@nestjs/common';

export class UserLoggedOutEvent {
  constructor(public readonly jti: string) {}
}

@EventsHandler(UserLoggedOutEvent)
export class UserLoggedOutHandler implements IEventHandler<UserLoggedOutEvent> {
  constructor(private readonly sessionService: SessionService) {}

  handle(event: UserLoggedOutEvent): void {
    this.sessionService.revokeSession(event.jti);
    Logger.log(
      `User logged out: jti=${event.jti} revoked`,
      UserLoggedOutHandler.name,
    );
  }
}
