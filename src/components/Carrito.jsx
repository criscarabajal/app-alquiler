// src/components/Carrito.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Button,
  MenuItem
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';

const Carrito = ({
  productosSeleccionados,
  onIncrementar,
  onDecrementar,
  onEliminar,
  total,
  comentario,
  setComentario
}) => {
  // Estado para el valor actual del select y el descuento aplicado
  const [discount, setDiscount] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Guardar el descuento en localStorage para que el remito lo lea
  useEffect(() => {
    localStorage.setItem('descuento', JSON.stringify(appliedDiscount));
  }, [appliedDiscount]);

  const handleApplyDiscount = () => {
    // Si se selecciona "especial", se solicita contraseña y luego un descuento personalizado
    if (discount === "especial") {
      const password = window.prompt("Ingrese la contraseña:");
      if (password !== "veok") {
        alert("Contraseña incorrecta.");
        return;
      }
      const customDiscount = window.prompt("Ingrese el porcentaje de descuento personalizado (0-100):");
      const parsedCustom = parseFloat(customDiscount);
      if (isNaN(parsedCustom) || parsedCustom < 0 || parsedCustom > 100) {
        alert("Valor de descuento inválido.");
        return;
      }
      setAppliedDiscount(parsedCustom);
    } else {
      const parsed = parseFloat(discount);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert("Seleccione una opción de descuento válida");
        return;
      }
      setAppliedDiscount(parsed);
    }
  };

  const discountAmount = total * (appliedDiscount / 100);
  const finalTotal = total - discountAmount;

  return (
    <Paper
      sx={{
        width: '100%',
        maxWidth: 800,
        bgcolor: '#1e1e1e',
        color: '#fff',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2
      }}
    >
      <Box>
        <Typography variant="h5" gutterBottom>
          Pedido
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Escribí un comentario..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          sx={{
            bgcolor: '#2c2c2c',
            borderRadius: 1,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: '#444' },
            },
          }}
        />

        <List sx={{ overflowY: 'auto', maxHeight: 400 }}>
          {productosSeleccionados.map((producto, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ bgcolor: '#2c2c2c', borderRadius: 1, mb: 1 }}>
                <ListItemText
                  primary={producto.nombre}
                  secondary={
                    <Typography variant="body2" color="gray">
                      {producto.cantidad} x ${parseFloat(producto.precio || 0).toLocaleString()} ={' '}
                      <strong>${(parseFloat(producto.precio || 0) * producto.cantidad).toLocaleString()}</strong>
                    </Typography>
                  }
                />
                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton color="inherit" onClick={() => onDecrementar(index)}>
                    <Remove />
                  </IconButton>
                  <Typography>{producto.cantidad}</Typography>
                  <IconButton color="inherit" onClick={() => onIncrementar(index)}>
                    <Add />
                  </IconButton>
                  <IconButton color="error" onClick={() => onEliminar(index)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider sx={{ borderColor: '#333' }} />
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Box mt={2}>
        <Typography variant="h6" fontWeight="bold">
          Total: ${total.toLocaleString()}
        </Typography>
        {appliedDiscount > 0 && (
          <>
            <Typography variant="body1">
              Descuento aplicado ({appliedDiscount}%): -${discountAmount.toLocaleString()}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              Total Final: ${finalTotal.toLocaleString()}
            </Typography>
          </>
        )}
      </Box>

      {/* Contenedor con el select y el botón, ambos con el mismo ancho */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <TextField
          select
          label="Descuento"
          size="small"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          sx={{ bgcolor: '#2c2c2c', borderRadius: 1, flex: 1 }}
        >
          <MenuItem value="10">Efectivo (10%)</MenuItem>
          <MenuItem value="20">Estudiantes (20%)</MenuItem>
          <MenuItem value="25">Rentals (25%)</MenuItem>
          <MenuItem value="especial">Especial</MenuItem>

        </TextField>
        <Button variant="outlined" onClick={handleApplyDiscount} sx={{ flex: 1 }}>
          Aplicar descuento
        </Button>
      </Box>
    </Paper>
  );
};

export default Carrito;
