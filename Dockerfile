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
# Route npm through the org Nexus proxy (xplat-npm-proxy -> registry.npmjs.org)
# when NPM_REGISTRY is passed (BuildConfig buildArg): faster, cached, egress-
# resilient. Empty (local dev) keeps the public registry. npm's
# replace-registry-host rewrites the lockfile's npmjs URLs to this registry, so
# `npm ci` is fully served from Nexus.
ARG NPM_REGISTRY=
RUN if [ -n "$NPM_REGISTRY" ]; then echo "registry=$NPM_REGISTRY" > .npmrc && echo "npm registry -> $NPM_REGISTRY"; fi \
 && npm ci --legacy-peer-deps

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

# SEC-002 W1b — shrink the runtime CVE surface. Two separate causes:
#  1. The mirrored base is a RHEL 9.7 snapshot, so every *fixable* HIGH is just
#     an el9_7 -> el9_8 bump (35 of them: openssl, gnutls, python3, curl, ...).
#     `dnf upgrade` closes all of those without changing the base image.
#  2. The rest is build-time cruft a runtime image never executes.
#     kernel-headers alone was 71 of the 118 HIGH findings and *none* of them
#     has a fix available, so it can only be removed, not patched. glibc-devel
#     is pulled out with it (toolchain only — glibc itself stays); nothing else
#     in the image requires vim-*/rsync. Verified with rpm --whatrequires.
# NOTE: this drops `vi` from the runtime image — debug with `oc debug` instead.
RUN dnf -y upgrade --refresh --setopt=install_weak_deps=0 \
 && dnf -y remove kernel-headers vim-minimal vim-filesystem rsync \
 && dnf -y clean all \
 && rm -rf /var/cache/dnf /var/cache/yum

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
