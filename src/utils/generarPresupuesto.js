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
  const dd = String(ahora.getDate()).padStart(2, '0');
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const yy = String(ahora.getFullYear()).slice(-2);
  const fechaClave = `${dd}${mm}${yy}`;
  const storageKey = `presupCounter_${fechaClave}`;
  let contador = parseInt(localStorage.getItem(storageKey) || '0', 10);
  contador = Math.min(contador + 1, 1000);
  localStorage.setItem(storageKey, String(contador));
  return `${fechaClave}-${contador}`;
}

/**
 * Genera el PDF del presupuesto con estilo A4 y multi-página si es necesario.
 * Incluye logo principal, logo secundario, datos del cliente, tabla con jornadas,
 * precios destacados y totales con IVA.
 */
export default function generarPresupuestoPDF(
  cliente,
  productosSeleccionados,
  jornadasMap,
  atendidoPor,
  numeroPresupuesto,
  fechaEmision
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;

  // --- Dibuja el encabezado (logos, título, número y fecha) ---
  const drawHeader = () => {
    // logo principal
    const imgP = doc.getImageProperties(logoImg);
    const logoW = 100;
    const logoH = (imgP.height * logoW) / imgP.width;
    doc.addImage(logoImg, "PNG", M, 40, logoW, logoH);

    // logo secundario
    const imgL = doc.getImageProperties(lochImg);
    const lochW = 60;
    const lochH = (imgL.height * lochW) / imgL.width;
    doc.addImage(lochImg, "JPEG", M + logoW + 10, 40, lochW, lochH);

    // título y número/fecha
    doc.setFontSize(18);
    doc.text("PRESUPUESTO", W - M, 60, { align: "right" });
    doc.setFontSize(10);
    doc.text(`N°: ${numeroPresupuesto}`, W - M, 78, { align: "right" });
    doc.text(`Fecha: ${fechaEmision}`, W - M, 92, { align: "right" });

    // línea separadora
    doc.setLineWidth(0.5);
    doc.line(M, 100, W - M, 100);
  };

  // --- Dibuja los datos del cliente y de atención ---
  const drawClientData = (yStart) => {
    let y = yStart;
    doc.setFontSize(12);
    doc.text("Cliente:", M, y);
    doc.setFontSize(10);
    doc.text(`${cliente.nombre} ${cliente.apellido}`, M + 60, y);
    y += 16;
    doc.text("DNI:", M, y);
    doc.text(cliente.dni, M + 60, y);
    y += 16;
    doc.text("Email:", M, y);
    doc.text(cliente.email || "-", M + 60, y);
    y += 16;
    doc.text("Teléfono:", M, y);
    doc.text(cliente.telefono || "-", M + 60, y);
    y += 24;
    doc.text(`Atendido por: ${atendidoPor}`, M, y);
    return y + 16;
  };

  // Dibujamos encabezado y datos en la primera página
  drawHeader();
  let y = drawClientData(120);

  // --- Tabla de productos con Jornadas ---
  const headers = ["Descripción", "Cant.", "Jornadas", "P.U.", "Subtotal"];
  const body = productosSeleccionados.map((item, idx) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const j = parseInt(jornadasMap[idx], 10) || 1;
    const price = parseFloat(item.precio) || 0;
    const subtotal = qty * price * j;
    return [item.nombre, qty, j, price.toFixed(2), subtotal.toFixed(2)];
  });

  console.log("body de la tabla de presupuesto:", body);
  autoTable(doc, {
    startY: y,
    margin: { top: y, left: M, right: M },
    head: [headers],
    body,
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
    theme: "grid",
    pageBreak: "auto",
    didDrawPage: (data) => {
      // en nuevas páginas, repetir encabezado y datos
      if (data.pageNumber > 1) {
        drawHeader();
        drawClientData(120);
      }
    }
  });

  // --- Totales y precios ---
  const finalY = doc.lastAutoTable.finalY + 20;
  const totalBruto = body.reduce((sum, row) => sum + parseFloat(row[4]), 0);
  const appliedDiscount = parseFloat(localStorage.getItem("descuento")) || 0;
  const descuentoMonto = (totalBruto * appliedDiscount) / 100;
  const totalTrasDescuento = totalBruto - descuentoMonto;
  const ivaMonto = totalTrasDescuento * 0.21;
  const totalConIVA = totalTrasDescuento + ivaMonto;

  // Precio SIN IVA (más grande)
  doc.setFontSize(12);
  doc.text(
    `Precio sin IVA: $${totalTrasDescuento.toFixed(2)}`,
    W - M,
    finalY,
    { align: "right" }
  );

  // Descuento e IVA (tamaño medio)
  doc.setFontSize(8);
  if (appliedDiscount > 0) {
    doc.text(
      `Descuento (${appliedDiscount}%): -$${descuentoMonto.toFixed(2)}`,
      W - M,
      finalY + 18,
      { align: "right" }
    );
  }
  doc.text(
    `IVA 21%: $${ivaMonto.toFixed(2)}`,
    W - M,
    finalY + 34,
    { align: "right" }
  );

  // Total con IVA (tamaño normal)
  doc.setFontSize(8);
  doc.text(
    `Total: $${totalConIVA.toFixed(2)}`,
    W - M,
    finalY + 56,
    { align: "right" }
  );

  // --- Aclaraciones ---
  const clarisY = finalY + 90;
  doc.setFontSize(9);
  doc.text("Aclaraciones:", M, clarisY);
  doc.setFontSize(8);
  [
    "Validez del presupuesto: 20 días",
    "Formas de pago: Efectivo • MercadoPago • Transferencia",
    "Sin seguro en tránsito",
    "Responsable de reposición por daños o faltantes",
    "No incluye transporte ni guardia"
  ].forEach((line, i) => {
    doc.text(line, M + 20, clarisY + 12 + i * 12);
  });

  // Guardar el PDF
  doc.save(`${cliente.apellido}-${numeroPresupuesto}.pdf`);
}
