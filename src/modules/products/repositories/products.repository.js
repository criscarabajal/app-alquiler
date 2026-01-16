/**
 * Products Repository - Data access layer for products
 * Maneja el acceso directo a la base de datos Supabase
 * Transforma datos raw a formato estandarizado
 */

import { supabase } from '../../core/config/supabase.config.js';

const TABLE_NAME = 'bbdd-prueba'; // Nombre de la tabla en Supabase

/**
 * Función helper para obtener valores de objeto ignorando mayúsculas/minúsculas
 * Útil para manejar esquemas de DB con nombres de columnas inconsistentes
 * @param {Object} item - Objeto del cual extraer valor
 * @param {string[]} keys - Array de posibles nombres de la propiedad
 * @returns {any} Valor encontrado o string vacío
 */
function getVal(item, keys) {
    const itemKeys = Object.keys(item);
    for (const k of keys) {
        // Intento 1: Coincidencia exacta
        if (item[k] !== undefined) return item[k];

        // Intento 2: Coincidencia case-insensitive
        const foundKey = itemKeys.find(ik => ik.toLowerCase() === k.toLowerCase());
        if (foundKey) return item[foundKey];
    }
    // Si no encuentra nada, devuelve string vacío
    return "";
}

/**
 * Obtiene todos los productos de Supabase y los transforma
 * @returns {Promise<import('../types/product.types').Product[]>} Array de productos estandarizados
 */
export async function fetchAllProducts() {
    try {
        console.log(`[Products Repository] Fetching products from table: ${TABLE_NAME}...`);

        // Consulta a Supabase - select all
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*');

        if (error) {
            console.error("[Products Repository] Error fetching products:", error);
            console.error("Error details:", error.message, error.details, error.hint);
            return []; // Retorna array vacío en caso de error
        }

        console.log(`[Products Repository] Successfully fetched ${data?.length || 0} products`);

        if (!data || data.length === 0) {
            console.warn("[Products Repository] No products found in database");
            return [];
        }

        // Transformar datos raw de Supabase a formato estandarizado
        // getVal() maneja variaciones en nombres de columnas (mayúsculas, minúsculas, etc)
        return data.map(p => ({
            nombre: getVal(p, ["nombre", "Equipos", "equipos"]),
            categoria: getVal(p, ["categoria", "Categoria"]),
            subcategoria: getVal(p, ["subcategoria", "sub-categoria", "SUB-CATEGORIA"]),
            stock: getVal(p, ["stock", "STOCK"]),
            precio: getVal(p, ["precio", "PRECIO"]),
            alquilable: getVal(p, ["alquilable", "ALQUILABLE"]),
            serial: getVal(p, ["serial", "SERIAL"]),
            incluye: getVal(p, ["incluye", "INCLUYE"]),
            valorReposicion: getVal(p, ["valor_reposicion", "valorReposicion", "Valor de reposición", "Valor de reposicion"]),
        }));

    } catch (err) {
        console.error("[Products Repository] Unexpected error:", err);
        return []; // Retorna array vacío en caso de excepción
    }
}
