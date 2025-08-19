# Imagen base con Node
FROM node:20-alpine

# Setear directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --only=production

# Copiar el resto del código
COPY . .

# Build de la app (si usás TypeScript)
RUN npm run build

# Exponer puerto
EXPOSE 8080

# Comando de inicio
CMD ["node", "dist/main.js"]
