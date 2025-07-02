// src/utils/generarPresupuesto.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png";
import lochImg from "../assets/loch.jpeg";

/**
 * Genera un número de presupuesto único para la fecha actual.
 */
export function generarNumeroPresupuesto() {
  const ahora = new Date();
  const dd = String(ahora.getDate()).padStart(2, "0");
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const yy = String(ahora.getFullYear()).slice(-2);
  const fecha = `${dd}${mm}${yy}`;
  const contador = Math.floor(Math.random() * 1000) + 1;
  return `${fecha}-${contador}`;
}

/**
 * Genera el PDF del presupuesto con agrupación por categoría,
 * detalle multilineal, número de pedido, precios con $ y sin decimales,
 * y sección de aclaraciones al final.
 */
export default function generarPresupuestoPDF(
  cliente,
  productosSeleccionados,
  jornadasMap,
  fechaEmision,
  pedidoNumero = ''
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;

  // --- Encabezado ---
  const drawHeader = () => {
    const imgP = doc.getImageProperties(logoImg);
    const logoW = 100;
    const logoH = (imgP.height * logoW) / imgP.width;
    doc.addImage(logoImg, "PNG", M, 40, logoW, logoH);

    const imgL = doc.getImageProperties(lochImg);
    const lochW = 60;
    const lochH = (imgL.height * lochW) / imgL.width;
    doc.addImage(lochImg, "JPEG", M + logoW + 10, 40, lochW, lochH);

    doc.setFontSize(18);
    doc.text("presupuesto", W - M, 60, { align: "right" });
    doc.setFontSize(12);
    if (pedidoNumero) {
      doc.text(`Pedido n°: ${pedidoNumero}`, W - M, 90, { align: "right" });
    }
    doc.setLineWidth(0.5);
    doc.line(M, 110, W - M, 110);
  };

  // --- Datos del cliente ---
  const drawClientData = (yStart) => {
    let y = yStart;
    doc.setFontSize(12);
    doc.text("cliente:", M, y);
    doc.setFontSize(10);
    doc.text(`${cliente.nombre} ${cliente.apellido}`, M + 70, y);
    y += 16;
    doc.text("dni:", M, y);
    doc.text(cliente.dni, M + 70, y);
    y += 16;
    doc.text("teléfono:", M, y);
    doc.text(cliente.telefono || "-", M + 70, y);
    y += 16;
    doc.text("email:", M, y);
    doc.text(cliente.correo || "-", M + 70, y);
    return y + 24;
  };

  drawHeader();
  let cursorY = drawClientData(140);

  // --- Agrupar por categoría y tabla ---
  const grupos = {};
  productosSeleccionados.forEach((item, idx) => {
    const cat = item.categoria || "sin categoría";
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(item);
  });

  const headers = ["detalle", "cant.", "jornadas", "p.u.", "subtotal"];
  const body = [];
  Object.entries(grupos).forEach(([cat, items]) => {
    // fila categoría
    body.push([{ content: cat, colSpan: 5, styles: { fillColor: [235,235,235], fontStyle: 'bold' } }]);
    items.forEach((i, idx) => {
      const qty = parseInt(i.cantidad, 10) || 0;
      const j = parseInt(jornadasMap[idx], 10) || 1;
      const price = parseFloat(i.precio) || 0;
      const subtotal = qty * price * j;
      const detalleLines = [i.nombre];
      if (i.incluye) detalleLines.push(...i.incluye.split("\n"));
      body.push([
        detalleLines.join("\n"),
        qty,
        j,
        `$${price.toFixed(0)}`,
        `$${subtotal.toFixed(0)}`
      ]);
    });
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { top: cursorY, left: M, right: M },
    head: [headers],
    body,
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [230,230,230], textColor: [0,0,0] },
    theme: "grid",
    pageBreak: "auto",
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawHeader();
        drawClientData(140);
      }
    }
  });

  // --- Totales ---
  const finalY = doc.lastAutoTable.finalY + 20;
  const totalBruto = Object.values(grupos).flat().reduce((sum, itm, idx) => {
    const qty = parseInt(itm.cantidad, 10) || 0;
    const j = parseInt(jornadasMap[idx], 10) || 1;
    const price = parseFloat(itm.precio) || 0;
    return sum + qty * price * j;
  }, 0);
  const appliedDiscount = parseFloat(localStorage.getItem("descuento")) || 0;
  const descuentoMonto = (totalBruto * appliedDiscount)/100;
  const totalTrasDescuento = totalBruto - descuentoMonto;
  const ivaMonto = totalTrasDescuento * 0.21;
  const totalConIVA = totalTrasDescuento + ivaMonto;

  doc.setFontSize(15);
  doc.text(`Precio sin iva: $${totalTrasDescuento.toFixed(0)}`, W - M, finalY, { align: "right" });
  doc.setFontSize(12);
  if (appliedDiscount > 0) {
    doc.text(`Descuento (${appliedDiscount}%): -$${descuentoMonto.toFixed(0)}`, W - M, finalY + 16, { align: "right" });
  }
  doc.text(`IVA 21%: $${ivaMonto.toFixed(0)}`, W - M, finalY + 32, { align: "right" });
  doc.setFontSize(12);
  doc.text(`Total: $${totalConIVA.toFixed(0)}`, W - M, finalY + 52, { align: "right" });

  // --- Aclaraciones en minúsculas ---
  const notasY = finalY + 80;
  doc.setFontSize(9);
  doc.text("Aclaraciones:", M, notasY);
  doc.setFontSize(8);
  const lines = [
    "validez del presupuesto: 20 días",
    "formas de pago: efectivo • mercadopago • transferencia",
    "el alquiler de equipo no incluye seguro",
    "el cliente es responsable por extravio, robo, daño y/o faltantes",
    "el alquiler no incluye transporte ni guardia"
  ];
  lines.forEach((ln, i) => {
    doc.text(ln, M, notasY + 12 + i * 12);
  });

  // guardar
  doc.save(`${cliente.apellido}_${fechaEmision}.pdf`);
}
