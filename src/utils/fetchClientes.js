// src/utils/fetchClientes.js

export async function fetchClientes() {
    const sheetId = "1DhpNyUyM-sTHuoucELtaDP3Ul5-JemSrw7uhnhohMZc";
    const sheetName = "CLIENTES";
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
          nombre: obj["Nombre"],
          apellido: obj["Apellido"],
          dni: obj["DNI"],
          atendidoPor: obj["AtendidoPor"],
          fechaRetiro: obj["FechaRetiro"],
          fechaDevolucion: obj["FechaDevolucion"],
        };
      });
      return rows;
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      return [];
    }
  }
  
  export async function addClient(client) {
    // IMPORTANTE: Para agregar un cliente, se requiere un endpoint que permita escribir en el Google Sheet.
    // Puedes crear un Google Apps Script que actúe como webhook y lo despliegues como web app.
    // Reemplaza 'URL_DE_TU_APP_SCRIPT' por la URL de tu servicio.
    try {
      const response = await fetch("URL_DE_TU_APP_SCRIPT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      });
      return await response.json();
    } catch (error) {
      console.error("Error al agregar el cliente:", error);
      return null;
    }
  }
  