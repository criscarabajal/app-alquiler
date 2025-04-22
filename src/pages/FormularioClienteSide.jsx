// src/pages/FormularioClienteSide.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography } from '@mui/material';
import SingleColorLayout from "../components/SingleColorLayout";

export default function FormularioClienteSide() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    correo: '',
    atendidoPor: 'Matias',
    fechaRetiro: '',
    fechaDevolucion: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    const { nombre, apellido, dni, telefono, correo, atendidoPor, fechaRetiro, fechaDevolucion } = formData;
    if (!nombre || !apellido || !dni || !telefono || !correo || !atendidoPor || !fechaRetiro || !fechaDevolucion) {
      alert("Por favor, complete todos los campos.");
      return;
    }
    localStorage.setItem("cliente", JSON.stringify(formData));
    navigate('/productos', { state: formData });
  };

  return (
    <SingleColorLayout imageUrl="https://source.unsplash.com/random/?photography">
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
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Teléfono"
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Correo Electrónico"
        name="correo"
        type="email"
        value={formData.correo}
        onChange={handleChange}
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
    </SingleColorLayout>
  );
}
