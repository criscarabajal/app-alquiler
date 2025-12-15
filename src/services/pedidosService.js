// src/services/pedidosService.js
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "pedidos";

/**
 * Guarda o actualiza un pedido en Firebase
 */
export async function guardarPedidoFirebase({
  pedidoNumero,
  cliente,
  carrito,
  jornadasMap,
  usuario,
}) {
  if (!pedidoNumero) throw new Error("Falta pedidoNumero");

  const ref = doc(db, COLLECTION, String(pedidoNumero));

  await setDoc(
    ref,
    {
      pedidoNumero: String(pedidoNumero),
      cliente: cliente || {},
      carrito: carrito || [],
      jornadasMap: jornadasMap || {},
      usuario: usuario || null,
      actualizadoEn: serverTimestamp(),
      creadoEn: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Carga un pedido por número
 */
export async function cargarPedidoFirebase(pedidoNumero) {
  if (!pedidoNumero) throw new Error("Falta pedidoNumero");

  const ref = doc(db, COLLECTION, String(pedidoNumero));
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data();
}
