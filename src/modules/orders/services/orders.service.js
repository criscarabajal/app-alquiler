/**
 * Orders Service - Business logic for order management
 */

import {
    saveOrder,
    loadOrder,
    getAllOrders,
    deleteOrder
} from '../repositories/orders.repository.js';

/**
 * Create or update an order
 * @param {import('../types/order.types').CreateOrderData} orderData 
 * @returns {Promise<void>}
 */
export async function createOrUpdateOrder(orderData) {
    console.log("[Orders Service] Creating/updating order...");

    // Business logic: validate order before saving
    if (!orderData.pedidoNumero) {
        throw new Error("Order number is required");
    }

    if (!orderData.carrito || orderData.carrito.length === 0) {
        throw new Error("Order must have at least one item");
    }

    await saveOrder(orderData);
    console.log("[Orders Service] Order processed successfully");
}

/**
 * Get an order by number
 * @param {string} pedidoNumero 
 * @returns {Promise<import('../types/order.types').Order|null>}
 */
export async function getOrder(pedidoNumero) {
    console.log(`[Orders Service] Getting order: ${pedidoNumero}`);
    return await loadOrder(pedidoNumero);
}

/**
 * Get all orders
 * @returns {Promise<import('../types/order.types').Order[]>}
 */
export async function getOrders() {
    console.log("[Orders Service] Getting all orders...");
    return await getAllOrders();
}

/**
 * Delete an order
 * @param {string} pedidoNumero 
 * @returns {Promise<void>}
 */
export async function removeOrder(pedidoNumero) {
    console.log(`[Orders Service] Removing order: ${pedidoNumero}`);
    await deleteOrder(pedidoNumero);
}

/**
 * Calculate order total
 * @param {import('../types/order.types').CartItem[]} carrito 
 * @param {Object.<number, number>} jornadasMap 
 * @returns {number}
 */
export function calculateOrderTotal(carrito, jornadasMap) {
    return carrito.reduce((total, item, index) => {
        const qty = parseInt(item.cantidad, 10) || 0;
        const jornadas = parseInt(jornadasMap[index], 10) || 1;
        const price = parseFloat(item.precio) || 0;
        return total + (qty * price * jornadas);
    }, 0);
}

/**
 * Generate a new order number based on date
 * @returns {string}
 */
export function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-4); // Last 4 digits of timestamp

    return `${year}${month}${day}-${time}`;
}
