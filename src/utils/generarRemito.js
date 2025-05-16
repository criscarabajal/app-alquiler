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
  const margin = 40;
  let y = margin;

  // --- Logo ---
  const imgProps = doc.getImageProperties(logoImg);
  const logoWidth = 100;
  const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
  doc.addImage(logoImg, "PNG", margin, y, logoWidth, logoHeight);

  // --- Título ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Remito de Pedido", margin + logoWidth + 20, y + 20);

  // --- Número Remito y Fecha ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nº: ${numeroRemito}`, 500, y + 20, { align: "right" });
  doc.text(`Fecha emisión: ${new Date().toLocaleDateString("es-AR")}`, 500, y + 36, { align: "right" });

  y += Math.max(logoHeight, 50) + 20;

  // --- Datos Cliente ---
  doc.setFont("helvetica", "normal");
  doc.text(`Cliente: ${cliente.nombre} ${cliente.apellido}`, margin, y);
  doc.text(`DNI: ${cliente.dni}`, margin, y + 14);
  doc.text(`Atendido por: ${atendidoPor}`, margin, y + 28);

  y += 50;

  // --- Cronograma del pedido ---
  doc.setFont("helvetica", "bold");
 
  doc.rect(margin, y - -10, 500, 100, "F");
  doc.text("Cronograma del pedido", margin + 8, y + 5);

  autoTable(doc, {
    startY: y + 10,
    theme: "grid",
    head: [["Concepto", "Fecha y Hora"]],
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
    body: [
      ["Retiro", formatearFechaHora(new Date(cliente.fechaRetiro))],
      ["Devolución", formatearFechaHora(new Date(cliente.fechaDevolucion))]
    ],
    styles: { fontSize: 7 },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 0;

  // --- Detalle de Productos ---
  autoTable(doc, {
    startY: y,
    theme: "grid",
    head: [["Producto", "Serial", "Cantidad"]],
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0] },
    body: productosSeleccionados.map(p => [
      p.nombre,
      p.serial || "-",
      p.cantidad
    ]),
    styles: { fontSize: 7 },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 80;

  // --- Firma ---
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 150, y);
  doc.text("Firma del cliente", margin, y + 14);

  // --- Guardar ---
  doc.save(`Remito_${cliente.apellido}_${numeroRemito}.pdf`);
}
