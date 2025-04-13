export async function fetchProductos() {
  const sheetId = "1DhpNyUyM-sTHuoucELtaDP3Ul5-JemSrw7uhnhohMZc";
  const sheetName = "PRODUCTOS";
  const query = encodeURIComponent("SELECT *");
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=${query}`;

  try {
    const res = await fetch(url);
    const text = await res.text();

    const json = JSON.parse(text.substring(47).slice(0, -2));
    const cols = json.table.cols.map((col) => col.label);
    const rows = json.table.rows.map((row) => {
      const obj = {};
      row.c.forEach((cell, i) => {
        const label = cols[i];
        obj[label] = cell?.v ?? "";
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
      };
    });

    return rows;
  } catch (error) {
    console.error("Error al cargar productos:", error);
    return [];
  }
}
