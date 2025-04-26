// src/utils/fetchClientes.js
export async function fetchClientes() {
  const sheetId = "1DhpNyUyM-sTHuoucELtaDP3Ul5-JemSrw7uhnhohMZc";
  const sheetName = "CLIENTES";  // Asegurate de que tu pestaña de clientes se llame así
  const query = encodeURIComponent("SELECT *");
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=${query}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    // El API de Google Sheets devuelve un prefix y un suffix que hay que quitar
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const cols = json.table.cols.map(col => col.label.trim());

    return json.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[cols[i]] = cell?.v ?? "";
      });
      return {
        dni: obj["DNI"]?.toString() || "",
        nombre: obj["Nombre"] || "",
        apellido: obj["Apellido"] || "",
        correo: obj["Email"] || "",
        telefono: obj["Telefono"] || "",
      };
    });
  } catch (error) {
    console.error("Error al cargar clientes:", error);
    return [];
  }
}
