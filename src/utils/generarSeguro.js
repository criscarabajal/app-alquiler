// src/utils/generarSeguro.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png";
import lochImg from "../assets/loch.jpeg";
import { formatearFechaHora } from "./Fecha";

export function generarNumeroSeguro() {
  const ahora = new Date();
  const dd = String(ahora.getDate()).padStart(2, "0");
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const yy = String(ahora.getFullYear()).slice(-2);
  const fecha = `${dd}${mm}${yy}`;
  const contador = Math.floor(Math.random() * 1000) + 1;
  return `${fecha}-S${contador}`;
}

export default function generarSeguroPDF(
  cliente,
  productosSeleccionados,
  atendidoPor,
  numeroSeguro,
  pedidoNumero = "",
  jornadasMap = {}
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;

  // Header: logos, número y título
  const drawHeader = () => {
    const imgP = doc.getImageProperties(logoImg);
    const logoW = 100;
    const logoH = (imgP.height * logoW) / imgP.width;
    doc.addImage(logoImg, "PNG", M, 20, logoW, logoH);

    const imgL = doc.getImageProperties(lochImg);
    const lochW = 60;
    const lochH = (imgL.height * lochW) / imgL.width;
    doc.addImage(lochImg, "JPEG", M + logoW + 10, 20, lochW, lochH);

    doc.setFontSize(16);
    doc.text(`${numeroSeguro}`, W - M, 40, { align: "right" });

    doc.setFontSize(10);
    doc.text(`Pedido N°: ${pedidoNumero}`, W - M, 88, { align: "right" });

    doc.setFillColor(242, 242, 242);
    doc.rect(M, 80, W - 2 * M, 18, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("SEGURO DEL PEDIDO", W / 2, 93, { align: "center" });
  };

  // Datos del cliente
  const drawClientData = () => {
    doc.setFontSize(9);
    doc.text(`CLIENTE: ${cliente.nombre} ${cliente.apellido}`, M, 110);
    doc.text(`D.N.I.: ${cliente.dni}`, M, 125);
    doc.text(`TEL: ${cliente.telefono}`, M, 140);
    doc.text(`ATENDIDO: ${atendidoPor}`, W - M - 140, 110);
    doc.text(
      `RETIRO: ${formatearFechaHora(new Date(cliente.fechaRetiro))}`,
      M,
      160
    );
    doc.text(
      `DEVOLUCIÓN: ${formatearFechaHora(new Date(cliente.fechaDevolucion))}`,
      M + 300,
      160
    );
  };

  drawHeader();
  drawClientData();

  // Columnas: Detalle, N° de Serie, Cant., Valor unit., Parcial valor de reposición, Cod.
  const cols = [
    { header: "Detalle", dataKey: "detalle" },
    { header: "N° de Serie", dataKey: "serie" },
    { header: "Cant.", dataKey: "cantidad" },
    { header: "Valor unit.", dataKey: "valorUnit" },
    { header: "Parcial valor de reposición", dataKey: "parcial" },
    
  ];

  // Agrupar por categoría
  const grupos = {};
  productosSeleccionados.forEach((item, idx) => {
    const cat = item.categoria || "Sin categoría";
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push({ ...item, __idx: idx });
  });

  // Construir body
  const body = [];
  Object.entries(grupos).forEach(([cat, items]) => {
    body.push({ _category: cat });
    items.forEach(i => {
      // calcular valores
      const qty = parseInt(i.cantidad, 10) || 0;
      const unit = parseFloat(i.precio) || 0;
      const parcial = qty * unit;
      const líneas = [i.nombre];
      if (i.incluye) líneas.push(...i.incluye.split("\n"));

      body.push({
        detalle: líneas.join("\n"),
        serie: i.serial || "",
        cantidad: qty,
        valorUnit: `$${unit.toFixed(0)}`,
        parcial: `$${parcial.toFixed(0)}`,
        cod: ""
      });
    });
  });

  // Dibujar tabla
  autoTable(doc, {
    startY: 180,
    margin: { top: 180, left: M, right: M },
    head: [cols.map(c => c.header)],
    body: body.map(row =>
      row._category
        ? [{ content: row._category, colSpan: cols.length, styles: { fillColor: [235, 235, 235], fontStyle: "bold" } }]
        : cols.map(c => row[c.dataKey])
    ),
    styles: { fontSize: 8, cellPadding: 2 },
    theme: "grid",
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
    didParseCell: data => {
      if (data.row.raw[0] && data.row.raw[1] === undefined) {
        data.cell.colSpan = cols.length;
        data.cell.styles.fillColor = [235, 235, 235];
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: () => { drawHeader(); drawClientData(); }
  });

  // Pie de página (precio s/IVA y detalle opcional)
  const endY = doc.lastAutoTable.finalY + 20;
  const totalSinIVA = productosSeleccionados.reduce((sum, item) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const unit = parseFloat(item.precio) || 0;
    return sum + qty * unit;
  }, 0);
  const appliedDiscount = parseFloat(localStorage.getItem("descuento")) || 0;
  const totalConDescuento = totalSinIVA * (1 - appliedDiscount / 100);

  const boxX = W - M - 150;
  const boxH = appliedDiscount > 0 ? 60 : 40;
  

  doc.setFontSize(10);
  doc.text("Valor de reposición en dólar oficial (BCRA)", boxX + 75, endY + 2, { align: "center" });
  if (appliedDiscount > 0) {
    doc.text(`Descuento ${appliedDiscount}%`, boxX + 75, endY + 20, { align: "center" });
    doc.text(`$${totalConDescuento.toFixed(0)}`, boxX + 75, endY + 38, { align: "center" });
  } else {
    doc.text(`$${totalSinIVA.toFixed(0)}`, boxX + 75, endY + 20, { align: "center" });
  }

  // Guardar
  doc.save(`Seguro_${cliente.apellido}_${numeroSeguro}.pdf`);
}
