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

# Solo deps de producción para imagen final
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos el build generado
COPY --from=builder /usr/src/app/dist ./dist

# (opcional) Si usás archivos estáticos/config, copiarlos aquí.

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/main.js"]
