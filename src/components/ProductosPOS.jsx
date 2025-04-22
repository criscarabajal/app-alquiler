// src/components/ProductosPOS.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  useTheme
} from '@mui/material';
import Carrito from './Carrito';
import BottomNav from './BottomNav';
import { fetchProductos } from '../utils/fetchProductos';
import generarRemitoPDF, { generarNumeroRemito } from '../utils/generarRemito';

export default function ProductosPOS() {
  const theme = useTheme();
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [carrito, setCarrito] = useState(() =>
    JSON.parse(localStorage.getItem('carrito') || '[]')
  );
  const [comentario, setComentario] = useState('');

  // Estado popup Cliente
  const [openCliente, setOpenCliente] = useState(false);
  const [clienteForm, setClienteForm] = useState(() =>
    JSON.parse(localStorage.getItem('cliente') || '{}')
  );
  const [cliente, setCliente] = useState(() =>
    JSON.parse(localStorage.getItem('cliente') || '{}')
  );

  useEffect(() => { fetchProductos().then(setProductos); }, []);
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  const subcategorias = [
    ...new Set(
      productos
        .filter(p => !categoria || p.categoria === categoria)
        .map(p => p.subcategoria)
        .filter(Boolean)
    ),
  ];
  const sugerencias = productos.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
    (!categoria || p.categoria === categoria) &&
    (!subcategoria || p.subcategoria === subcategoria)
  );

  // Carrito handlers
  const agregarAlCarrito = p => {
    const idx = carrito.findIndex(x => x.nombre === p.nombre);
    if (idx !== -1) {
      const copia = [...carrito]; copia[idx].cantidad++; setCarrito(copia);
    } else {
      setCarrito([...carrito, { ...p, cantidad: 1 }]);
    }
  };
  const incrementar = i => { const c = [...carrito]; c[i].cantidad++; setCarrito(c); };
  const decrementar = i => { const c = [...carrito]; if (c[i].cantidad > 1) c[i].cantidad--; setCarrito(c); };
  const eliminar = i => { const c = [...carrito]; c.splice(i, 1); setCarrito(c); };
  const clearAll = () => setCarrito([]);

  const total = carrito.reduce((sum, x) => sum + (parseFloat(x.precio) || 0) * x.cantidad, 0);

  // Cliente dialog handlers
  const handleOpenCliente = () => setOpenCliente(true);
  const handleCloseCliente = () => setOpenCliente(false);
  const handleClienteChange = e => {
    const { name, value } = e.target;
    setClienteForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSaveCliente = () => {
    const { nombre, apellido, dni, atendidoPor } = clienteForm;
    if (!nombre || !apellido || !dni || !atendidoPor) {
      alert('Completa todos los campos obligatorios');
      return;
    }
    localStorage.setItem('cliente', JSON.stringify(clienteForm));
    setCliente(clienteForm);
    setOpenCliente(false);
  };

  // Generar remito
  const handleGenerarRemito = () => {
    if (!cliente.nombre) {
      handleOpenCliente();
      return;
    }
    const numero = generarNumeroRemito();
    const fecha = new Date().toLocaleDateString('es-AR');
    generarRemitoPDF(cliente, carrito, cliente.atendidoPor, numero, fecha);
  };

  // Alturas header/footer en px (theme.spacing(9) ≃ 72px)
  const HEADER_HEIGHT = theme.spacing(9);
  const BOTTOM_HEIGHT = theme.spacing(9);

  return (
    <Box>
      {/* Barra superior */}
      <Box
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: HEADER_HEIGHT,
          backgroundColor: 'grey.900',
          display: 'flex', alignItems: 'center', gap: 2, px: 2, zIndex: 1200
        }}
      >
        <TextField
          size="small" variant="outlined" placeholder="Buscar producto"
          value={buscar} onChange={e => setBuscar(e.target.value)}
          sx={{ flexGrow: 1, backgroundColor: 'grey.800', borderRadius: 1 }}
        />
        <TextField
          size="small" select value={categoria}
          onChange={e => { setCategoria(e.target.value); setSubcategoria(''); }}
          sx={{ minWidth: 140, backgroundColor: 'grey.800', borderRadius: 1 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categorias.map((c, i) => <MenuItem key={i} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField
          size="small" select value={subcategoria}
          onChange={e => setSubcategoria(e.target.value)}
          disabled={!categoria}
          sx={{ minWidth: 140, backgroundColor: 'grey.800', borderRadius: 1 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {subcategorias.map((s, i) => <MenuItem key={i} value={s}>{s}</MenuItem>)}
        </TextField>
      </Box>

      {/* Sección “Pedido” fija 30% */}
      <Box
        sx={{
          position: 'fixed',
          top: HEADER_HEIGHT,
          bottom: BOTTOM_HEIGHT,
          left: 0,
          width: '30%',
          p: 2,
          backgroundColor: 'grey.900',
          overflowY: 'auto',
          zIndex: 1000,
        }}
      >
        <Carrito
          productosSeleccionados={carrito}
          onIncrementar={incrementar}
          onDecrementar={decrementar}
          onEliminar={eliminar}
          onCantidadChange={(idx, nuevaCantidad) => {
            const copia = [...carrito];
            copia[idx].cantidad = nuevaCantidad;
            setCarrito(copia);
          }}
          total={total}
          comentario={comentario}
          setComentario={setComentario}
          onClearAll={clearAll}
        />
      </Box>

      {/* Listado de productos ocupa 70% derecho */}
      <Box
        sx={{
          position: 'fixed',
          top: HEADER_HEIGHT,
          bottom: BOTTOM_HEIGHT,
          left: '30%',
          right: 0,
          p: 2,
          backgroundColor: 'grey.800',
          overflowY: 'auto',
        }}
      >
        {sugerencias.map((p, i) => (
          <Box
            key={i}
            onClick={() => agregarAlCarrito(p)}
            sx={{
              mb: 1, p: 1, borderRadius: 1, backgroundColor: 'grey.700', cursor: 'pointer',
              '&:hover': { backgroundColor: 'grey.600' }
            }}
          >
            <Typography variant="body1">{p.nombre}</Typography>
            <Typography variant="caption">${parseFloat(p.precio || 0).toFixed(2)}</Typography>
          </Box>
        ))}
      </Box>

      {/* Diálogo Cliente */}
      <Dialog open={openCliente} onClose={handleCloseCliente}>
        <DialogTitle>Datos del Cliente</DialogTitle>
        <DialogContent sx={{ backgroundColor: 'grey.900', color: 'white' }}>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {['nombre','apellido','dni'].map(f => (
              <Grid item xs={12} key={f}>
                <TextField
                  fullWidth name={f}
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  value={clienteForm[f] || ''}
                  onChange={handleClienteChange}
                  variant="outlined" size="small"
                  sx={{ backgroundColor: 'grey.800', borderRadius: 1 }}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField
                select fullWidth name="atendidoPor" label="Atendido por"
                value={clienteForm.atendidoPor || ''}
                onChange={handleClienteChange}
                variant="outlined" size="small"
                sx={{ backgroundColor: 'grey.800', borderRadius: 1 }}
              >
                <MenuItem value="">Seleccionar...</MenuItem>
                <MenuItem value="Matias">Matias</MenuItem>
                <MenuItem value="Jhona">Jhona</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth name="fechaRetiro" label="Fecha de Retiro" type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={clienteForm.fechaRetiro || ''}
                onChange={handleClienteChange}
                size="small"
                sx={{ backgroundColor: 'grey.800', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth name="fechaDevolucion" label="Fecha de Devolución" type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={clienteForm.fechaDevolucion || ''}
                onChange={handleClienteChange}
                size="small"
                sx={{ backgroundColor: 'grey.800', borderRadius: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'grey.900', px: 3, pb: 2 }}>
          <Button onClick={handleCloseCliente}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveCliente}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Navbar Inferior */}
      <BottomNav
        onOpenCliente={handleOpenCliente}
        onGenerarRemito={handleGenerarRemito}
        onCancelar={clearAll}
        onBuscarPedido={() => {}}
      />
    </Box>
  );
}
