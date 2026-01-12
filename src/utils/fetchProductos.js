import { supabase } from "../supabase";

export async function fetchProductos() {
  try {
    console.log("Intentando buscar productos en Supabase (tabla: bbdd-prueba)...");
    const { data, error } = await supabase
      .from('bbdd-prueba')
      .select('*');

    if (error) {
      console.error("❌ Error CRÍTICO fetching products from Supabase:", error);
      console.error("Detalles del error:", error.message, error.details, error.hint);
      return [];
    }

    console.log("✅ Datos recibidos de Supabase (raw):", data);

    if (!data || data.length === 0) {
      console.warn("⚠️ La consulta a Supabase no retornó filas (data array vacío).");
      return [];
    }

    // Función helper para buscar propiedades sin importar mayúsculas/minúsculas
    const getVal = (item, keys) => {
      const itemKeys = Object.keys(item);
      for (const k of keys) {
        // Busca coincidencia exacta
        if (item[k] !== undefined) return item[k];
        // Busca coincidencia case-insensitive
        const foundKey = itemKeys.find(ik => ik.toLowerCase() === k.toLowerCase());
        if (foundKey) return item[foundKey];
      }
      return "";
    };

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
    console.error("Error fetchProductos (Supabase):", err);
    return [];
  }
}
