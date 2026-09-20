---
applyTo: 'apps/backend/**'
---

# Backend Microservice Standards (NestJS)

## Framework & Adapter

- **NestJS + Fastify:** Use Fastify adapter (`@nestjs/platform-fastify`). Avoid Express-specific decorators like `@Res()` or `@Req()`. Use Fastify native types (`FastifyRequest`, `FastifyReply`) if low-level access is necessary.

## Module Folder Structure

Every feature module follows this canonical layout:

```
src/modules/<feature>/
├── commands/
│   ├── create-<noun>.handler.ts   ← CreateXCommand class + handler colocated
│   ├── update-<noun>.handler.ts
│   └── delete-<noun>.handler.ts
├── queries/
│   ├── get-<noun>s.handler.ts     ← GetXsQuery class + handler colocated
│   └── get-<noun>-by-id.handler.ts
├── events/
│   └── <noun>-<past-tense>.handler.ts  ← XEvent class + handler colocated
├── <feature>.controller.ts
└── <feature>.module.ts
```

## CQRS Architecture (@nestjs/cqrs)

- Separate execution logic into **Commands**, **Queries**, and **Events**:
  - `Commands`: State mutating actions (e.g., `CreateUserCommand`, `CreateUserHandler`).
  - `Queries`: Read-only operations (e.g., `GetUserByIdQuery`, `GetUserByIdHandler`).
  - `Events`: Side-effects / domain events (e.g., `UserCreatedEvent`).
- Controllers must remain thin: delegate execution directly to `CommandBus` or `QueryBus`.
- `CqrsModule.forRoot({})` is registered once globally in `AppModule`. Do **not** import it again in feature modules — just register handlers as providers.

### Command pattern

The command class and its handler **live in the same file**. The command extends `Command<ReturnType>` so the bus infers the return type at call sites.

- **Parameter packing:** If a command accepts more than two arguments or handles a structured payload, pack them into a single `input` object (e.g., `constructor(public readonly input: CreateUserInput)`). In controllers, name the payload `dto` and pass it directly (`new CreateUserCommand(dto)`).
- **Prisma 8 ORM:** Use `this.prisma.orm.<namespace>.<Model>` methods (e.g., `.where(...).first()`, `.create(...)`, `.update(...)`, `.delete()`).

```ts
// create-user.handler.ts  ← exports both command and handler
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
    if (existing) throw new ConflictException('Email already in use');

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
```

### Query pattern

Same colocation rule: query class + handler in one file, query extends `Query<ReturnType>`.

- **Prisma 8 Projections:** Use `.select(...)` to fetch explicit fields and exclude sensitive columns (e.g., password).

```ts
// get-user-by-id.handler.ts  ← exports both query and handler
export class GetUserByIdQuery extends Query<User> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<
  GetUserByIdQuery,
  User
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserByIdQuery): Promise<User> {
    const user = await this.prisma.orm.public.User.select(
      'userId',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    )
      .where({
        userId: query.id,
      })
      .first();

    if (!user)
      throw new NotFoundException(`User with id "${query.id}" not found`);
    return user;
  }
}
```

### Event pattern

Same colocation rule: event class + handler in one file.

```ts
// user-created.handler.ts  ← exports both event and handler
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);

  handle(event: UserCreatedEvent): void {
    this.logger.log(
      `User created — id: ${event.userId}, email: ${event.email}`,
    );
    // TODO: send welcome email, emit audit log entry, etc.
  }
}
```

## Validation & Serialization (native NestJS v12 schema support)

NestJS v12's built-in Standard Schema support is used directly with Zod schemas from `@repo/shared-types`.

- **Schema source of truth:** All Zod schemas live in `@repo/shared-types`. Never define inline Zod schemas inside the backend.
- **Request validation:** Pass the schema straight to the parameter decorator — `@Body({ schema: CreateUserSchema })`, `@Query({ schema: GetUsersQuerySchema })`, `@Param({ schema: ... })`. `GlobalZodValidationPipe` (APP_PIPE, extends `StandardSchemaValidationPipe`) is registered globally and runs `~standard.validate()` — the schema's forward/**decode** direction (wire input → rich output) — throwing a `ZodException` (400) on failure.
- **Response serialization:** Decorate the route with `@SerializeOptions({ schema: UserSchema })`. `GlobalZodInterceptor` (APP_INTERCEPTOR, extends `StandardSchemaSerializerInterceptor`) is registered globally and calls `schema.safeEncodeAsync(response)` — responses hold rich domain values (e.g. `Temporal.Instant`), so they must be **encoded** back to their wire representation (e.g. ISO string) before being sent.
- **Codec direction convention:** for any wire-boundary field (e.g. `stringToInstant`, `stringToDate`), the codec's `input` schema is always the wire/JSON format and its `output` schema is the rich domain type. Decode on receive (automatic, via the validation pipe), encode on send (automatic, via the interceptor).
- **Swagger docs for responses:** use `@ApiOkResponse({ standardSchema: UserSchema, description: '...' })` (or the equivalent per-status decorator). The custom `standardSchemaConverter` registered in `setup-swagger.ts` always converts the schema's `input` (wire) side to JSON Schema, regardless of whether NestJS is describing a request param or a response — this keeps docs correct for codec-bearing schemas whose `output` (e.g. `Temporal.Instant`) isn't JSON-representable.
- Do not re-register `GlobalZodValidationPipe`/`GlobalZodInterceptor` in feature modules — they're global in `AppModule`.

## Controller Decorator Pattern

- Import commands/queries/events from their **handler** file using the flat path (e.g. `./commands/create-user.handler`, `./queries/get-users.handler`), never from a separate `.command.ts` or `.query.ts`.
- `DELETE` (no response body) uses `@HttpCode` + `@ApiNoContentResponse`; every other route pairs a `@Body`/`@Query`/`@Param` schema (request) with `@SerializeOptions` + `@ApiOkResponse`/`@ApiCreatedResponse` (response).

```ts
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
  @ApiOperation({ summary: 'Get all users (paginated, filterable)' })
  @SerializeOptions({ schema: PaginatedUsersSchema })
  async findAll(
    @Query({ schema: GetUsersQuerySchema }) query: GetUsersQueryInput,
  ) {
    return this.queryBus.execute(new GetUsersQuery(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({ standardSchema: UserSchema, description: 'User found' })
  @SerializeOptions({ schema: UserSchema })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
```

## Password Hashing

- Always hash passwords with **argon2** before persisting. Never store plaintext.
- Import and call: `import * as argon2 from 'argon2'; await argon2.hash(password);`
- In Prisma 8, use `.select(...)` projections on queries returning user records to callers, explicitly selecting safe fields and omitting `password`.

## Module Wiring & Database Access (Prisma 8)

`DatabaseModule` is decorated with `@Global()`, so `PrismaService` is available everywhere — **do not** add `DatabaseModule` to a feature module's `imports` array.

- **Prisma 8 Skill & Database Guidelines:** When working with `PrismaService` (`this.prisma.orm...` or `this.prisma.sql...`), refer to the database instructions in [packages/db/copilot-instructions.md](../../packages/db/copilot-instructions.md) and load the `prisma-8` skill ([.agents/skills/prisma-8/SKILL.md](../../.agents/skills/prisma-8/SKILL.md)).
- Use `this.prisma.orm.<namespace>.<Model>` for typed ORM operations and `this.prisma.sql.<namespace>.<table>` for typed SQL builder queries.

```ts
@Module({
  controllers: [UsersController],
  providers: [
    // Command handlers
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    // Query handlers
    GetUsersHandler,
    GetUserByIdHandler,
    // Event handlers
    UserCreatedHandler,
  ],
})
export class UsersModule {}
```

## Guards & Authentication Flow (Global Pipeline)

All guards are bound globally in [src/app.module.ts](src/app.module.ts) as `APP_GUARD` providers. They execute sequentially for every incoming request.

### Guard Execution Order

1. **`ThrottlerBehindProxyGuard`** (Rate Limiting)
2. **`JwtGuard`** (Authentication & Transparent Session Refresh)
3. **`RolesGuard`** (Role-Based Access Control / RBAC)

---

### 1. `ThrottlerBehindProxyGuard` (`core/guards/throttler.guard.ts`)

- **Purpose:** IP-based rate limiting respecting reverse proxies (Cloudflare, load balancers).
- **IP Resolution Order:** `cf-connecting-ip` header $\rightarrow$ first client IP in `x-forwarded-for` header $\rightarrow$ fallback to Fastify `req.ip`.
- **Usage for routes:**
  - Standard named sets configured in `AppModule`: `'api'` (100 req/60s), `'auth'` (10 req/900s).
  - Override per endpoint with `@Throttle({ auth: { limit: 5, ttl: 60_000 } })` or skip with `@SkipThrottle()`.

---

### 2. `JwtGuard` (`core/guards/jwt.guard.ts`)

- **Purpose:** Cookie-based JWT authentication and automatic session rotation.
- **Cookie Sources:** HTTP-only cookies configured in `JwtConfig` (`accessCookieName`, `refreshCookieName`).
- **Execution Flow:**
  1. Checks `@IsPublic()` metadata via `Reflector`.
  2. **Access Token Validation:** If `accessToken` cookie exists and is valid, extracts payload, sets `request.user = accessPayload`, and allows the request.
  3. **Transparent Refresh / Session Rotation:** If access token is missing or expired, attempts verification with `refreshToken` cookie. Rotates session via `SessionService.rotateSession(jti, sub)`, issues fresh tokens, sets updated cookies on `FastifyReply`, sets `request.user = newPayload`, and allows the request.
  4. **Public Route Handling:** If tokens are missing or invalid on an `@IsPublic()` route, the request is allowed through with `request.user = undefined` (no 401 thrown). If valid tokens _are_ provided on a public route, `request.user` is populated.
  5. **Protected Route Handling:** If tokens are invalid/missing and route is **not** public, throws `UnauthorizedException` (401).

---

### 3. `RolesGuard` (`core/guards/roles.guard.ts`)

- **Purpose:** RBAC authorization enforcing allowed roles (`UserRole`).
- **Decorator:** `@Roles(...roles: UserRole[])` from `core/decorators/roles.decorator.js`.
- **Execution Flow:**
  1. Checks for `@Roles(...)` metadata on handler or controller class.
  2. If no role metadata is found, access is granted (`true`).
  3. If roles are required, checks if `request.user` exists and `requiredRoles.includes(request.user.role)`.
  4. If `request.user` is missing or the role does not match, returns `false` (403 Forbidden).

---

### Route Decorator Cheat Sheet for Agents

| Use Case                          | Decorators                                    | Behavior                                                                          |
| :-------------------------------- | :-------------------------------------------- | :-------------------------------------------------------------------------------- |
| **Protected Route (Default)**     | _(None)_                                      | Requires valid session; injects `req.user`; 401 if unauthenticated.               |
| **Public Route**                  | `@IsPublic()`                                 | Bypasses 401; still populates `req.user` if valid cookies exist.                  |
| **Role-Restricted Route**         | `@Roles(UserRole.ADMIN)`                      | Requires valid session AND matching role in `req.user.role`; 403 if unauthorized. |
| **Public with Custom Rate Limit** | `@IsPublic()`, `@Throttle({ auth: { ... } })` | Public route with dedicated throttle limits (e.g., login, register).              |
