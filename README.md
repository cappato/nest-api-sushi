# 🍣 Nest API Sushi

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

API REST moderna construida con **NestJS + TypeScript + Supabase** para gestión de productos de sushi.

## 🚀 Características

- ✅ **API REST** con NestJS 11 y TypeScript
- ✅ **Supabase PostgreSQL** como base de datos
- ✅ **Documentación Swagger** interactiva en `/docs`
- ✅ **Health checks** para API y base de datos
- ✅ **KISS Architecture** - Keep It Simple, Stupid
- ✅ **Tests** unitarios y e2e configurados

## 📋 Endpoints Disponibles

- `GET /` - Mensaje de bienvenida
- `GET /health` - Health check básico de la API
- `GET /health/db` - Verificación de conexión a Supabase
- `GET /docs` - Documentación Swagger interactiva

## 🛠️ Stack Tecnológico

- **Backend**: NestJS 11.x + TypeScript 5.x
- **Base de datos**: Supabase (PostgreSQL 15)
- **Testing**: Jest
- **Documentación**: Swagger/OpenAPI
- **ORM**: pg (node-postgres) - Connection pooling nativo

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+
- Cuenta de Supabase (gratis en [supabase.com](https://supabase.com))

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings → Database** y copia la **Connection string** (Pooler)
3. Ve a **Settings → API** y copia las **API Keys**

### 2. Configurar el proyecto

```bash
# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase
```

### 3. Crear las tablas en Supabase

Ve al **SQL Editor** en Supabase y ejecuta:

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  image_url VARCHAR(500),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, description) VALUES
  ('Rolls', 'Rollos de sushi tradicionales y especiales'),
  ('Nigiri', 'Sushi nigiri con pescado fresco'),
  ('Sashimi', 'Cortes de pescado fresco'),
  ('Bebidas', 'Bebidas y refrescos');
```

### 4. Ejecutar la API

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

### 5. Verificar funcionamiento

```bash
# Health check básico
curl http://localhost:8080/health

# Verificar conexión a Supabase
curl http://localhost:8080/health/db
```

**URLs disponibles:**
- API: http://localhost:8080
- Swagger Docs: http://localhost:8080/docs
- Supabase Dashboard: https://supabase.com/dashboard

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Base de Datos

### Estructura

Tablas principales:

- **categories**: Categorías de productos (Rolls, Nigiri, Sashimi, Bebidas)
- **products**: Catálogo de productos de sushi

### Gestión de la Base de Datos

Usa el **Supabase Dashboard** para:
- Ver y editar datos en **Table Editor**
- Ejecutar queries en **SQL Editor**
- Ver logs en **Database → Logs**
- Gestionar backups en **Database → Backups**

## 🔧 Variables de Entorno

Archivo `.env`:

```env
# Application
NODE_ENV=production
PORT=8080

# Supabase Database (Pooler Connection)
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:YOUR_PASSWORD@aws-1-sa-east-1.pooler.supabase.com:6543/postgres

# Database Pool
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=10000

# Supabase API Keys
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📝 Estructura del Proyecto (KISS)

```
nest-api-sushi/
├── src/
│   ├── config/
│   │   └── database.config.ts      # Configuración de Supabase
│   ├── database/
│   │   ├── database.module.ts      # Módulo de base de datos
│   │   └── database.service.ts     # Servicio de conexión
│   ├── health/
│   │   ├── dto/                    # DTOs para respuestas
│   │   └── health.controller.ts    # Health checks
│   ├── app.module.ts               # Módulo principal
│   ├── app.controller.ts           # Controlador raíz
│   ├── app.service.ts              # Servicio raíz
│   └── main.ts                     # Entry point
├── scripts/
│   ├── quick-test.js               # Test de conexión rápido
│   └── test-supabase-connection.js # Test detallado
├── .env                            # Variables de entorno
├── .env.example                    # Template de configuración
└── package.json
```

## ✨ Principios KISS Aplicados

### 🎯 **Keep It Simple, Stupid**
- ✅ Sin Docker - Conexión directa a Supabase
- ✅ Sin ORM pesado - pg nativo con connection pooling
- ✅ Configuración mínima - Solo lo necesario
- ✅ Arquitectura clara - Módulos bien definidos

### 🔧 **Clean Architecture**
- **DatabaseService**: Maneja conexión y health checks
- **HealthController**: Expone endpoints HTTP simples
- **ConfigService**: Configuración centralizada
- **DTOs tipados**: Respuestas consistentes con Swagger

### 📦 **Dependencias Mínimas**
```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/config": "^4.0.2",
  "@nestjs/core": "^11.0.1",
  "@nestjs/swagger": "11.2.0",
  "pg": "^8.16.3"
}
```

## 🚀 Próximos Pasos

1. **Crear módulos de productos y categorías**
2. **Agregar autenticación con Supabase Auth**
3. **Implementar CRUD completo**
4. **Conectar con el frontend Astro**

## 📄 Licencia

MIT
