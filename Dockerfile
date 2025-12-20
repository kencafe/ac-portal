# Multi-stage Dockerfile for Next.js production optimization  
FROM registry.redhat.io/ubi9/nodejs-20:latest AS base

# Install dependencies only when needed
FROM base AS deps
# Run as root to ensure we can create directories and install dependencies
USER 0
WORKDIR /app
RUN chown -R 1001980000:0 /app && chmod -R g=u /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --omit=dev --legacy-peer-deps; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
# Run as root to ensure we can build
USER 0
WORKDIR /app
RUN chown -R 1001980000:0 /app && chmod -R g=u /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
# Run as root to set up directories and permissions
USER 0
WORKDIR /app
RUN chown -R 1001980000:0 /app && chmod -R g=u /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && chown -R 1001980000:0 .next && chmod -R g=u .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Switch to OpenShift-compatible user
USER 1001980000

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]