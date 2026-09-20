ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

RUN corepack enable && corepack prepare pnpm@12.5.1 --activate

FROM base AS prepare
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

RUN pnpm add -g turbo@^2.11.2

COPY . .

RUN turbo prune backend --docker

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=prepare /app/out/full/ .
RUN pnpm turbo build --filter=backend

# Install only production dependencies to keep the image lightweight
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile

FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

# Create a non-root system user for security
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy necessary files
COPY --from=builder --chown=nestjs:nestjs /app ./

EXPOSE 5000
ENV PORT=5000

CMD ["node", "apps/backend/dist/main.js"]