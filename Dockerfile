# Use the official Node.js 18 image as the base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Copy Prisma schema before installing dependencies
COPY prisma ./prisma

# Install dependencies (this will skip the postinstall hook that needs the schema)
RUN npm ci --ignore-scripts

# Now run prisma generate separately
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
ENV RESEND_API_KEY="dummy-key-for-build"
ENV JWT_SECRET="dummy-jwt-secret-for-build"
ENV NEXTAUTH_SECRET="dummy-nextauth-secret-for-build"
ENV CLOUDINARY_CLOUD_NAME="dummy"
ENV CLOUDINARY_API_KEY="dummy"
ENV CLOUDINARY_API_SECRET="dummy"
ENV PRISMA_CLI_BINARY_TARGETS="linux-musl"

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Install curl for health checks and OpenSSL for Prisma
RUN apk add --no-cache curl openssl openssl-dev

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy package.json for runtime dependencies
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
