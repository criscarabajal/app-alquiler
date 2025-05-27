// src/utils/generarRemito.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png"; // ajusta la ruta si es necesario
import { formatearFechaHora } from "./Fecha";

export function generarNumeroRemito() {
  const ahora = new Date();
  const dd = String(ahora.getDate()).padStart(2, "0");
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const yy = String(ahora.getFullYear()).slice(-2);
  const fecha = `${dd}${mm}${yy}`;
  const contador = Math.floor(Math.random() * 1000) + 1;
  return `${fecha}-${contador}`;
}

export default function generarRemitoPDF(
  cliente,
  productosSeleccionados,
  atendidoPor,
  numeroRemito
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40; // margen

  // --- HEADER ---
  const imgProps = doc.getImageProperties(logoImg);
  const logoW = 100;
  const logoH = (imgProps.height * logoW) / imgProps.width;
  doc.addImage(logoImg, "PNG", M, 20, logoW, logoH);

  // número remito
  doc.setFontSize(16);
  doc.text(`N° ${numeroRemito}`, W - M, 40, { align: "right" });

  // --- DATOS CLIENTE / ATENCIÓN ---
  doc.setFontSize(9);
  doc.text(`CLIENTE: ${cliente.nombre || ""}`, M, 80);
  doc.text(`D.N.I.: ${cliente.dni || ""}`, M, 95);
  doc.text(`TEL: ${cliente.telefono || ""}`, M, 110);

  doc.text(`ATENDIDO: ${atendidoPor}`, W - M - 140, 80);
  doc.text(`MESA ATENCIÓN:`, W - M - 140, 95);
  doc.text(`HORA:`, W - M - 140, 110);

  // --- CRONOGRAMA DEL PEDIDO ---
  doc.setFillColor(242, 242, 242);
  doc.rect(M, 130, W - 2 * M, 18, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text("CRONOGRAMA DEL PEDIDO", W / 2, 143, { align: "center" });
  doc.setFontSize(9);

  const retiro = formatearFechaHora(new Date(cliente.fechaRetiro || ""));
  const devol = formatearFechaHora(new Date(cliente.fechaDevolucion || ""));
  doc.text(`RETIRO: ${retiro}`, M, 160);
  doc.text(`DEVOLUCIÓN: ${devol}`, M + 300, 160);

  // --- TABLA DETALLE por categoría ---
  let startY = 180;
  const cols = [
    { header: "Cantidad", dataKey: "cantidad" },
    { header: "Detalle", dataKey: "detalle" },
    { header: "N° de Serie", dataKey: "serie" },
    { header: "Cod.", dataKey: "cod" }
  ];

  // Agrupar por categoría
  const grupos = {};
  productosSeleccionados.forEach(item => {
    const cat = item.categoria || "Sin categoría";
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(item);
  });

  const body = [];
  Object.entries(grupos).forEach(([cat, items]) => {
    body.push({ _category: cat });
    items.forEach(i => {
      const líneas = [i.nombre];
      if (i.incluye) líneas.push(...i.incluye.split("\n"));
      body.push({
        cantidad: i.cantidad,
        detalle: líneas.join("\n"),
        serie: i.serial || "",
        cod: ""
      });
    });
  });

  autoTable(doc, {
    startY,
    head: [cols.map(c => c.header)],
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0]
    },
    body: body.map(row =>
      row._category
        ? [{ content: row._category, colSpan: 4, styles: { fillColor: [235, 235, 235], fontStyle: "bold" } }]
        : [row.cantidad, row.detalle, row.serie, row.cod]
    ),
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: M, right: M },
    theme: "grid",
    didParseCell: data => {
      if (data.row.raw[0] && data.row.raw[1] === undefined) {
        data.cell.colSpan = 4;
        data.cell.styles.fillColor = [235, 235, 235];
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  // --- PIE: cajas, precio, pago, firmas ---
  const endY = doc.lastAutoTable.finalY + 20;

  // cajas
  doc.setFontSize(8);
  doc.text("CAJAS PLÁSTICAS   |   CAJAS PELICAN   |   FUNDAS DE TELA", M, endY);

  // PRECIO s/IVA
  const totalSinIVA = productosSeleccionados.reduce((sum, i) => {
    const price = parseFloat(i.precio) || 0;
    return sum + price * i.cantidad;
  }, 0);
  const boxX = W - M - 150;
  doc.rect(boxX, endY - 10, 150, 40);
  doc.setFontSize(8);
  doc.text("PRECIO s/IVA", boxX + 75, endY + 2, { align: "center" });
  doc.setFontSize(10);
  doc.text(`$${totalSinIVA.toFixed(2)}`, boxX + 75, endY + 18, { align: "center" });

  // PAGO
  doc.rect(boxX, endY + 35, 150, 70);
  doc.setFontSize(8);
  doc.text("PAGO", boxX + 75, endY + 50, { align: "center" });
  doc.text("Efectivo [ ]", boxX + 5, endY + 65);
  doc.text("MP Guido [ ]", boxX + 5, endY + 80);
  doc.text("MP Jona [ ]", boxX + 5, endY + 95);

  // firmas
  const sigY = endY + 200;
  const segment = (W - 2 * M) / 3;
  ["FIRMA", "ACLARACIÓN", "D.N.I."].forEach((txt, i) => {
    const x = M + i * segment;
    doc.line(x, sigY, x + segment - 20, sigY);
    doc.setFontSize(8);
    doc.text(txt, x, sigY + 12);
  });

  // nota
  doc.setFontSize(6);
  doc.text("guardias no incluidas", M, sigY + 30);

  // guardar
  doc.save(`Remito_${cliente.apellido}_${numeroRemito}.pdf`);
}
