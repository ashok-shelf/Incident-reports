FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm ci


FROM base AS builder
WORKDIR /app


COPY incidents/ ./incidents/
COPY runbooks/ ./runbooks/


COPY web/ ./web/
COPY --from=deps /app/web/node_modules ./web/node_modules

WORKDIR /app/web
RUN npm run build


FROM base AS runner
ENV NODE_ENV=production

WORKDIR /app


COPY --from=builder /app/web/.next/standalone ./

# Copy static assets (not included in standalone output)
COPY --from=builder /app/web/.next/static ./web/.next/static
COPY --from=builder /app/web/public ./web/public

# Copy content directories (read at runtime via fs)
COPY --from=builder /app/incidents ./incidents
COPY --from=builder /app/runbooks ./runbooks

# Copy auth config
COPY --from=builder /app/web/users.json ./web/users.json

EXPOSE 3000
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Standalone server runs from repo root, WORKDIR must match process.cwd() expectations
WORKDIR /app/web
CMD ["node", "server.js"]
