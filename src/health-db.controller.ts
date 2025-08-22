import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthDbController {
  @Get('healthz')
  healthz() {
    return { ok: true };
  }
}

/* ============================================================
   🔒 ENDPOINTS DE DEBUG (comentados)
   ============================================================

   ⚠️ IMPORTANTE:
   - /db y /db-tls son SOLO para diagnóstico interno (debug).
   - NO deben estar expuestos en producción porque revelan
     información sensible (usuarios de DB, certificados TLS, etc).
   - Mantener este bloque versionado para referencia futura.
   - Descomentar únicamente en dev/staging o detrás de auth/API key.

   ------------------------------------------------------------

// import { Pool } from 'pg';
// import * as tls from 'tls';
// import { X509Certificate } from 'crypto';

// const ca = process.env.DATABASE_CA;
// const url = process.env.DATABASE_URL!;
// const host = new URL(url).hostname;

// const pool = new Pool({
//   connectionString: url,
//   ssl: ca
//     ? {
//         ca,
//         rejectUnauthorized: true,
//         servername: host,     // fuerza validación de SAN/hostname
//         minVersion: 'TLSv1.2',
//       }
//     : undefined,
//   max: 5,
//   idleTimeoutMillis: 10_000,
//   connectionTimeoutMillis: 5_000,
// });

// @Get('db')
// async db() {
//   const { rows } = await pool.query(
//     `select now() as now, current_user as role, current_database() as db`
//   );
//   return { ok: true, ...rows[0] };
// }

// @Get('db-tls')
// async dbTls() {
//   const client = await pool.connect();
//   try {
//     await client.query('select 1');
//     const s = (client as any)?.connection?.stream as tls.TLSSocket | undefined;
//     if (!s || typeof (s as any).getPeerCertificate !== 'function') {
//       throw new Error('TLSSocket no disponible; la conexión no parece ser TLS');
//     }

//     // ... resto de la lógica TLS ...
//   } finally {
//     client.release();
//   }
// }
*/
