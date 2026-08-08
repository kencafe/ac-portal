# syntax=docker/dockerfile:1
# Multi-stage build for the FPT-IS Next Gen Service site (Next.js standalone).
# Base is mirrored into the internal registry (nodes pull it fast/reliably;
# external registry.access.redhat.com pulls were slow on some nodes).
FROM image-registry.openshift-image-registry.svc:5000/ac-portal-dev/ubi9-nodejs-20:latest AS base

# ---- deps: full install (build needs devDependencies) ----
FROM base AS deps
USER 0
WORKDIR /app
RUN chown -R 1001:0 /app && chmod -R g=u /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ---- builder ----
FROM base AS builder
USER 0
WORKDIR /app
RUN chown -R 1001:0 /app && chmod -R g=u /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=6144"
RUN npm run build

# ---- runner: minimal standalone image ----
FROM base AS runner
USER 0
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
RUN mkdir .next && chown -R 1001980000:0 /app && chmod -R g=u /app
COPY --from=builder --chown=1001980000:0 /app/.next/standalone ./
COPY --from=builder --chown=1001980000:0 /app/.next/static ./.next/static

# OpenShift assigns an arbitrary high UID in the root (0) group.
USER 1001980000
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
