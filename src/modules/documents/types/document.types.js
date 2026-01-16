/**
 * @typedef {Object} DocumentConfig
 * @property {'presupuesto'|'remito'|'seguro'} type - Tipo de documento
 * @property {string} number - Número de documento
 * @property {Date|string} emissionDate - Fecha de emisión
 */

/**
 * @typedef {Object} PDFGenerationOptions
 * @property {import('../../core/types/common.types').Cliente} cliente
 * @property {import('../../orders/types/order.types').CartItem[]} productos
 * @property {Object.<number, number>} jornadasMap
 * @property {string} pedidoNumero
 * @property {string} [fechaEmision]
 */
