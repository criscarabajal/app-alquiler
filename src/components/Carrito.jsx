// src/components/Carrito.jsx
import React from 'react';
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
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';

const Carrito = ({ productosSeleccionados, onIncrementar, onDecrementar, onEliminar, total, comentario, setComentario }) => {
  return (
    <Paper
      sx={{
        width: '100%',
        maxWidth: 400,
        bgcolor: '#1e1e1e',
        color: '#fff',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
      }}
    >
      <Box>
        <Typography variant="h5" gutterBottom>
          Pedido 1
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
                      {producto.cantidad} x ${producto.precio.toLocaleString()} = <strong>${(producto.precio * producto.cantidad).toLocaleString()}</strong>
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

      <Box mt={2} textAlign="right">
        <Typography variant="h6" fontWeight="bold">
          Total: ${total.toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Carrito;
