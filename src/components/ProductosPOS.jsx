// src/components/ProductosPOS.jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, TextField, MenuItem, Typography, IconButton, Popover } from '@mui/material';
import Carrito from './Carrito';
import { fetchProductos } from '../utils/fetchProductos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ProductCard = ({ producto, onAdd }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const openPopover = Boolean(anchorEl);
  
  return (
    <Box sx={{ position: 'relative', borderRadius: 2 }}>
      <Button
        fullWidth
        variant="contained"
        sx={{
          backgroundColor: 'grey.800',
          py: 2,
          px: 1,
          borderRadius: 2,
          boxShadow: 1,
          '&:hover': { backgroundColor: 'grey.700' },
          textTransform: 'none',
          pt: 4,
          pb: 4,
        }}
        onClick={() => onAdd(producto)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
            {producto.nombre}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'grey.400' }}>
            ${parseFloat(producto.precio || 0).toFixed(2)}
          </Typography>
        </Box>
      </Button>
      {/* Ícono de 3 puntitos en la esquina inferior izquierda */}
      {producto.incluye &&
        typeof producto.incluye === 'string' &&
        producto.incluye.trim() !== "" && (
          <Box sx={{ position: 'absolute', bottom: 4, left: 4 }}>
            <IconButton size="small" onClick={handleClick}>
              <MoreVertIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
      )}
      {/* Indicador de "Alquilable" en la esquina inferior derecha */}
      <Box sx={{ position: 'absolute', bottom: 4, right: 4 }}>
        {producto.alquilable && producto.alquilable.toUpperCase() === "SI" ? (
          <CheckCircleIcon color="success" />
        ) : (
          <CancelIcon color="error" />
        )}
      </Box>
      {/* Popover que se abre justo encima del producto mostrando "incluye" */}
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{ sx: { backgroundColor: 'grey.800', color: 'white' } }}
      >
        <Typography variant="body2" sx={{ p: 2 }}>
          {producto.incluye || "No especificado"}
        </Typography>
      </Popover>
    </Box>
  );
};

const ProductosPOS = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [comentario, setComentario] = useState('');
  const [nombreBuscado, setNombreBuscado] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState('');

  useEffect(() => {
    const cachedProductos = localStorage.getItem('productos');
    if (cachedProductos) {
      try {
        setProductos(JSON.parse(cachedProductos));
      } catch (error) {
        console.error("Error al parsear cache de productos", error);
        localStorage.removeItem('productos');
      }
    }
    fetchProductos().then(data => {
      setProductos(data);
      localStorage.setItem('productos', JSON.stringify(data));
    });
  }, []);

  // Guardar el carrito en localStorage cada vez que cambia
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

  const filteredProducts = productos.filter(p => {
    const matchName = p.nombre.toLowerCase().includes(nombreBuscado.toLowerCase());
    const matchCategory = !categoriaSeleccionada || p.categoria === categoriaSeleccionada;
    const matchSubcategory = !subcategoriaSeleccionada || p.subcategoria === subcategoriaSeleccionada;
    return matchName && matchCategory && matchSubcategory;
  });

  const agregarAlCarrito = (producto) => {
    const index = carrito.findIndex(p => p.nombre === producto.nombre);
    if (index !== -1) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[index].cantidad += 1;
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const incrementarCantidad = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].cantidad += 1;
    setCarrito(nuevoCarrito);
  };

  const decrementarCantidad = (index) => {
    const nuevoCarrito = [...carrito];
    if (nuevoCarrito[index].cantidad > 1) {
      nuevoCarrito[index].cantidad -= 1;
      setCarrito(nuevoCarrito);
    }
  };

  const eliminarProducto = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, prod) => acc + (parseFloat(prod.precio || 0) * prod.cantidad), 0);
  };

  return (
    <Box sx={{ minHeight: '100%', backgroundColor: 'grey.900', color: 'white', p: 2 }}>
      {/* Sección de Filtros */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar producto"
          variant="outlined"
          size="small"
          value={nombreBuscado}
          onChange={(e) => setNombreBuscado(e.target.value)}
          sx={{ backgroundColor: 'grey.800', borderRadius: 1, flexGrow: 1 }}
        />
        <TextField
          select
          label="Categoría"
          variant="outlined"
          size="small"
          value={categoriaSeleccionada}
          onChange={(e) => {
            setCategoriaSeleccionada(e.target.value);
            setSubcategoriaSeleccionada('');
          }}
          sx={{ backgroundColor: 'grey.800', borderRadius: 1, minWidth: 120 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categorias.map((cat, idx) => (
            <MenuItem key={idx} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Subcategoría"
          variant="outlined"
          size="small"
          value={subcategoriaSeleccionada}
          onChange={(e) => setSubcategoriaSeleccionada(e.target.value)}
          sx={{ backgroundColor: 'grey.800', borderRadius: 1, minWidth: 120 }}
          disabled={!categoriaSeleccionada}
        >
          <MenuItem value="">Todas</MenuItem>
          {subcategorias.map((sub, idx) => (
            <MenuItem key={idx} value={sub}>
              {sub}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
        {/* Carrito */}
        <Carrito
          productosSeleccionados={carrito}
          onIncrementar={incrementarCantidad}
          onDecrementar={decrementarCantidad}
          onEliminar={eliminarProducto}
          total={calcularTotal()}
          comentario={comentario}
          setComentario={setComentario}
        />
        {/* Lista de Productos con scroll interno */}
        <Box sx={{ flex: 1, height: '100%', overflowY: 'auto' }}>
          <Grid container spacing={2}>
            {filteredProducts.map((producto, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ProductCard producto={producto} onAdd={agregarAlCarrito} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductosPOS;
