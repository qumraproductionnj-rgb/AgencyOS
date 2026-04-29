# =============================================================
# AgencyOS API — Production Dockerfile
# =============================================================
# Multi-stage build for minimal runtime image.
# Build context MUST be the monorepo root (not apps/api), since we
# need access to pnpm-workspace.yaml and shared packages.
#
# Build:   docker build -f apps/api/Dockerfile -t agencyos-api .
# Run:     docker run -p 3001:3001 --env-file .env agencyos-api
# =============================================================

# -------------------------------------------------------------
# Stage 1 — base: shared pnpm + corepack setup
# -------------------------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /workspace

# -------------------------------------------------------------
# Stage 2 — deps: install all workspace dependencies
# -------------------------------------------------------------
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# -------------------------------------------------------------
# Stage 3 — builder: compile TS + generate Prisma Client
# -------------------------------------------------------------
FROM base AS builder
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /workspace/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /workspace/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
RUN pnpm --filter @agencyos/database exec prisma generate
RUN pnpm --filter api build

# -------------------------------------------------------------
# Stage 4 — runtime: minimal production image
# -------------------------------------------------------------
FROM node:20-alpine AS runtime
RUN apk add --no-cache libc6-compat openssl tini
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs nestjs
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/package.json ./
COPY --from=builder --chown=nestjs:nodejs /workspace/pnpm-workspace.yaml /workspace/package.json /workspace/pnpm-lock.yaml ../
COPY --from=builder --chown=nestjs:nodejs /workspace/packages ../packages
COPY --from=builder --chown=nestjs:nodejs /workspace/node_modules ../node_modules

USER nestjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]
