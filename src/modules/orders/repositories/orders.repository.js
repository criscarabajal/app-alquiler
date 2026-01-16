/**
 * Orders Repository - Data access layer for orders
 */

import { supabase } from '../../core/config/supabase.config.js';

const TABLE_NAME = "pedidos";

/**
 * Save or update an order in the database
 * @param {import('../types/order.types').Order} orderData 
 * @returns {Promise<void>}
 */
export async function saveOrder(orderData) {
    if (!orderData.pedidoNumero) {
        throw new Error("[Orders Repository] Missing pedidoNumero");
    }

    console.log(`[Orders Repository] Saving order: ${orderData.pedidoNumero}`);

    const { error } = await supabase
        .from(TABLE_NAME)
        .upsert(
            {
                pedidoNumero: String(orderData.pedidoNumero),
                cliente: orderData.cliente || {},
                carrito: orderData.carrito || [],
                jornadasMap: orderData.jornadasMap || {},
                usuario: orderData.usuario || null,
                actualizadoEn: new Date().toISOString(),
            },
            { onConflict: 'pedidoNumero' }
        );

    if (error) {
        console.error("[Orders Repository] Error saving order:", error);
        throw error;
    }

    console.log(`[Orders Repository] Order ${orderData.pedidoNumero} saved successfully`);
}

/**
 * Load an order by its number
 * @param {string} pedidoNumero 
 * @returns {Promise<import('../types/order.types').Order|null>}
 */
export async function loadOrder(pedidoNumero) {
    if (!pedidoNumero) {
        throw new Error("[Orders Repository] Missing pedidoNumero");
    }

    console.log(`[Orders Repository] Loading order: ${pedidoNumero}`);

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .eq("pedidoNumero", String(pedidoNumero))
        .single();

    if (error) {
        // Order not found
        if (error.code === 'PGRST116') {
            console.log(`[Orders Repository] Order ${pedidoNumero} not found`);
            return null;
        }
        console.error("[Orders Repository] Error loading order:", error);
        throw error;
    }

    console.log(`[Orders Repository] Order ${pedidoNumero} loaded successfully`);
    return data;
}

/**
 * Get all orders sorted by update date
 * @returns {Promise<import('../types/order.types').Order[]>}
 */
export async function getAllOrders() {
    console.log("[Orders Repository] Fetching all orders...");

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("actualizadoEn", { ascending: false });

    if (error) {
        console.error("[Orders Repository] Error fetching orders:", error);
        throw error;
    }

    console.log(`[Orders Repository] Retrieved ${data?.length || 0} orders`);
    return data || [];
}

/**
 * Delete an order by its number
 * @param {string} pedidoNumero 
 * @returns {Promise<void>}
 */
export async function deleteOrder(pedidoNumero) {
    if (!pedidoNumero) {
        throw new Error("[Orders Repository] Missing pedidoNumero");
    }

    console.log(`[Orders Repository] Deleting order: ${pedidoNumero}`);

    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq("pedidoNumero", String(pedidoNumero));

    if (error) {
        console.error("[Orders Repository] Error deleting order:", error);
        throw error;
    }

    console.log(`[Orders Repository] Order ${pedidoNumero} deleted successfully`);
}
