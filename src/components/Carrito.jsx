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
  Divider,
  Paper,
  Button,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';

export default function Carrito({
  productosSeleccionados,
  onIncrementar,
  onDecrementar,
  onCantidadChange,
  onEliminar,
  total,
  comentario,
  setComentario,
  onClearAll
}) {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Paper
      sx={{
        width: '100%',
        bgcolor: '#1e1e1e',
        color: '#fff',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        // Reducir fuente general un poco
        fontSize: '0.875rem'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
        Pedido
      </Typography>

      <List sx={{ flex: 1, overflowY: 'auto' }}>
        {ordenados.map(({ p: item, i: idx }) => (
          <React.Fragment key={idx}>
            <ListItem
              sx={{
                bgcolor: '#2c2c2c',
                borderRadius: 1,
                mb: 1,
                alignItems: 'flex-start',
                py: 1
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal'
                    }}
                  >
                    {item.nombre}
                  </Typography>
                }
              />
            </ListItem>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                mb: 1
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" onClick={() => onDecrementar(idx)}>
                  <Remove fontSize="small" />
                </IconButton>
                <TextField
                  value={item.cantidad}
                  onChange={(e) => onCantidadChange(idx, e.target.value)}
                  size="small"
                  inputProps={{
                    style: { textAlign: 'center', fontSize: '0.875rem', padding: '4px' }
                  }}
                  sx={{
                    width: 48,
                    bgcolor: '#2c2c2c',
                    borderRadius: 1
                  }}
                />
                <IconButton size="small" onClick={() => onIncrementar(idx)}>
                  <Add fontSize="small" />
                </IconButton>
              </Box>
              <IconButton size="small" color="error" onClick={() => onEliminar(idx)}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>

            <Divider sx={{ borderColor: '#333', mb: 1 }} />
          </React.Fragment>
        ))}
      </List>

      <Box mt={1} textAlign="right">
        <Typography sx={{ fontSize: '0.875rem' }}>
          Total: ${total.toLocaleString()}
        </Typography>
        {appliedDiscount > 0 && (
          <>
            <Typography sx={{ fontSize: '0.75rem' }}>
              Descuento ({appliedDiscount}%): -${discountAmount.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
              Total Final: ${finalTotal.toLocaleString()}
            </Typography>
          </>
        )}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          select
          label="Descuento"
          size="small"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          sx={{
            bgcolor: '#2c2c2c',
            borderRadius: 1,
            '& .MuiInputBase-input': { fontSize: '0.875rem' }
          }}
        >
          <MenuItem value="0">Ninguno</MenuItem>
          <MenuItem value="10">10%</MenuItem>
          <MenuItem value="20">20%</MenuItem>
          <MenuItem value="25">25%</MenuItem>
          <MenuItem value="especial">Especial</MenuItem>
        </TextField>
        <Button
          fullWidth
          variant="contained"
          size="small"
          onClick={handleApplyDiscount}
          sx={{ fontSize: '0.875rem' }}
        >
          Aplicar descuento
        </Button>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          size="small"
          onClick={onClearAll}
          sx={{ fontSize: '0.875rem' }}
        >
          Borrar todo
        </Button>
      </Box>
    </Paper>
  );
}
