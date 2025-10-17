/**
 * Estructura del campo address (JSON) en Order
 * 
 * Ejemplo:
 * {
 *   "street": "Av. Corrientes 1234",
 *   "floor": "5to B",
 *   "city": "CABA",
 *   "province": "Buenos Aires",
 *   "postalCode": "1043",
 *   "reference": "Edificio azul, timbre roto"
 * }
 */
export interface DeliveryAddress {
  street: string;
  floor?: string;
  city: string;
  province?: string;
  postalCode?: string;
  reference?: string;
}

