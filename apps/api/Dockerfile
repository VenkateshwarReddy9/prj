FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ── deps stage ────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/
COPY packages/constants/package.json ./packages/constants/
RUN pnpm install --frozen-lockfile --filter @careercompass/api... --prod

# ── build stage ───────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/
COPY packages/constants/package.json ./packages/constants/
RUN pnpm install --frozen-lockfile --filter @careercompass/api...
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
RUN pnpm --filter @careercompass/types build
RUN pnpm --filter @careercompass/validators build
RUN pnpm --filter @careercompass/constants build
RUN pnpm --filter @careercompass/api build

# ── prisma generate ───────────────────────────────────────────────────────────
RUN pnpm --filter @careercompass/api exec prisma generate

# ── runner stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 4000

CMD ["node", "dist/index.js"]
