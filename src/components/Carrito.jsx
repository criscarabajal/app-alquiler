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
  onCantidadChange,    // <-- nuevo prop
  total,
  comentario,
  setComentario,
  onClearAll
}) => {
  const [discount, setDiscount] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    localStorage.setItem('descuento', JSON.stringify(appliedDiscount));
  }, [appliedDiscount]);

  const handleApplyDiscount = () => {
    if (discount === 'especial') {
      const pwd = window.prompt('Ingrese la contraseña:');
      if (pwd !== 'veok') { alert('Contraseña incorrecta.'); return; }
      const custom = window.prompt('Ingrese porcentaje (0-100):');
      const pct = parseFloat(custom);
      if (isNaN(pct) || pct < 0 || pct > 100) { alert('Descuento inválido.'); return; }
      setAppliedDiscount(pct);
    } else {
      const pct = parseFloat(discount);
      if (isNaN(pct) || pct < 0 || pct > 100) { alert('Seleccione un descuento válido.'); return; }
      setAppliedDiscount(pct);
    }
  };

  const discountAmount = total * (appliedDiscount / 100);
  const finalTotal = total - discountAmount;

  // Mostramos el último agregado primero
  const ordenados = productosSeleccionados
    .map((producto, index) => ({ producto, index }))
    .reverse();

  return (
    <Paper sx={{ width: '100%', maxWidth: 800, bgcolor: '#1e1e1e', color: '#fff', p: 2, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <Box>
        <Typography variant="h5" gutterBottom>Pedido</Typography>
        <List sx={{ overflowY: 'auto', maxHeight: 600 }}>
          {ordenados.map(({ producto, index: origIndex }) => (
            <React.Fragment key={origIndex}>
              <ListItem sx={{ bgcolor: '#2c2c2c', borderRadius: 1, mb: 1 }}>
                <ListItemText
                  primary={producto.nombre}
                  secondary={`${producto.cantidad} x $${parseFloat(producto.precio || 0).toLocaleString()} = $${(parseFloat(producto.precio || 0)*producto.cantidad).toLocaleString()}`}
                />
                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton color="inherit" onClick={() => onDecrementar(origIndex)}><Remove /></IconButton>
                  {/* Campo editable */}
                  <TextField
                    type="number"
                    size="small"
                    value={producto.cantidad}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10);
                      onCantidadChange(origIndex, isNaN(v) || v < 1 ? 1 : v);
                    }}
                    inputProps={{ min: 1, style: { textAlign: 'center', width: '2.5rem' } }}
                  />
                  <IconButton color="inherit" onClick={() => onIncrementar(origIndex)}><Add /></IconButton>
                  <IconButton color="error" onClick={() => onEliminar(origIndex)}><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider sx={{ borderColor: '#333' }} />
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Box mt={2}>
        <Typography variant="h6">Total: ${total.toLocaleString()}</Typography>
        {appliedDiscount > 0 && (
          <>
            <Typography>Descuento ({appliedDiscount}%): -${discountAmount.toLocaleString()}</Typography>
            <Typography variant="h6">Total Final: ${finalTotal.toLocaleString()}</Typography>
          </>
        )}
      </Box>

      <Box sx={{ mt:2, display:'flex', gap:1 }}>
        <TextField
          select
          label="Descuento"
          size="small"
          value={discount}
          onChange={e => setDiscount(e.target.value)}
          sx={{ flex:1, bgcolor:'#2c2c2c', borderRadius:1 }}
        >
          <MenuItem value="0">Ninguno</MenuItem>
          <MenuItem value="10">Efectivo (10%)</MenuItem>
          <MenuItem value="20">Estudiantes (20%)</MenuItem>
          <MenuItem value="25">Rentals (25%)</MenuItem>
          <MenuItem value="especial">Especial</MenuItem>
        </TextField>
        <Button variant="outlined" onClick={handleApplyDiscount} sx={{ flex:1 }}>Aplicar descuento</Button>
        <Button variant="outlined" color="error" onClick={onClearAll} sx={{ flex:1 }}>Borrar todo</Button>
      </Box>
    </Paper>
);

};

export default Carrito;
