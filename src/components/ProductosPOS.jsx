// src/components/ProductosPOS.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Slider from 'react-slick';
import Carrito from './Carrito';
import BottomNav from './BottomNav';
import { fetchProductos } from '../utils/fetchProductos';
import generarRemitoPDF, { generarNumeroRemito } from '../utils/generarRemito';
import generarPresupuestoPDF, { generarNumeroPresupuesto } from '../utils/generarPresupuesto';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function ProductosPOS() {
  const theme = useTheme();
  const HEADER = parseInt(theme.spacing(9), 10);
  const FOOTER = parseInt(theme.spacing(9), 10);
  const CARD_HEIGHT = 180;
  const ROW_GAP = 16;
  const SLIDES_PER_ROW = 5;

  const categoriasNav = [
    'LUCES', 'GRIPERIA', 'TELAS', 'CAMARAS', 'LENTES',
    'BATERIAS', 'MONITOREO', 'FILTROS', 'ACCESORIOS DE CAMARA', 'SONIDO'
  ];

  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [favorita, setFavorita] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [sugerencias, setSugerencias] = useState([]);

  const [carrito, setCarrito] = useState(() =>
    JSON.parse(localStorage.getItem('carrito') || '[]')
  );
  const [comentario, setComentario] = useState('');
  const [jornadasMap, setJornadasMap] = useState({});

  const [rows, setRows] = useState(1);
  const sliderRef = useRef(null);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => setIsSliding(false), []);
  const calcularFilas = useCallback(() => {
    const alto = window.innerHeight - HEADER - FOOTER - ROW_GAP;
    setRows(Math.max(1, Math.floor(alto / (CARD_HEIGHT + ROW_GAP))));
  }, [HEADER, FOOTER]);
  useEffect(() => {
    calcularFilas();
    window.addEventListener('resize', calcularFilas);
    return () => window.removeEventListener('resize', calcularFilas);
  }, [calcularFilas]);

  useEffect(() => {
    fetchProductos().then(setProductos).finally(() => setIsSliding(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    setSugerencias(
      productos.filter(p =>
        p.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
        (!favorita || p.categoria === favorita) &&
        (!subcategoria || p.subcategoria === subcategoria)
      )
    );
  }, [productos, buscar, favorita, subcategoria]);

  useEffect(() => {
    sliderRef.current?.slickGoTo(0);
  }, [buscar, favorita, subcategoria, rows, sugerencias.length]);

  const subcategoriasNav = useMemo(() => {
    if (!favorita) return [];
    return Array.from(
      new Set(
        productos
          .filter(p => p.categoria === favorita)
          .map(p => p.subcategoria)
          .filter(Boolean)
      )
    );
  }, [productos, favorita]);

  const agregarAlCarrito = p => {
    if (isSliding) return;
    const idx = carrito.findIndex(x => x.nombre === p.nombre);
    if (idx >= 0) {
      const copia = [...carrito];
      copia[idx].cantidad++;
      setCarrito(copia);
    } else {
      setCarrito([...carrito, { ...p, cantidad: 1 }]);
    }
  };
  const incrementar = i => { const c = [...carrito]; c[i].cantidad++; setCarrito(c); };
  const decrementar = i => { const c = [...carrito]; if (c[i].cantidad > 1) c[i].cantidad--; setCarrito(c); };
  const setCantidad = (i, v) => { const c = [...carrito]; c[i].cantidad = v === '' ? '' : Math.max(1, parseInt(v, 10)); setCarrito(c); };
  const eliminar = i => { const c = [...carrito]; c.splice(i, 1); setCarrito(c); };
  const clearAll = () => setCarrito([]);

  const total = carrito.reduce(
    (s, x) => s + (parseFloat(x.precio) || 0) * (parseInt(x.cantidad, 10) || 0),
    0
  );

  const [clientes, setClientes] = useState([]);
  useEffect(() => {
    const sheetId = '1DhpNyUyM-sTHuoucELtaDP3Ul5-JemSrw7uhnhohMZc';
    const gid = '888837097';
    fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${gid}&tq=${encodeURIComponent('SELECT *')}`)
      .then(r => r.text())
      .then(txt => {
        const json = JSON.parse(txt.slice(txt.indexOf('(') + 1, -2));
        const cols = json.table.cols.map(c => c.label.trim());
        const idx = {
          nombre: cols.findIndex(l => /nombre/i.test(l)),
          apellido: cols.findIndex(l => /apellido/i.test(l)),
          dni: cols.findIndex(l => /dni/i.test(l)),
          telefono: cols.findIndex(l => /telefono/i.test(l)),
          email: cols.findIndex(l => /email/i.test(l))
        };
        setClientes(json.table.rows.map(r => ({
          nombre: r.c[idx.nombre]?.v || '',
          apellido: r.c[idx.apellido]?.v || '',
          dni: String(r.c[idx.dni]?.v || ''),
          telefono: String(r.c[idx.telefono]?.v || ''),
          email: r.c[idx.email]?.v || ''
        })));
      })
      .catch(console.error);
  }, []);

  const [openCliente, setOpenCliente] = useState(false);
  const [clienteForm, setClienteForm] = useState(
    JSON.parse(localStorage.getItem('cliente') || '{}')
  );
  const [cliente, setCliente] = useState(
    JSON.parse(localStorage.getItem('cliente') || '{}')
  );
  const [dniInput, setDniInput] = useState(clienteForm.dni || '');
  const [clientSuggestion, setClientSuggestion] = useState('');

  const handleClientSearch = () => {
    const clean = dniInput.replace(/\D/g, '');
    const found = clientes.find(c => c.dni.replace(/\D/g, '') === clean);
    if (found) {
      setClientSuggestion(`Coincidencia: ${found.nombre} ${found.apellido}`);
      setClienteForm(found);
    } else {
      setClientSuggestion('No se encontraron coincidencias');
    }
  };
  const handleOpenCliente = () => setOpenCliente(true);
  const handleCloseCliente = () => setOpenCliente(false);
  const handleClienteChange = e => {
    const { name, value } = e.target;
    if (name === 'dni') setDniInput(value);
    setClienteForm(prev => ({ ...prev, [name]: value }));
    setClientSuggestion('');
  };
  const handleSaveCliente = () => {
    const { nombre, apellido, dni, atendidoPor } = clienteForm;
    if (!nombre || !apellido || !dni || !atendidoPor) {
      alert('Completa todos los campos obligatorios');
      return;
    }
    localStorage.setItem('cliente', JSON.stringify(clienteForm));
    setCliente(clienteForm);
    handleCloseCliente();
  };

  const handleGenerarRemito = () => {
    if (!cliente.nombre) { handleOpenCliente(); return; }
    const num = generarNumeroRemito();
    const fecha = new Date().toLocaleDateString('es-AR');
    generarRemitoPDF(cliente, carrito, cliente.atendidoPor, num, fecha);
  };
  const handleGenerarPresupuesto = () => {
    if (!cliente.nombre) { handleOpenCliente(); return; }
    const num = generarNumeroPresupuesto();
    const fecha = new Date().toLocaleDateString('es-AR');
    generarPresupuestoPDF(cliente, carrito, jornadasMap, cliente.atendidoPor, num, fecha);
  };

  const settings = {
    arrows: true,
    infinite: false,
    rows,
    slidesPerRow: SLIDES_PER_ROW,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 600,
    cssEase: 'ease-in-out',
    beforeChange: () => setIsSliding(true),
    afterChange: () => setIsSliding(false),
  };

  return (
    <Box>
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: HEADER, bgcolor: 'grey.900',
        display: 'flex', alignItems: 'center', px: 2, zIndex: 1200
      }}>
        <TextField
          size="small" variant="outlined"
          placeholder="Buscar producto"
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          InputProps={{
            endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment>
          }}
          sx={{ width: '28vw', bgcolor: 'grey.800', borderRadius: 1 }}
        />
      </Box>

      <Box sx={{
        position: 'fixed', top: HEADER, bottom: FOOTER, left: 0,
        width: '30vw', p: 2, bgcolor: 'grey.900',
        overflowY: 'auto', zIndex: 1000
      }}>
        <Carrito
          productosSeleccionados={carrito}
          onIncrementar={incrementar}
          onDecrementar={decrementar}
          onCantidadChange={setCantidad}
          onEliminar={eliminar}
          total={total}
          jornadasMap={jornadasMap}
          setJornadasMap={setJornadasMap}
          comentario={comentario}
          setComentario={setComentario}
          onClearAll={clearAll}
        />
      </Box>

      <Box sx={{
        position: 'fixed', top: HEADER, bottom: FOOTER,
        left: '30vw', right: 0, bgcolor: 'grey.800', overflowY: 'auto'
      }}>
        <Box sx={{
          position: 'sticky', top: 0, zIndex: 1300,
          px: 1, py: 1, bgcolor: 'grey.800'
        }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: favorita ? 1 : 0 }}>
            {categoriasNav.map((cat, i) => (
              <Button
                key={i} size="small"
                variant={favorita === cat ? 'contained' : 'outlined'}
                onClick={() => { setFavorita(favorita === cat ? '' : cat); setSubcategoria(''); }}
              >
                {cat}
              </Button>
            ))}
          </Box>
          {favorita && (
            <Box sx={{
              display: 'flex', gap: 1, flexWrap: 'wrap',
              px: 1, py: 0.5, bgcolor: 'grey.700',
              borderLeft: `4px solid ${theme.palette.primary.main}`
            }}>
              {['Todas', ...subcategoriasNav].map((sub, idx) => (
                <Button
                  key={idx} size="small"
                  variant={subcategoria === sub || (sub === 'Todas' && !subcategoria) ? 'contained' : 'outlined'}
                  onClick={() => { setSubcategoria(sub === 'Todas' ? '' : sub); }}
                >
                  {sub}
                </Button>
              ))}
            </Box>
          )}
        </Box>

        <Slider ref={sliderRef} {...settings}>
          {sugerencias.map((p, i) => (
            <Box key={i} sx={{ px: 1, pb: `${ROW_GAP}px` }}>
              <Box
                onClick={e => {
                  if (isSliding) { e.preventDefault(); e.stopPropagation(); return; }
                  agregarAlCarrito(p);
                }}
                sx={{
                  height: CARD_HEIGHT,
                  bgcolor: 'grey.700',
                  borderRadius: 1,
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: isSliding ? 'default' : 'pointer',
                  '&:hover': { bgcolor: !isSliding ? 'grey.600' : 'grey.700' }
                }}
              >
                <Typography variant="subtitle1" sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word'
                }}>
                  {p.nombre}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  ${(parseFloat(p.precio) || 0).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>

      <Dialog open={openCliente} onClose={handleCloseCliente} fullWidth maxWidth="md">
        <DialogTitle>Datos del Cliente</DialogTitle>
        <DialogContent sx={{ bgcolor: 'grey.900', color: '#fff', minHeight: 400 }}>
          <Grid container spacing={3} sx={{ pt: 2 }}>
            {['nombre', 'apellido', 'telefono', 'email'].map((f, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <TextField
                  fullWidth size="small" variant="outlined"
                  name={f}
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  value={clienteForm[f] || ''}
                  onChange={handleClienteChange}
                  sx={{ bgcolor: 'grey.800', borderRadius: 1 }}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" variant="outlined"
                name="dni" label="DNI" value={dniInput}
                onChange={handleClienteChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">
                    <IconButton onClick={handleClientSearch}><SearchIcon /></IconButton>
                  </InputAdornment>
                }}
                sx={{ bgcolor: 'grey.800', borderRadius: 1 }}
              />
              {clientSuggestion && (
                <Typography variant="caption" sx={{
                  color: clientSuggestion.startsWith('Coincidencia') ? 'success.main' : 'error.main',
                  display: 'block', mt: 0.5
                }}>
                  {clientSuggestion}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" variant="outlined" select
                name="atendidoPor" label="Atendido por"
                value={clienteForm.atendidoPor || ''}
                onChange={handleClienteChange}
                sx={{ bgcolor: 'grey.800', borderRadius: 1 }}
              >
                <MenuItem value="Matias">Matias</MenuItem>
                <MenuItem value="Jhona">Jhona</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" variant="outlined"
                name="fechaRetiro" label="Fecha Retiro"
                type="datetime-local" InputLabelProps={{ shrink: true }}
                value={clienteForm.fechaRetiro || ''}
                onChange={handleClienteChange}
                sx={{ bgcolor: 'grey.800', borderRadius: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'grey.900', px: 3, pb: 2 }}>
          <Button onClick={handleCloseCliente}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveCliente}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <BottomNav
        onOpenCliente={handleOpenCliente}
        onGenerarRemito={handleGenerarRemito}
        onGenerarPresupuesto={handleGenerarPresupuesto}
        onCancelar={clearAll}
        onBuscarPedido={() => { }}
      />
    </Box>
  );
}
