import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Divider,
  Paper,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, Remove, Delete, MoreVert } from '@mui/icons-material';

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
  const [discount, setDiscount] = useState('0');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [openIncludes, setOpenIncludes] = useState(false);

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
  const totalWithIva = finalTotal * 1.21;

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
        fontSize: '0.875rem'
      }}
    >
      {/* Header con título y botón ... */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
          Pedido
        </Typography>
        <IconButton size="small" onClick={() => setOpenIncludes(true)}>
          <MoreVert sx={{ color: '#fff' }} />
        </IconButton>
      </Box>

      <List sx={{ flex: 1, overflowY: 'auto' }}>
        {ordenados.map(({ p: item, i: idx }) => (
          <React.Fragment key={idx}>
            <ListItem
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#2c2c2c',
                borderRadius: 1,
                mb: 1,
                py: 1,
                px: 1
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.825rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'wrap',
                  flexGrow: 1
                }}
              >
                {item.nombre}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.1, ml: 1 }}>
                <IconButton size="small" onClick={() => onDecrementar(idx)}>
                  <Remove sx={{ fontSize: '1rem' }} />
                </IconButton>
                <TextField
                  value={item.cantidad}
                  onChange={(e) => onCantidadChange(idx, e.target.value)}
                  size="small"
                  inputProps={{
                    style: {
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      padding: '1px 1px',
                      width: '28px'
                    }
                  }}
                  sx={{
                    minWidth: 32,
                    maxWidth: 40,
                    bgcolor: '#2c2c2c',
                    borderRadius: 1,
                    '& .MuiInputBase-input': { padding: '2px 4px !important' }
                  }}
                />
                <IconButton size="small" onClick={() => onIncrementar(idx)}>
                  <Add sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Box>

              <IconButton size="small" color="error" onClick={() => onEliminar(idx)}>
                <Delete sx={{ fontSize: '1rem' }} />
              </IconButton>
            </ListItem>

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
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold', mt: 1 }}>
          Total + IVA (21%): ${totalWithIva.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Typography>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          select
          label="Descuento"
          size="small"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          sx={{ bgcolor: '#2c2c2c', borderRadius: 1, '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
        >
          <MenuItem value="0">Ninguno</MenuItem>
          <MenuItem value="10">10%</MenuItem>
          <MenuItem value="20">20%</MenuItem>
          <MenuItem value="25">25%</MenuItem>
          <MenuItem value="especial">Especial</MenuItem>
        </TextField>
        <Button fullWidth variant="contained" size="small" onClick={handleApplyDiscount} sx={{ fontSize: '0.875rem' }}>
          Aplicar descuento
        </Button>
        <Button fullWidth variant="outlined" color="error" size="small" onClick={onClearAll} sx={{ fontSize: '0.875rem' }}>
          Borrar todo
        </Button>
      </Box>

      {/* Dialog para mostrar "Incluye" */}
      <Dialog open={openIncludes} onClose={() => setOpenIncludes(false)} fullWidth maxWidth="sm">
        <DialogTitle>Incluye</DialogTitle>
        <DialogContent dividers>
          {productosSeleccionados.length > 0 ? (
            productosSeleccionados.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {item.nombre}
                </Typography>
                <Typography variant="body2">
                  {item.incluye || 'No hay información disponible.'}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No hay productos seleccionados.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIncludes(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
