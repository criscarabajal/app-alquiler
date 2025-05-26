// src/utils/generarPresupuesto.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// Ajusta la ruta si tu logo está en otro sitio
import logoImg from "../assets/logo.png";

export function generarNumeroPresupuesto() {
  const ahora = new Date();
  const dd = String(ahora.getDate()).padStart(2, '0');
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const yy = String(ahora.getFullYear()).slice(-2);
  const fechaClave = `${dd}${mm}${yy}`;               // e.g. "260525"
  const storageKey = `presupCounter_${fechaClave}`;
  let contador = parseInt(localStorage.getItem(storageKey) || '0', 10);
  contador = Math.min(contador + 1, 1000);
  localStorage.setItem(storageKey, String(contador));
  return `${fechaClave}-${contador}`;                 // e.g. "260525-2"
}

/**
 * @param {Object} cliente
 * @param {Array} productosSeleccionados
 * @param {Object} jornadasMap   // { 0: 2, 1: 1, ... }
 * @param {string} atendidoPor
 * @param {string} numeroPresupuesto
 * @param {string} fechaEmision
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
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Encabezado ---
  doc.addImage(logoImg, "PNG", 40, 40, 100, 40);
  doc.setFontSize(18);
  doc.text("PRESUPUESTO", pageWidth - 40, 50, { align: "right" });
  doc.setFontSize(10);
  doc.text(`N°: ${numeroPresupuesto}`, pageWidth - 40, 68, { align: "right" });
  doc.text(`Fecha: ${fechaEmision}`, pageWidth - 40, 82, { align: "right" });
  doc.setLineWidth(0.5);
  doc.line(40, 100, pageWidth - 40, 100);

  // --- Datos del Cliente ---
  let y = 120;
  doc.setFontSize(12);
  doc.text("Cliente:", 40, y);
  doc.setFontSize(10);
  doc.text(`${cliente.nombre} ${cliente.apellido}`, 100, y);
  y += 16;
  doc.text("DNI:", 40, y);
  doc.text(cliente.dni, 100, y);
  y += 16;
  doc.text("Email:", 40, y);
  doc.text(cliente.email || "-", 100, y);
  y += 16;
  doc.text("Teléfono:", 40, y);
  doc.text(cliente.telefono || "-", 100, y);
  y += 24;

  // --- Tabla de Productos con Jornadas ---
  const headers = ["Descripción", "Cant.", "Jornadas", "P.U.", "Subtotal"];
  const body = productosSeleccionados.map((item, idx) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const j = parseInt(jornadasMap[idx], 10) || 1;
    const price = parseFloat(item.precio) || 0;
    const subtotal = qty * price * j;
    return [ item.nombre, qty, j, price.toFixed(2), subtotal.toFixed(2) ];
  });

  autoTable(doc, {
    startY: y,
    head: [headers],
    body,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [40, 40, 40] },
    margin: { left: 40, right: 40 },
    theme: "grid"
  });

  // --- Totales con IVA aplicado al TOTAL ---
  const finalY = doc.lastAutoTable.finalY + 20;
  const totalBruto = body.reduce((sum, row) => sum + parseFloat(row[4]), 0);
  const appliedDiscount = parseFloat(localStorage.getItem("descuento")) || 0;
  const descuentoMonto = (totalBruto * appliedDiscount) / 100;
  const totalTrasDescuento = totalBruto - descuentoMonto;
  const ivaMonto = totalTrasDescuento * 0.21;
  const totalConIVA = totalTrasDescuento + ivaMonto;

  doc.setFontSize(10);
  doc.text(`Subtotal: $${totalBruto.toFixed(2)}`, pageWidth - 40, finalY, { align: "right" });
  if (appliedDiscount > 0) {
    doc.text(
      `Descuento (${appliedDiscount}%): -$${descuentoMonto.toFixed(2)}`,
      pageWidth - 40,
      finalY + 14,
      { align: "right" }
    );
  }
  doc.text(
    `IVA 21%: $${ivaMonto.toFixed(2)}`,
    pageWidth - 40,
    finalY + 28,
    { align: "right" }
  );
  doc.setFontSize(12);
  doc.text(
    `Total: $${totalConIVA.toFixed(2)}`,
    pageWidth - 40,
    finalY + 46,
    { align: "right" }
  );

  // --- Aclaraciones ---
  const clarisY = finalY + 80;
  doc.setFontSize(9);
  doc.text("Aclaraciones:", 40, clarisY);
  doc.setFontSize(8);
  [
    "Validez del presupuesto: 20 días",
    "Formas de pago: Efectivo • MercadoPago • Transferencia",
    "Sin seguro en tránsito",
    "Responsable de reposición por daños o faltantes",
    "No incluye transporte ni guardia"
  ].forEach((line, i) => {
    doc.text(line, 60, clarisY + 12 + i * 12);
  });

  doc.save(`${cliente.apellido}-${numeroPresupuesto}.pdf`);
}
