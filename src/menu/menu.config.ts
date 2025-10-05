/**
 * Configuración del menú
 */

export const MENU_CONFIG = {
  /**
   * Categorías que no deben mostrarse en el menú público
   * Estas son categorías internas o auxiliares de Fudo
   */
  DEFAULT_EXCLUDED_CATEGORIES: [
    'Opcionales',
    'Productos genéricos',
    'Bebidas',
    'Salsas',
    'Postres',
    'Entradas',
    'Envios',
    'Opciones Estilo',
    'Adicionales',
  ],

  /**
   * Productos específicos que no deben mostrarse en el menú público
   * Se excluyen por nombre exacto
   */
  EXCLUDED_PRODUCTS: [
    'REBOZA TU BURGER FV',
  ],

  /**
   * Categorías que deben aparecer al final del menú
   */
  CATEGORIES_AT_END: ['Ensaladas', 'Platos Calientes', 'Bebidas', 'Adicionales', 'Salsas'],

  /**
   * Orden de prioridad de categorías
   * Las categorías listadas aquí aparecerán en este orden
   * Las no listadas aparecerán después en orden alfabético
   */
  CATEGORY_PRIORITY: [
    'Combos',
    'Sushiburguers',
    'Gunkans',
    'Hot Rolls',
    'Rolls Especiales',
    'Rolls Tradicionales',
    'Rolls Salmon',
    'Rolls Langostino',
    'Rolls Ahumados',
    'Makis',
    'Nigiris',
    'Sashimis',
    'Geishas',
    'Veggies',
  ],

  /**
   * Configuración por defecto
   */
  DEFAULTS: {
    groupBySubcategory: true,
    minPrice: 0,
  },
};

