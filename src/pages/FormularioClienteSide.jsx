// src/pages/FormularioClienteSide.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography } from '@mui/material';
import ResponsiveLayout from '../components/ResponsiveLayout';
import { fetchClientes, addClient } from '../utils/fetchClientes';

export default function FormularioClienteSide() {
  const navigate = useNavigate();
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

  // Cuando se pierde el foco del campo DNI, se consulta si el cliente existe
  const handleBlurDni = async () => {
    if (formData.dni.trim() !== "") {
      const clientes = await fetchClientes();
      const clienteEncontrado = clientes.find(c => c.dni === formData.dni.trim());
      if (clienteEncontrado) {
        if (window.confirm("Se encontró un cliente con este DNI. ¿Desea cargar sus datos?")) {
          setFormData(clienteEncontrado);
        }
      }
    }
  };

  // Al enviar el formulario, si no existe el cliente, se llama a addClient
  const handleNext = async () => {
    const { nombre, apellido, dni, atendidoPor, fechaRetiro, fechaDevolucion } = formData;
    if (!nombre || !apellido || !dni || !atendidoPor || !fechaRetiro || !fechaDevolucion) {
      alert("Por favor, complete todos los campos.");
      return;
    }
    const clientes = await fetchClientes();
    const clienteEncontrado = clientes.find(c => c.dni === dni.trim());
    if (!clienteEncontrado) {
      const result = await addClient(formData);
      if (result && result.success) {
        alert("Cliente agregado exitosamente.");
      } else {
        alert("No se pudo agregar el cliente.");
      }
    }
    localStorage.setItem("cliente", JSON.stringify(formData));
    navigate('/productos', { state: formData });
  };

  return (
    <ResponsiveLayout imageUrl="https://source.unsplash.com/random/?photography">
      <Typography component="h1" variant="h4" gutterBottom>
        Datos del Cliente
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        label="Nombre"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Apellido"
        name="apellido"
        value={formData.apellido}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="DNI"
        name="dni"
        value={formData.dni}
        onChange={handleChange}
        onBlur={handleBlurDni}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Atendido por"
        name="atendidoPor"
        select
        SelectProps={{ native: true }}
        value={formData.atendidoPor}
        onChange={handleChange}
      >
        <option value="Matias">Matias</option>
        <option value="Jhona">Jhona</option>
      </TextField>
      <TextField
        margin="normal"
        required
        fullWidth
        label="Fecha de Retiro"
        name="fechaRetiro"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        value={formData.fechaRetiro}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Fecha de Devolución"
        name="fechaDevolucion"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        value={formData.fechaDevolucion}
        onChange={handleChange}
      />
      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 2, fontSize: '1.1rem' }}
        onClick={handleNext}
      >
        Siguiente
      </Button>
    </ResponsiveLayout>
  );
}
