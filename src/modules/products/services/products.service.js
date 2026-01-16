/**
 * Products Service - Business logic for products
 * Capa de lógica de negocio que maneja operaciones relacionadas con productos
 * No accede directamente a la base de datos, usa el repository
 */

import { fetchAllProducts } from '../repositories/products.repository.js';

/**
 * Obtiene todos los productos del catálogo
 * @returns {Promise<import('../types/product.types').Product[]>} Lista completa de productos
 */
export async function getProducts() {
    console.log("[Products Service] Getting products...");
    const products = await fetchAllProducts();
    console.log(`[Products Service] Retrieved ${products.length} products`);
    return products;
}

/**
 * Filtra productos por categoría específica
 * @param {string} category - Nombre de la categoría a filtrar
 * @returns {Promise<import('../types/product.types').Product[]>} Productos de esa categoría
 */
export async function getProductsByCategory(category) {
    const products = await fetchAllProducts();
    // Filtrar por coincidencia exacta de categoría
    return products.filter(p => p.categoria === category);
}

/**
 * Busca productos por nombre (case-insensitive)
 * @param {string} query - Texto a buscar en el nombre del producto
 * @returns {Promise<import('../types/product.types').Product[]>} Productos que coinciden con la búsqueda
 */
export async function searchProducts(query) {
    const products = await fetchAllProducts();
    const lowerQuery = query.toLowerCase();
    // Búsqueda parcial (includes) en el nombre del producto
    return products.filter(p =>
        p.nombre.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Obtiene solo los productos disponibles para alquiler
 * @returns {Promise<import('../types/product.types').Product[]>} Productos alquilables
 */
export async function getRentableProducts() {
    const products = await fetchAllProducts();
    // Filtra por alquilable = "SI" (string) o true (boolean)
    return products.filter(p => p.alquilable === "SI" || p.alquilable === true);
}
