/**
 * Configuración de reglas de negocio
 *
 * Centraliza parámetros operativos que pueden cambiar sin modificar código:
 * - Horarios de atención
 * - Días cerrados
 * - Zonas de delivery
 * - Límites de pedidos
 *
 * Actualizado: 2025-10-12 - Horario 24hs para testing
 */
export default () => ({
  business: {
    // Horarios de atención (formato 24h)
    openHour: parseInt(process.env.BUSINESS_OPEN_HOUR || '18', 10),
    closeHour: parseInt(process.env.BUSINESS_CLOSE_HOUR || '3', 10), // 03:00 AM
    
    // Días cerrados (0=Domingo, 1=Lunes, ..., 6=Sábado)
    closedDays: JSON.parse(process.env.BUSINESS_CLOSED_DAYS || '[]'),
    
    // Zonas de delivery
    deliveryZones: [
      {
        name: 'Centro',
        cost: parseInt(process.env.DELIVERY_COST_CENTRO || '500', 10),
        estimatedTime: '30-45 min',
      },
      {
        name: 'Zona Norte',
        cost: parseInt(process.env.DELIVERY_COST_NORTE || '800', 10),
        estimatedTime: '45-60 min',
      },
      {
        name: 'Zona Sur',
        cost: parseInt(process.env.DELIVERY_COST_SUR || '800', 10),
        estimatedTime: '45-60 min',
      },
    ],
    
    // Rate limiting
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // 60 segundos
      limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10), // 10 requests
      orderLimit: parseInt(process.env.THROTTLE_ORDER_LIMIT || '3', 10), // 3 pedidos
    },
  },
});

