// src/pages/SingleScreenView.jsx
import React, { useState } from 'react';
import { Box, Paper, CssBaseline, Typography, TextField } from '@mui/material';
import ProductosPOS from '../components/ProductosPOS';
import BottomNav from '../components/BottomNav';
import generarRemitoPDF, { generarNumeroRemito } from '../utils/generarRemito';

export default function SingleScreenView() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    atendidoPor: 'Matias',
    fechaRetiro: '',
    fechaDevolucion: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Función para generar el remito utilizando los datos del cliente (formData) y el carrito guardado en localStorage
  const handleGenerarRemito = () => {
    // Verificar que se hayan completado los datos del cliente
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      alert("Complete los datos del cliente antes de generar el remito.");
      return;
    }
    const cliente = formData;
    // Recuperar el carrito de localStorage
    const carritoStr = localStorage.getItem('carrito');
    if (!carritoStr) {
      alert("No hay productos en el pedido.");
      return;
    }
    const carrito = JSON.parse(carritoStr);
    if (!carrito.length) {
      alert("No hay productos en el pedido.");
      return;
    }
    const numeroRemito = generarNumeroRemito();
    const fecha = new Date().toLocaleDateString("es-AR");
    generarRemitoPDF(cliente, carrito, cliente.atendidoPor, numeroRemito, fecha);
  };

  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
      <CssBaseline />
      {/* Contenedor principal ajusta la altura para dejar espacio al navbar (80px) */}
      <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        
  
        {/* Panel derecho: Sección de Productos ocupa el resto del ancho */}
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: 'grey.900',
            p: 4,
            color: 'white'
          }}
        >
          <ProductosPOS />
        </Box>
      </Box>
  
      {/* Navbar fijo en la parte inferior con los botones de acción */}
      <BottomNav onGenerarRemito={handleGenerarRemito} />
    </Box>
  );
}
