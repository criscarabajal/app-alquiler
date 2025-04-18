// src/components/ProductosPOS.jsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Typography, Popover } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import Carrito from './Carrito';
import { fetchProductos } from '../utils/fetchProductos';

// Helper: transforma el nombre (Primera letra en mayúscula, resto minúsculas)
const toCapitalized = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const ProductCard = ({ producto, onAdd }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openPopover = Boolean(anchorEl);

  return (
    <Box
      sx={{
        width: '100%',
        height: 40,  // altura fija + 10px
        position: 'relative',
        border: '1px solid #424242',
        borderRadius: 1,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        px: 1,
        backgroundColor: 'grey.800',
      }}
    >
      <Typography
        sx={{
          flexGrow: 1,
          fontSize: '0.9rem',
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {toCapitalized(producto.nombre)}
      </Typography>

      {producto.alquilable?.toUpperCase() === "SI"
        ? <CheckCircleIcon color="success" sx={{ fontSize: '1rem' }} />
        : <CancelIcon color="error" sx={{ fontSize: '1rem' }} />
      }

      {producto.incluye?.trim() && (
        <>
          <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
            <MoreVertIcon sx={{ color: 'white', fontSize: '1rem' }} />
          </IconButton>
          <Popover
            open={openPopover}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            PaperProps={{ sx: { backgroundColor: 'grey.800', color: 'white' } }}
          >
            <Typography variant="body2" sx={{ p: 1 }}>
              {producto.incluye}
            </Typography>
          </Popover>
        </>
      )}

      {/* Capa clicable para agregar */}
      <Box
        onClick={() => onAdd(producto)}
        sx={{
          position: 'absolute',
          inset: 0,
          cursor: 'pointer',
          zIndex: 0,
        }}
      />
    </Box>
  );
};

export default function ProductosPOS() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [comentario, setComentario] = useState('');
  const [nombreBuscado, setNombreBuscado] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState('');

  useEffect(() => {
    const cache = localStorage.getItem('productos');
    if (cache) {
      try {
        setProductos(JSON.parse(cache));
      } catch {
        localStorage.removeItem('productos');
      }
    }
    fetchProductos().then(data => {
      setProductos(data);
      localStorage.setItem('productos', JSON.stringify(data));
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  const subcategorias = [...new Set(
    productos
      .filter(p => !categoriaSeleccionada || p.categoria === categoriaSeleccionada)
      .map(p => p.subcategoria)
      .filter(Boolean)
  )];

  const filtered = productos.filter(p => {
    return p.nombre.toLowerCase().includes(nombreBuscado.toLowerCase())
      && (!categoriaSeleccionada || p.categoria === categoriaSeleccionada)
      && (!subcategoriaSeleccionada || p.subcategoria === subcategoriaSeleccionada);
  });

  const agregarAlCarrito = producto => {
    const idx = carrito.findIndex(p => p.nombre === producto.nombre);
    if (idx !== -1) {
      const copia = [...carrito];
      copia[idx].cantidad += 1;
      setCarrito(copia);
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const calcularTotal = () =>
    carrito.reduce((sum, p) => sum + parseFloat(p.precio || 0) * p.cantidad, 0);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'grey.900',
        color: 'white',
        p: 2,
      }}
    >
      {/* 1) Filtros (fijo) */}
      <Box sx={{ flex: '0 0 auto', mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar producto"
          size="small"
          variant="outlined"
          value={nombreBuscado}
          onChange={e => setNombreBuscado(e.target.value)}
          sx={{ backgroundColor: 'grey.800', borderRadius: 1, flexGrow: 1 }}
        />
        <TextField
          select
          label="Categoría"
          size="small"
          variant="outlined"
          value={categoriaSeleccionada}
          onChange={e => {
            setCategoriaSeleccionada(e.target.value);
            setSubcategoriaSeleccionada('');
          }}
          sx={{ backgroundColor: 'grey.800', borderRadius: 1, minWidth: 120 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categorias.map((c, i) => <MenuItem key={i} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="Subcategoría"
          size="small"
          variant="outlined"
          value={subcategoriaSeleccionada}
          onChange={e => setSubcategoriaSeleccionada(e.target.value)}
          sx={{ backgroundColor: 'grey.800', borderRadius: 1, minWidth: 120 }}
          disabled={!categoriaSeleccionada}
        >
          <MenuItem value="">Todas</MenuItem>
          {subcategorias.map((s, i) => <MenuItem key={i} value={s}>{s}</MenuItem>)}
        </TextField>
      </Box>

      {/* 2) Carrito (fijo) */}
      <Box sx={{ flex: '0 0 auto', mb: 2 }}>
        <Carrito
          productosSeleccionados={carrito}
          onIncrementar={(i) => {/* tu función */}}
          onDecrementar={(i) => {/* tu función */}}
          onEliminar={(i) => {/* tu función */}}
          total={calcularTotal()}
          comentario={comentario}
          setComentario={setComentario}
        />
      </Box>

      {/* 3) Lista de productos (scrollable) */}
      <Box
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
          pb: '64px'  // espacio para que no queden productos tras el navbar inferior
        }}
      >
        {filtered.map((producto, idx) => (
          <Box key={idx} sx={{ mb: 1 }}>
            <ProductCard producto={producto} onAdd={agregarAlCarrito} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
