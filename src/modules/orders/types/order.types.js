/**
 * @typedef {Object} CartItem
 * @property {string} nombre - Nombre del producto
 * @property {number} cantidad - Cantidad
 * @property {number} precio - Precio unitario
 * @property {string} [serial] - Número de serie
 * @property {string} [categoria] - Categoría
 * @property {string} [incluye] - Accesorios incluidos
 */

/**
 * @typedef {Object} Order
 * @property {string} pedidoNumero - Número de pedido
 * @property {import('../../core/types/common.types').Cliente} cliente - Datos del cliente
 * @property {CartItem[]} carrito - Items en el carrito
 * @property {Object.<number, number>} jornadasMap - Mapa de índice a jornadas
 * @property {string} usuario - Usuario que creó el pedido
 * @property {string} actualizadoEn - Fecha de última actualización
 * @property {string} [creadoEn] - Fecha de creación
 */

/**
 * @typedef {Object} CreateOrderData
 * @property {string} pedidoNumero
 * @property {import('../../core/types/common.types').Cliente} cliente
 * @property {CartItem[]} carrito
 * @property {Object.<number, number>} jornadasMap
 * @property {string} usuario
 */
