FROM node:lts-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production --silent

FROM node:lts-alpine AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:lts-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]