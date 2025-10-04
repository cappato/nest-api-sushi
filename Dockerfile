# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copiamos manifest para instalar deps (incluye devDeps)
COPY package*.json ./
RUN npm ci

# Copiamos el código y construimos
COPY . .
RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Solo deps de producción para imagen final
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiamos el build generado
COPY --from=builder /usr/src/app/dist ./dist

# Cambiar ownership y usuario
RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/main.js"]
