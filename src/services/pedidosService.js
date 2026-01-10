// src/services/pedidosService.js
import { supabase } from "../supabase";

const TABLE = "pedidos";

/**
 * Guarda o actualiza un pedido en Supabase
 */
export async function guardarPedidoFirebase({
  pedidoNumero,
  cliente,
  carrito,
  jornadasMap,
  usuario,
}) {
  if (!pedidoNumero) throw new Error("Falta pedidoNumero");

  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        pedidoNumero: String(pedidoNumero),
        cliente: cliente || {},
        carrito: carrito || [],
        jornadasMap: jornadasMap || {},
        usuario: usuario || null,
        actualizadoEn: new Date().toISOString(),
        // creadoEn se manejará por default en la DB si es nuevo, 
        // o podemos dejarlo que DB lo maneje en insert. 
        // Para upsert simple, actualizamos actualizadoEn.
      },
      { onConflict: 'pedidoNumero' }
    );

  if (error) {
    console.error("Error guardando pedido en Supabase:", error);
    throw error;
  }
}

/**
 * Carga un pedido por número
 */
export async function cargarPedidoFirebase(pedidoNumero) {
  if (!pedidoNumero) throw new Error("Falta pedidoNumero");

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("pedidoNumero", String(pedidoNumero))
    .single();

  if (error) {
    // Si no existe, Supabase devuelve error code 'PGRST116'
    if (error.code === 'PGRST116') return null;
    console.error("Error cargando pedido de Supabase:", error);
    throw error;
  }

  return data;
}

/**
 * Obtiene todos los pedidos ordenados por fecha de actualización descendente
 */
export async function obtenerTodosPedidosFirebase() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("actualizadoEn", { ascending: false });

  if (error) {
    console.error("Error obteniendo pedidos de Supabase:", error);
    throw error;
  }

  return data;
}
