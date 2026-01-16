/**
 * @typedef {Object} Cliente
 * @property {string} nombre - Nombre del cliente
 * @property {string} [telefono] - Teléfono del cliente
 * @property {string} [email] - Email del cliente
 * @property {string} [direccion] - Dirección del cliente
 */

/**
 * @typedef {Object} APIError
 * @property {string} message - Mensaje de error
 * @property {string} [code] - Código de error
 * @property {any} [details] - Detalles adicionales del error
 */

/**
 * @typedef {Object} APIResponse
 * @property {boolean} ok - Indica si la operación fue exitosa
 * @property {any} [data] - Datos de respuesta
 * @property {string} [error] - Mensaje de error si ok es false
 */
