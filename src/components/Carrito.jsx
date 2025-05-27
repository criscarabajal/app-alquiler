// src/components/Carrito.jsx
import React, { useEffect, useState } from 'react';
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
  jornadasMap,
  setJornadasMap,
  comentario,
  setComentario,
  onClearAll
}) {
  const [discount, setDiscount] = useState('0');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [openIncludes, setOpenIncludes] = useState(false);
  const [serialMap, setSerialMap] = useState({}); // <-- nuevo estado para seriales

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

  const handleAccept = () => {
    setOpenIncludes(false);
  };

  // Recalcula total teniendo en cuenta unidades * precio * jornadas
  const totalConJornadas = productosSeleccionados.reduce((sum, item, idx) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const j = parseInt(jornadasMap[idx], 10) || 1;
    const price = parseFloat(item.precio) || 0;
    return sum + qty * price * j;
  }, 0);

  const discountAmount = totalConJornadas * (appliedDiscount / 100);
  const finalTotal = totalConJornadas - discountAmount;
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
                  whiteSpace: 'nowrap',
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
          Subtotal: ${totalConJornadas.toLocaleString()}
        </Typography>
        {appliedDiscount > 0 && (
          <>
            <Typography sx={{ fontSize: '0.75rem' }}>
              Descuento ({appliedDiscount}%): -${discountAmount.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
              Total: ${finalTotal.toLocaleString()}
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

      <Dialog
        open={openIncludes}
        onClose={() => setOpenIncludes(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '80vw',
            height: '80vh'
          }
        }}
      >
        <DialogTitle>Detalles de productos</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto' }}>
          {productosSeleccionados.length > 0 ? (
            productosSeleccionados.map((item, idx) => {
              const j = jornadasMap[idx] || 1;
              return (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    p: 1,
                    border: '1px solid #444',
                    borderRadius: 1,
                    bgcolor: '#2a2a2a'
                  }}
                >
                  {/* Información del producto */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {item.nombre}
                    </Typography>
                    <Typography variant="body2">
                      {item.incluye || 'No hay información disponible.'}
                    </Typography>
                  </Box>

                  {/* Desplegable de Serial */}
                  <Box sx={{ mx: 2 }}>
                    <TextField
                      select
                      label="Serial"
                      size="small"
                      value={serialMap[idx] || ''}
                      onChange={(e) =>
                        setSerialMap(prev => ({ ...prev, [idx]: e.target.value }))
                      }
                      sx={{
                        minWidth: 120,
                        bgcolor: '#1e1e1e',
                        borderRadius: 1,
                        '& .MuiInputBase-input': { color: '#fff' }
                      }}
                    >
                      {item.serial ? (
                        <MenuItem value={item.serial}>{item.serial}</MenuItem>
                      ) : (
                        <MenuItem value="" disabled>
                          No hay serial disponible
                        </MenuItem>
                      )}
                    </TextField>
                  </Box>

                  {/* Jornadas y subtotal */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#ccc' }}>Jornadas</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px dashed #777',
                        borderRadius: 1,
                        p: '2px 4px',
                        bgcolor: '#1e1e1e'
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          setJornadasMap(prev => ({
                            ...prev,
                            [idx]: Math.max(1, (prev[idx] || 1) - 1)
                          }))
                        }
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 0.5, fontSize: '0.875rem' }}>{j}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setJornadasMap(prev => ({ ...prev, [idx]: (prev[idx] || 1) + 1 }))
                        }
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#ccc' }}>Subtotal</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      ${(item.precio * item.cantidad * j).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography>No hay productos seleccionados.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="success" onClick={handleAccept}>
            Aceptar
          </Button>
          <Button onClick={() => setOpenIncludes(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
