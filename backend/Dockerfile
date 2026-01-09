FROM node:20-slim AS base
WORKDIR /app

ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --legacy-peer-deps

FROM base AS builder
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
RUN npm install -g typescript@^5.6.3
COPY tsconfig.json ./
COPY src ./src
RUN tsc

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/package.json /app/package.json
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]

