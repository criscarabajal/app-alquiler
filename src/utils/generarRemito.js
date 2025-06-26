// src/utils/generarRemito.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png";      // logo principal
import lochImg from "../assets/loch.jpeg";     // logo secundario
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

  // ——— header por página ———
  const drawHeader = () => {
    const imgProps = doc.getImageProperties(logoImg);
    const logoW = 100;
    const logoH = (imgProps.height * logoW) / imgProps.width;
    doc.addImage(logoImg, "PNG", M, 20, logoW, logoH);
    const lochProps = doc.getImageProperties(lochImg);
    const lochW = 60;
    const lochH = (lochProps.height * lochW) / lochProps.width;
    doc.addImage(lochImg, "JPEG", M + logoW + 10, 20, lochW, lochH);
    doc.setFontSize(16);
    doc.text(`N° ${numeroRemito}`, W - M, 40, { align: "right" });
    doc.setFillColor(242, 242, 242);
    doc.rect(M, 80, W - 2 * M, 18, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("CRONOGRAMA DEL PEDIDO", W / 2, 93, { align: "center" });
  };

  // ——— datos del cliente ———
  const drawClientData = () => {
    doc.setFontSize(9);
    doc.text(`CLIENTE: ${cliente.nombre || ""} ${cliente.apellido || ""}`, M, 110);
    doc.text(`D.N.I.: ${cliente.dni || ""}`, M, 125);
    doc.text(`TEL: ${cliente.telefono || ""}`, M, 140);
    doc.text(`ATENDIDO: ${atendidoPor}`, W - M - 140, 110);
    doc.text(`RETIRO: ${formatearFechaHora(new Date(cliente.fechaRetiro || ""))}`, M, 160);
    doc.text(`DEVOLUCIÓN: ${formatearFechaHora(new Date(cliente.fechaDevolucion || ""))}`, M + 300, 160);
  };

  drawHeader();
  drawClientData();

  // ——— tabla de items ———
  const cols = [
    { header: "Cantidad", dataKey: "cantidad" },
    { header: "Detalle", dataKey: "detalle" },
    { header: "N° de Serie", dataKey: "serie" },
    { header: "Cod.", dataKey: "cod" }
  ];
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
    startY: 180,
    margin: { top: 180, left: M, right: M },
    head: [cols.map(c => c.header)],
    body: body.map(row =>
      row._category
        ? [{ content: row._category, colSpan: 4, styles: { fillColor: [235, 235, 235], fontStyle: "bold" } }]
        : [row.cantidad, row.detalle, row.serie, row.cod]
    ),
    styles: { fontSize: 8, cellPadding: 2 },
    theme: "grid",
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
    didParseCell: data => {
      if (data.row.raw[0] && data.row.raw[1] === undefined) {
        data.cell.colSpan = 4;
        data.cell.styles.fillColor = [235, 235, 235];
        data.cell.styles.fontStyle = "bold";
      }
    },
    pageBreak: 'auto',
    didDrawPage: () => {
      drawHeader();
      drawClientData();
    }
  });

  // ——— precio y descuento ———
  const endY = doc.lastAutoTable.finalY + 20;
  // total sin IVA antes descuento
  const totalSinIVA = productosSeleccionados.reduce(
    (sum, i) => sum + (parseFloat(i.precio) || 0) * i.cantidad,
    0
  );
  // descuento (%) guardado en localStorage
  const appliedDiscount = parseFloat(localStorage.getItem('descuento')) || 0;
  const totalConDescuento = totalSinIVA * (1 - appliedDiscount / 100);

  // dibujar recuadro
  const boxX = W - M - 150;
  // altura mayor si hay descuento para dos líneas
  const boxH = appliedDiscount > 0 ? 60 : 40;
  doc.rect(boxX, endY - 10, 150, boxH);

  // etiqueta
  doc.setFontSize(10);
  doc.text("PRECIO s/IVA", boxX + 75, endY + 2, { align: "center" });

  // descuento y precio con mismo tamaño
  doc.setFontSize(10);
  if (appliedDiscount > 0) {
    // línea de descuento
    doc.text(`Descuento ${appliedDiscount.toFixed(0)}%`, boxX + 75, endY + 20, { align: "center" });
    // línea de total con descuento
    doc.text(`$${totalConDescuento.toFixed(2)}`, boxX + 75, endY + 38, { align: "center" });
  } else {
    // precio normal
    doc.text(`$${totalSinIVA.toFixed(2)}`, boxX + 75, endY + 20, { align: "center" });
  }

  // ——— resto del pie (pago y firmas) ———
  doc.rect(boxX, endY + boxH + 10, 150, 70);
  doc.text("PAGO", boxX + 75, endY + boxH + 25, { align: "center" });
  doc.text("Efectivo [ ]", boxX + 5, endY + boxH + 40);
  doc.text("MP Guido [ ]", boxX + 5, endY + boxH + 55);
  doc.text("MP Jona [ ]", boxX + 5, endY + boxH + 70);

  const sigY = endY + boxH + 200;
  const segment = (W - 2 * M) / 3;
  ["FIRMA", "ACLARACIÓN", "D.N.I."].forEach((txt, i) => {
    const x = M + i * segment;
    doc.line(x, sigY, x + segment - 20, sigY);
    doc.setFontSize(8);
    doc.text(txt, x, sigY + 12);
  });

  doc.setFontSize(6);
  doc.text("guardias no incluidas", M, sigY + 30);

  // guardar
  doc.save(`Remito_${cliente.apellido}_${numeroRemito}.pdf`);
}
