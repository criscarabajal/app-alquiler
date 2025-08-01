// src/utils/fetchProductos.js
export async function fetchProductos() {
  const sheetId = "1DhpNyUyM-sTHuoucELtaDP3Ul5-JemSrw7uhnhohMZc";
  const sheetName = "PRODUCTOS";
  const query = encodeURIComponent("SELECT *");
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=${query}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    // Extraemos los headers
    const cols = json.table.cols.map(col => col.label.trim());

    // Buscamos el índice de la columna “VALOR DE REPOSICION” (con o sin tilde)
    const reposKey = cols.find(
      l => /valor\s+de\s+reposici[oó]n?/i.test(l)
    );

    const rows = json.table.rows.map(row => {
      // construimos un objeto plano con key=header, val=cell.v
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[cols[i]] = cell?.v ?? "";
      });

      return {
        nombre: obj["Equipos"],
        categoria: obj["Categoria"],
        subcategoria: obj["SUB-CATEGORIA"],
        stock: obj["STOCK"],
        precio: obj["PRECIO"],
        alquilable: obj["ALQUILABLE"],
        serial: obj["SERIAL"],
        incluye: obj["INCLUYE"],
        // acá usamos reposKey para leer el valor correcto
        valorReposicion: obj[reposKey] ?? 0
      };
    });

    console.log("Headers detectados:", cols);
    console.log("Clave valor reposición:", reposKey);
    console.log("Primer producto:", rows[0]);

    return rows;
  } catch (error) {
    console.error("Error al cargar productos:", error);
    return [];
  }
}
