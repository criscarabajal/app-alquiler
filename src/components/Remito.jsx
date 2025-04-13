import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect } from "react";

export default function Remito() {
  const location = useLocation();
  const navigate = useNavigate();

  const productos = location.state?.productos || [];
  const cliente = location.state?.cliente || {};

  useEffect(() => {
    if (!productos.length || !cliente.nombre) {
      // Si alguien entra directo al remito sin datos, redirigir
      navigate("/");
    }
  }, [productos, cliente, navigate]);

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Remito de Alquiler - Seguí Rodando", 14, 20);

    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente.nombre} ${cliente.apellido}`, 14, 30);
    doc.text(`DNI: ${cliente.dni}`, 14, 36);
    doc.text(`Atendido por: ${cliente.atendidoPor}`, 14, 42);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 48);

    autoTable(doc, {
      startY: 55,
      head: [["Producto", "Categoría", "Subcategoría", "Incluye", "Cantidad"]],
      body: productos.map((p) => [
        p.nombre,
        p.categoria,
        p.subcategoria || "-",
        p.incluye || "-",
        p.cantidad,
      ]),
      styles: {
        fontSize: 10,
      },
    });

    doc.save(`remito-${cliente.apellido}-${Date.now()}.pdf`);
  };

  return (
    <div style={{ padding: "2rem", background: "#121212", minHeight: "100vh", color: "#fff" }}>
      <h2>Remito de alquiler</h2>

      <div style={{ marginBottom: "1rem" }}>
        <p><strong>Cliente:</strong> {cliente.nombre} {cliente.apellido}</p>
        <p><strong>DNI:</strong> {cliente.dni}</p>
        <p><strong>Atendido por:</strong> {cliente.atendidoPor}</p>
        <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
      </div>

      <h3>Productos:</h3>
      {productos.map((p, i) => (
        <div key={i} style={{ marginBottom: "1rem", borderBottom: "1px solid #444", paddingBottom: "0.5rem" }}>
          <strong>{p.nombre}</strong> ({p.categoria} - {p.subcategoria || "-"})<br />
          Incluye: {p.incluye || "-"}<br />
          Cantidad: {p.cantidad}
        </div>
      ))}

      <div style={{ marginTop: "2rem" }}>
        <button onClick={generarPDF} style={{ marginRight: "1rem" }}>
          Descargar remito en PDF
        </button>
        <button onClick={() => navigate("/")}>Volver al inicio</button>
      </div>
    </div>
  );
}
