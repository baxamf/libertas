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

RUN turbo prune @repo/db --docker

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=prepare /app/out/full/ .
RUN pnpm turbo build --filter=@repo/db

# FROM node:${NODE_VERSION}-alpine AS runner
# RUN apk add --no-cache openssl
# WORKDIR /app

# # Create a non-root system user for security
# RUN addgroup --system --gid 1001 prisma
# RUN adduser --system --uid 1001 prisma
# USER prisma

# # Copy necessary files
# COPY --from=builder --chown=prisma:prisma /app ./
