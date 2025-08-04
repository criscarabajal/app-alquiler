// src/utils/fetchProductos.js
export async function fetchProductos() {
  const sheetId   = "1DhpNyUyM-sTHuoucELtaDP3Ul5-JemSrw7uhnhohMZc";
  const sheetName = "PRODUCTOS";
  const query     = encodeURIComponent("SELECT *");
  const url       = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=${query}`;

  try {
    const res  = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(
      text
        .substring(text.indexOf("(") + 1, text.lastIndexOf(")"))
    );

    // Lee todas las etiquetas (headers)
    const cols = json.table.cols.map(c => c.label.trim());
    console.log("Headers detectados:", cols);

    // Asumimos que “VALOR DE REPOSICIÓN” está en la columna K => índice 10
    const idxValorRep = 10;

    // Mapeo de filas
    const rows = json.table.rows.map(r => {
      const obj = {};
      r.c.forEach((cell, i) => obj[cols[i]] = cell?.v ?? "");

      return {
        nombre:          obj["Equipos"]          || "",
        categoria:       obj["Categoria"]        || "",
        subcategoria:    obj["SUB-CATEGORIA"]    || "",
        stock:           obj["STOCK"]            || "",
        precio:          obj["PRECIO"]           || "",
        alquilable:      obj["ALQUILABLE"]       || "",
        serial:          obj["SERIAL"]           || "",
        incluye:         obj["INCLUYE"]          || "",
        // ===> propiedad nueva:
        valorReposicion: parseFloat(r.c[idxValorRep]?.v) || 0
      };
    });

    console.log("Primer producto con valorReposicion:", rows[0]);
    return rows;
  } catch (err) {
    console.error("Error fetchProductos:", err);
    return [];
  }
}
