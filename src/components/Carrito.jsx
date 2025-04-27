import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
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
  onCantidadChange,
  onEliminar,
  total,
  comentario,
  setComentario,
  onClearAll
}) => {
  const [discount, setDiscount] = useState('0');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    localStorage.setItem('descuento', JSON.stringify(appliedDiscount));
  }, [appliedDiscount]);

  const handleApplyDiscount = () => {
    if (discount === 'especial') {
      const pwd = prompt('Contraseña:');
      if (pwd !== 'veok') return alert('Contraseña incorrecta');
      const pct = parseFloat(prompt('Porcentaje (0–100):'));
      if (isNaN(pct) || pct < 0 || pct > 100) return alert('Inválido');
      return setAppliedDiscount(pct);
    }
    const pct = parseFloat(discount);
    if (isNaN(pct) || pct < 0 || pct > 100) return alert('Seleccione válido');
    setAppliedDiscount(pct);
  };

  const discountAmount = total * (appliedDiscount / 100);
  const finalTotal = total - discountAmount;

  // Mostrar último agregado primero
  const ordenados = productosSeleccionados
    .map((p, i) => ({ p, i }))
    .reverse();

  return (
    <Paper sx={{
      width: '100%',
      bgcolor: '#1e1e1e',
      color: '#fff',
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 2
    }}>
      {/* Título */}
      <Box>
        <Typography variant="h5" gutterBottom>Pedido</Typography>
      </Box>

      {/* Lista con scroll */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {ordenados.map(({ p: producto, i: idx }) => (
            <React.Fragment key={idx}>
              <ListItem sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#2c2c2c',
                borderRadius: 1,
                mb: 1,
                px: 1
              }}>
                {/* Texto truncado */}
                <ListItemText
                  primary={producto.nombre}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: {
                        xs: '0.8rem',
                        sm: '0.9rem',
                        md: '1rem'
                      }
                    }
                  }}
                  secondary={
                    <Typography variant="body2" color="gray" noWrap>
                      {producto.cantidad} × ${parseFloat(producto.precio || 0).toLocaleString()} ={' '}
                      <strong>
                        ${(parseFloat(producto.precio || 0) * (parseInt(producto.cantidad) || 0)).toLocaleString()}
                      </strong>
                    </Typography>
                  }
                  sx={{
                    flex: '1 1 auto',
                    minWidth: 0,
                    pr: 1
                  }}
                />

                {/* Controles */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => onDecrementar(idx)}><Remove fontSize="small" /></IconButton>
                  <TextField
                    value={producto.cantidad}
                    onChange={e => onCantidadChange(idx, e.target.value)}
                    size="small"
                    variant="filled"
                    inputProps={{
                      style: { textAlign: 'center', padding: '4px 0' }
                    }}
                    sx={{
                      width: '48px',
                      backgroundColor: '#2c2c2c',
                      borderRadius: 1,
                      '& .MuiFilledInput-root': {
                        background: '#2c2c2c'
                      }
                    }}
                  />
                  <IconButton size="small" onClick={() => onIncrementar(idx)}><Add fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onEliminar(idx)}><Delete fontSize="small" /></IconButton>
                </Box>
              </ListItem>
              <Divider sx={{ borderColor: '#333' }} />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Totales y botones, siempre al pie */}
      <Box sx={{ mt: 2 }}>
        <Box textAlign="right">
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Total: ${total.toLocaleString()}
          </Typography>
          {appliedDiscount > 0 && (
            <>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Descuento ({appliedDiscount}%): -${discountAmount.toLocaleString()}
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Total Final: ${finalTotal.toLocaleString()}
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <TextField
            select
            label="Descuento"
            size="small"
            value={discount}
            onChange={e => setDiscount(e.target.value)}
            sx={{ bgcolor: '#2c2c2c', borderRadius: 1, flex: 1, input: { color: 'white' } }}
          >
            <MenuItem value="0">Ninguno</MenuItem>
            <MenuItem value="10">10%</MenuItem>
            <MenuItem value="20">20%</MenuItem>
            <MenuItem value="25">25%</MenuItem>
            <MenuItem value="especial">Especial</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            onClick={handleApplyDiscount}
            sx={{ flex: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Aplicar descuento
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={onClearAll}
            sx={{ flex: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Borrar todo
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Carrito;
