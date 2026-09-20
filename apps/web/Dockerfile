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

RUN turbo prune web --docker

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Accept API_URL for build
ARG API_URL
ENV API_URL=$API_URL

# Install dependencies
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=prepare /app/out/full/ .
RUN pnpm turbo build --filter=web

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/web/server.js"]