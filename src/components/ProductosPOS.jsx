// src/components/ProductosPOS.jsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Typography, IconButton, Popover } from '@mui/material';
import Carrito from './Carrito';
import { fetchProductos } from '../utils/fetchProductos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Helper: transforma el nombre (Primera letra en mayúscula, resto minúsculas)
const toCapitalized = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

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
    <Box
      sx={{
        width: '100%',
        height: '40px',  // Altura fija: "caja de texto" + 10px
        position: 'relative',
        border: '1px solid #424242',
        borderRadius: 1,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        px: 1,
        backgroundColor: 'grey.800'
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {toCapitalized(producto.nombre)}
        </Typography>
      </Box>
      {/* Contenedor de iconos en la esquina inferior derecha */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {producto.alquilable && producto.alquilable.toUpperCase() === "SI" ? (
          <CheckCircleIcon color="success" sx={{ fontSize: '1rem' }} />
        ) : (
          <CancelIcon color="error" sx={{ fontSize: '1rem' }} />
        )}
        {producto.incluye &&
          typeof producto.incluye === 'string' &&
          producto.incluye.trim() !== "" && (
            <IconButton size="small" onClick={handleClick} sx={{ p: 0 }}>
              <MoreVertIcon sx={{ color: 'white', fontSize: '1rem' }} />
            </IconButton>
        )}
      </Box>
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
        <Typography variant="body2" sx={{ p: 1 }}>
          {producto.incluye || "No especificado"}
        </Typography>
      </Popover>
      {/* Al hacer clic en la card completa se agrega el producto */}
      <Box
        onClick={() => onAdd(producto)}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: 'pointer',
          zIndex: 0,
        }}
      />
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

  // Guarda el carrito en localStorage para que sea accesible desde la generación del remito
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

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
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
        {/* Lista de Productos en formato de lista vertical */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {filteredProducts.map((producto, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <ProductCard producto={producto} onAdd={agregarAlCarrito} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductosPOS;
