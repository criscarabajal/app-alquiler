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
      if (isNaN(pct) || pct<0 || pct>100) return alert('Inválido');
      return setAppliedDiscount(pct);
    }
    const pct = parseFloat(discount);
    if (isNaN(pct) || pct<0 || pct>100) return alert('Seleccione válido');
    setAppliedDiscount(pct);
  };

  const discountAmount = total * (appliedDiscount/100);
  const finalTotal = total - discountAmount;

  // Mostrar último agregado primero
  const ordenados = productosSeleccionados
    .map((p,i)=>({ p, i }))
    .reverse();

  return (
    <Paper sx={{
      width:'100%', bgcolor:'#1e1e1e', color:'#fff',
      p:2, height:'100%', display:'flex', flexDirection:'column', borderRadius:2
    }}>
      <Box>
        <Typography variant="h5" gutterBottom>Pedido</Typography>
        <List sx={{ overflowY:'auto', maxHeight:800 }}>
          {ordenados.map(({p:iProd, i:idx})=>(
            <React.Fragment key={idx}>
              <ListItem sx={{ bgcolor:'#2c2c2c', borderRadius:1, mb:1 }}>
                <ListItemText
                  primary={iProd.nombre}
                  secondary={
                    <Typography variant="body2" color="gray">
                      {iProd.cantidad} × ${parseFloat(iProd.precio||0).toLocaleString()} ={' '}
                      <strong>
                        ${(parseFloat(iProd.precio||0)* (parseInt(iProd.cantidad)||0)).toLocaleString()}
                      </strong>
                    </Typography>
                  }
                />
                <ListItemSecondaryAction sx={{ display:'flex', alignItems:'center', gap:1 }}>
                  <IconButton onClick={()=>onDecrementar(idx)}><Remove /></IconButton>
                  <TextField
                    value={iProd.cantidad}
                    onChange={e=>onCantidadChange(idx,e.target.value)}
                    size="small"
                    sx={{
                      width:'56px',
                      backgroundColor:'#2c2c2c',
                      borderRadius:1,
                      input:{ color:'white', textAlign:'center' }
                    }}
                  />
                  <IconButton onClick={()=>onIncrementar(idx)}><Add /></IconButton>
                  <IconButton color="error" onClick={()=>onEliminar(idx)}><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider sx={{ borderColor:'#333' }}/>
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Box mt={2} textAlign="right">
        <Typography variant="h6" fontWeight="bold">
          Total: ${total.toLocaleString()}
        </Typography>
        {appliedDiscount>0 && (
          <>
            <Typography>Descuento ({appliedDiscount}%): -${discountAmount.toLocaleString()}</Typography>
            <Typography variant="h6" fontWeight="bold">
              Total Final: ${finalTotal.toLocaleString()}
            </Typography>
          </>
        )}
      </Box>

      <Box sx={{ mt:2, display:'flex', gap:1 }}>
        <TextField
          select
          label="Descuento"
          size="small"
          value={discount}
          onChange={e=>setDiscount(e.target.value)}
          sx={{ bgcolor:'#2c2c2c', borderRadius:1, flex:1 }}
        >
          <MenuItem value="0">Ninguno</MenuItem>
          <MenuItem value="10">10%</MenuItem>
          <MenuItem value="20">20%</MenuItem>
          <MenuItem value="25">25%</MenuItem>
          <MenuItem value="especial">Especial</MenuItem>
        </TextField>
        <Button variant="outlined" onClick={handleApplyDiscount} sx={{ flex:1 }}>
          Aplicar descuento
        </Button>
        <Button variant="outlined" color="error" onClick={onClearAll} sx={{ flex:1 }}>
          Borrar todo
        </Button>
      </Box>
    </Paper>
  );
};

export default Carrito;
