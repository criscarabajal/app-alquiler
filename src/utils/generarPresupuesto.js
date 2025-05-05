// src/utils/generarPresupuesto.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Genera un número único para el presupuesto.
 */
export function generarNumeroPresupuesto() {
  const ahora = new Date();
  return `PRES-${ahora.getFullYear()}${String(ahora.getMonth()+1).padStart(2,"0")}${String(ahora.getDate()).padStart(2,"0")}-${ahora.getTime()}`;
}

/**
 * datosCliente: { nombre, apellido, dni, telefono, email }
 * items: [{ cantidad, descripcion, precioUnitario, subtotal }]
 * descuento: número (porcentaje, e.g. 20)
 * ivaPorc: número (porcentaje, e.g. 21)
 */
export default async function generarPresupuestoPDF(
  datosCliente,
  items,
  descuento,
  ivaPorc,
  numeroPresupuesto,
  fechaEmision
) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 40;
  let y = margin;

  // --- Encabezado con logo desde public/logo.png ---
  // Cargamos la imagen para luego convertirla a base64
  const img = new Image();
  img.src = "/logo.png";
  await new Promise(resolve => {
    img.onload = resolve;
    img.onerror = resolve;
  });
  // Dibujamos el logo (si cargó)
  if (img.width) {
    const logoWidth = 100;
    const logoHeight = (img.height / img.width) * logoWidth;
    doc.addImage(img, "PNG", margin, y, logoWidth, logoHeight);
  }

  // Datos de empresa a la derecha del logo
  doc.setFontSize(9);
  const infoX = margin + 120;
  doc.text("Seguí Rodando", infoX, y + 12);
  doc.text("Tel: (011) 1234-5678", infoX, y + 24);
  doc.text("CUIT: 30-12345678-9", infoX, y + 36);
  doc.text("Cond. frente al IVA: Responsable Inscripto", infoX, y + 48);

  // Número de presupuesto alineado a la derecha
  doc.setFontSize(12);
  doc.text(
    `PRESUPUESTO: ${numeroPresupuesto}`,
    doc.internal.pageSize.getWidth() - margin,
    y + 24,
    { align: "right" }
  );
  y += 80;

  // --- Datos del cliente ---
  doc.setFontSize(10);
  doc.text(`Cliente: ${datosCliente.nombre} ${datosCliente.apellido}`, margin, y);
  doc.text(`DNI/CUIT: ${datosCliente.dni}`, margin, y + 14);
  doc.text(`Tel: ${datosCliente.telefono}`, margin + 250, y + 14);
  doc.text(`Email: ${datosCliente.email}`, margin + 400, y + 14);
  doc.text(`Fecha: ${fechaEmision}`, margin, y + 28);
  y += 50;

  // --- Tabla de ítems ---
  autoTable(doc, {
    startY: y,
    head: [["Cant.", "Descripción", "P.Unitario", "Subtotal"]],
    body: items.map(i => [
      String(i.cantidad),
      i.descripcion,
      `$${i.precioUnitario.toFixed(2)}`,
      `$${i.subtotal.toFixed(2)}`
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [200, 200, 200] },
    margin: { left: margin, right: margin }
  });

  const finalY = doc.lastAutoTable.finalY + 20;

  // --- Totales, descuento e IVA desglosado ---
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const montoDesc = subtotal * (descuento / 100);
  const montoSinIVA = subtotal - montoDesc;
  const montoIVA = montoSinIVA * (ivaPorc / 100);
  const totalConIVA = montoSinIVA + montoIVA;

  doc.setFontSize(10);
  const tx = doc.internal.pageSize.getWidth() - margin - 150;
  doc.text(`Subtotal:`, tx, finalY);
  doc.text(`$${subtotal.toFixed(2)}`, tx + 100, finalY, { align: "right" });

  doc.text(`Descuento (${descuento}%):`, tx, finalY + 14);
  doc.text(`-$${montoDesc.toFixed(2)}`, tx + 100, finalY + 14, { align: "right" });

  doc.text(`Total sin IVA:`, tx, finalY + 28);
  doc.text(`$${montoSinIVA.toFixed(2)}`, tx + 100, finalY + 28, { align: "right" });

  doc.text(`IVA (${ivaPorc}%):`, tx, finalY + 42);
  doc.text(`$${montoIVA.toFixed(2)}`, tx + 100, finalY + 42, { align: "right" });

  doc.setFontSize(12);
  doc.text(`TOTAL CON IVA:`, tx, finalY + 66, { fontStyle: "bold" });
  doc.text(`$${totalConIVA.toFixed(2)}`, tx + 100, finalY + 66, {
    align: "right",
    fontStyle: "bold"
  });

  // --- Aclaraciones adicionales al pie ---
  const aclarY = finalY + 100;
  doc.setFontSize(8);
  const aclaraciones = [
    "Validez de la oferta: 20 días corridos desde la fecha de emisión.",
    "Formas de pago: 50% al aceptar el presupuesto, 50% a la devolución del equipo.",
    "El seguro y transporte no están incluidos en los valores aquí cotizados.",
    "Reposición de equipo en caso de daño o pérdida por cuenta del cliente.",
    "Excluye: traslados, guardias, consumibles y seguros especiales."
  ];
  aclaraciones.forEach((line, i) => {
    doc.text(line, margin, aclarY + i * 12);
  });

  doc.save(`Presupuesto_${numeroPresupuesto}.pdf`);
}
