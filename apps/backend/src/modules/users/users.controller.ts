import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  SerializeOptions,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateUserCommand } from './commands/create-user.handler.js';
import { UpdateUserCommand } from './commands/update-user.handler.js';
import { DeleteUserCommand } from './commands/delete-user.handler.js';
import { GetUsersQuery } from './queries/get-users.handler.js';
import { GetUserByIdQuery } from './queries/get-user-by-id.handler.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import {
  CreateUserSchema,
  GetUsersQuerySchema,
  PaginatedUsersSchema,
  UpdateUserSchema,
  UserProfileSchema,
  UserSchema,
} from '@repo/shared-types';
import type {
  CreateUserInput,
  GetUsersQueryInput,
  UpdateUserInput,
} from '@repo/shared-types';
import { GetProfileQuery } from './queries/get-profile.handler.js';

@SkipThrottle({ auth: true })
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiCreatedResponse({
    standardSchema: UserSchema,
    description: 'User created successfully',
  })
  @SerializeOptions({ schema: UserSchema })
  async create(@Body({ schema: CreateUserSchema }) dto: CreateUserInput) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users (paginated, filterable)' })
  @ApiOkResponse({
    standardSchema: PaginatedUsersSchema,
    description: 'Paginated list of users',
  })
  @SerializeOptions({ schema: PaginatedUsersSchema })
  async findAll(
    @Query({ schema: GetUsersQuerySchema }) dto: GetUsersQueryInput,
  ) {
    return this.queryBus.execute(new GetUsersQuery(dto));
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile including associated sessions' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({
    standardSchema: UserProfileSchema,
    description: 'User profile including associated sessions',
  })
  @SerializeOptions({ schema: UserProfileSchema })
  async getProfile(@Req() req: FastifyRequest) {
    const { sub, jti } = req.user!;
    return this.queryBus.execute(new GetProfileQuery({ sub, jti }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({
    standardSchema: UserSchema,
    description: 'User found',
  })
  @SerializeOptions({ schema: UserSchema })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({
    standardSchema: UserSchema,
    description: 'User updated successfully',
  })
  @SerializeOptions({ schema: UserSchema })
  async update(
    @Param('id') id: string,
    @Body({ schema: UpdateUserSchema }) dto: UpdateUserInput,
  ) {
    return this.commandBus.execute(new UpdateUserCommand(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
