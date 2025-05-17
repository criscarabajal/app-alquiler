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
  const fechaClave = `${dd}${mm}${yy}`;               // e.g. "140525"
  const storageKey = `presupCounter_${fechaClave}`;

  // Obtener el contador actual (o iniciar en 0)
  let contador = parseInt(localStorage.getItem(storageKey) || '0', 10);
  contador = Math.min(contador + 1, 1000);            // incrementa hasta 1000
  localStorage.setItem(storageKey, String(contador));

  return `${fechaClave}-${contador}`;                 // e.g. "140525-1"
}


export default function generarPresupuestoPDF(
  cliente,
  productosSeleccionados,
  atendidoPor,
  numeroPresupuesto,
  fechaEmision
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Encabezado ---
  // Logo en la esquina superior izquierda
  const logoWidth = 100;
  const logoHeight = 40;
  doc.addImage(logoImg, "PNG", 40, 40, logoWidth, logoHeight);

  // Título y número / fecha alineados a la derecha
  doc.setFontSize(18);
  doc.text("PRESUPUESTO", pageWidth - 40, 50, { align: "right" });
  doc.setFontSize(10);
  doc.text(`N°: ${numeroPresupuesto}`, pageWidth - 40, 68, { align: "right" });
  doc.text(`Fecha: ${fechaEmision}`, pageWidth - 40, 82, { align: "right" });

  // Línea separadora
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

  // --- Tabla de Productos ---
  const tableColumnHeaders = [
    "Descripción",
    "Cant.",
    "P.U.",
    "Subtotal"
  ];
  const tableBody = productosSeleccionados.map((item) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const price = parseFloat(item.precio) || 0;
    return [
      item.nombre,
      qty,
      price.toFixed(2),
      (qty * price).toFixed(2)
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [tableColumnHeaders],
    body: tableBody,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [40, 40, 40] },
    margin: { left: 40, right: 40 },
    theme: "grid"
  });

  // --- Cálculos de totales ---
  const finalY = doc.lastAutoTable.finalY + 20;
  const totalBruto = productosSeleccionados.reduce(
    (sum, item) =>
      sum + (parseInt(item.cantidad, 10) || 0) * (parseFloat(item.precio) || 0),
    0
  );

  // Lee descuento aplicado de localStorage (0 si no existe)
  const appliedDiscount =
    parseFloat(localStorage.getItem("descuento")) || 0;
  const descuentoMonto = (totalBruto * appliedDiscount) / 100;
  const totalConDescuento = totalBruto - descuentoMonto;
  const totalSinIVA = totalConDescuento / 1.21;
  const ivaMonto = totalConDescuento - totalSinIVA;

  doc.setFontSize(10);
  doc.text(
    `Subtotal: $${totalBruto.toFixed(2)}`,
    pageWidth - 40,
    finalY,
    { align: "right" }
  );
  if (appliedDiscount > 0) {
    doc.text(
      `Descuento (${appliedDiscount}%): -$${descuentoMonto.toFixed(2)}`,
      pageWidth - 40,
      finalY + 14,
      { align: "right" }
    );
  }
  doc.text(
    `Total sin IVA: $${totalSinIVA.toFixed(2)}`,
    pageWidth - 40,
    finalY + 28,
    { align: "right" }
  );
  doc.text(
    `IVA 21%: $${ivaMonto.toFixed(2)}`,
    pageWidth - 40,
    finalY + 42,
    { align: "right" }
  );
  doc.setFontSize(12);
  doc.text(
    `Total con IVA: $${totalConDescuento.toFixed(2)}`,
    pageWidth - 40,
    finalY + 60,
    { align: "right" }
  );

  // --- Aclaraciones adicionales ---
  const clarisY = finalY + 90;
  doc.setFontSize(9);
  doc.text("Aclaraciones:", 40, clarisY);
  doc.setFontSize(8);
  const aclaraciones = [
    "Validez del presupuesto: 20 dias",
    "Forma de pago: * Efectivo   * Mercadopago   * Transferencia bancaria",
    "Seguro: Los equipos NO cuentan con seguro en tránsito",
    "Reposición: En caso de Faltantes y/o daños en los equipos, el cliente es RESPONSABLE 100% de la REPOSICIÓN",
    "Este presupuesto NO INCLUYE   SEGUROS / TRANSPORTE / GUARDIA"
  ];
  aclaraciones.forEach((line, i) => {
    doc.text(line, 60, clarisY + 14 + i * 12);
  });

  // Guarda el PDF

doc.save(`${cliente.apellido}-${numeroPresupuesto}.pdf`);

}
