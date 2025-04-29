// src/components/ProductosPOS.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    'LUCES',
    'GRIPERIA',
    'TELAS',
    'CAMARAS',
    'LENTES',
    'BATERIAS',
    'MONITOREO',
    'FILTROS',
    'ACCESORIOS DE CAMARA',
    'SONIDO'
  ];

  // --- Productos y filtros ---
  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [favorita, setFavorita] = useState('');
  const [sugerencias, setSugerencias] = useState([]);

  // --- Carrito ---
  const [carrito, setCarrito] = useState(() =>
    JSON.parse(localStorage.getItem('carrito') || '[]')
  );
  const [comentario, setComentario] = useState('');

  // --- Slider ---
  const [rows, setRows] = useState(1);
  const sliderRef = useRef(null);
  const [isSliding, setIsSliding] = useState(false);

  // Desbloqueo inicial
  useEffect(() => setIsSliding(false), []);

  // Calcular filas
  const calcularFilas = useCallback(() => {
    const disponible = window.innerHeight - HEADER - FOOTER - ROW_GAP;
    const n = Math.floor(disponible / (CARD_HEIGHT + ROW_GAP));
    setRows(n > 0 ? n : 1);
  }, [HEADER, FOOTER]);
  useEffect(() => {
    calcularFilas();
    window.addEventListener('resize', calcularFilas);
    return () => window.removeEventListener('resize', calcularFilas);
  }, [calcularFilas]);

  // Cargar productos
  useEffect(() => {
    fetchProductos()
      .then(setProductos)
      .finally(() => setIsSliding(false));
  }, []);

  // Persistir carrito
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  // Filtrar sugerencias
  useEffect(() => {
    setSugerencias(
      productos.filter(p =>
        p.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
        (!categoria || p.categoria === categoria) &&
        (!subcategoria || p.subcategoria === subcategoria) &&
        (!favorita || p.categoria === favorita)
      )
    );
  }, [productos, buscar, categoria, subcategoria, favorita]);

  // Reset slider al cambiar filtros
  useEffect(() => {
    sliderRef.current?.slickGoTo(0);
  }, [buscar, categoria, subcategoria, favorita, rows, sugerencias.length]);

  // --- Carrito handlers ---
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
  const incrementar = i => { const c=[...carrito]; c[i].cantidad++; setCarrito(c); };
  const decrementar = i => { const c=[...carrito]; if(c[i].cantidad>1) c[i].cantidad--; setCarrito(c); };
  const setCantidad = (i,v) => {
    const c=[...carrito];
    c[i].cantidad = v === '' ? '' : Math.max(1, parseInt(v,10));
    setCarrito(c);
  };
  const eliminar = i => { const c=[...carrito]; c.splice(i,1); setCarrito(c); };
  const clearAll = () => setCarrito([]);

  const total = carrito.reduce(
    (s,x) => s + (parseFloat(x.precio)||0)*(parseInt(x.cantidad,10)||0),
    0
  );

  // --- Cliente desde Google Sheets ---
  const [clientes, setClientes] = useState([]);
  useEffect(() => {
    const sheetId = '1DhpNyUyM-sTHuoucELtaDP3Ul5-JemSrw7uhnhohMZc';
    const gid = '888837097';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${gid}&tq=${encodeURIComponent('SELECT *')}`;
    fetch(url)
      .then(r => r.text())
      .then(txt => {
        const json = JSON.parse(txt.slice(txt.indexOf('(')+1, -2));
        const cols = json.table.cols.map(c => c.label.trim());
        const idx = {
          nombre: cols.findIndex(l=>/nombre/i.test(l)),
          apellido: cols.findIndex(l=>/apellido/i.test(l)),
          dni: cols.findIndex(l=>/dni/i.test(l)),
          telefono: cols.findIndex(l=>/telefono/i.test(l)),
          email: cols.findIndex(l=>/email/i.test(l))
        };
        const rowsData = json.table.rows.map(r => ({
          nombre: r.c[idx.nombre]?.v||'',
          apellido: r.c[idx.apellido]?.v||'',
          dni: String(r.c[idx.dni]?.v||''),
          telefono: String(r.c[idx.telefono]?.v||''),
          email: r.c[idx.email]?.v||''
        }));
        setClientes(rowsData);
      })
      .catch(console.error);
  }, []);

  // --- Diálogo Cliente ---
  const [openCliente, setOpenCliente] = useState(false);
  const [clienteForm, setClienteForm] = useState(
    JSON.parse(localStorage.getItem('cliente')||'{}')
  );
  const [cliente, setCliente] = useState(
    JSON.parse(localStorage.getItem('cliente')||'{}')
  );
  const [dniInput, setDniInput] = useState(clienteForm.dni||'');
  const [clientSuggestion, setClientSuggestion] = useState('');

  const handleClientSearch = () => {
    const clean = dniInput.replace(/\D/g,'');
    const found = clientes.find(c=>c.dni.replace(/\D/g,'')===clean);
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
    if (name==='dni') setDniInput(value);
    setClienteForm(prev=>({...prev,[name]:value}));
    setClientSuggestion('');
  };
  const handleSaveCliente = () => {
    const { nombre, apellido, dni, atendidoPor } = clienteForm;
    if (!nombre||!apellido||!dni||!atendidoPor) {
      alert('Completa todos los campos obligatorios');
      return;
    }
    localStorage.setItem('cliente', JSON.stringify(clienteForm));
    setCliente(clienteForm);
    handleCloseCliente();
  };
  const handleGenerarRemito = () => {
    if (!cliente.nombre) {
      handleOpenCliente();
      return;
    }
    const num = generarNumeroRemito();
    const fecha = new Date().toLocaleDateString('es-AR');
    generarRemitoPDF(cliente, carrito, cliente.atendidoPor, num, fecha);
  };

  // --- Slider settings con before/afterChange ---
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
      {/* HEADER: búsqueda + filtros */}
      <Box sx={{
        position:'fixed', top:0,left:0,right:0,
        height:HEADER, bgcolor:'grey.900',
        display:'flex', alignItems:'center', gap:2, px:2, zIndex:1200
      }}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Buscar producto"
          value={buscar}
          onChange={e=>setBuscar(e.target.value)}
          InputProps={{
            endAdornment:(
              <InputAdornment position="end">
                <SearchIcon/>
              </InputAdornment>
            )
          }}
          sx={{ flexGrow:1, bgcolor:'grey.800', borderRadius:1 }}
        />
        <TextField
          size="small"
          select
          label="Categoría"
          value={categoria}
          onChange={e=>{setCategoria(e.target.value); setSubcategoria('');}}
          sx={{ minWidth:140, bgcolor:'grey.800', borderRadius:1 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {Array.from(new Set(productos.map(p=>p.categoria).filter(Boolean)))
            .map((c,i)=><MenuItem key={i} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField
          size="small"
          select
          label="Subcategoría"
          value={subcategoria}
          onChange={e=>setSubcategoria(e.target.value)}
          disabled={!categoria}
          sx={{ minWidth:140, bgcolor:'grey.800', borderRadius:1 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {Array.from(new Set(
            productos
              .filter(p=>p.categoria===categoria)
              .map(p=>p.subcategoria)
              .filter(Boolean)
          )).map((s,i)=><MenuItem key={i} value={s}>{s}</MenuItem>)}
        </TextField>
      </Box>

      {/* CARRITO */}
      <Box sx={{
        position:'fixed', top:HEADER,bottom:FOOTER,left:0,
        width:'30%', p:2, bgcolor:'grey.900',
        overflowY:'auto', zIndex:1000
      }}>
        <Carrito
          productosSeleccionados={carrito}
          onIncrementar={incrementar}
          onDecrementar={decrementar}
          onCantidadChange={setCantidad}
          onEliminar={eliminar}
          total={total}
          comentario={comentario}
          setComentario={setComentario}
          onClearAll={clearAll}
        />
      </Box>

      {/* PRODUCTOS + FAVORITAS */}
      <Box sx={{
        position:'fixed', top:HEADER,bottom:FOOTER,
        left:'30%', right:0, p:2,
        bgcolor:'grey.800', overflowY:'auto'
      }}>
        <TextField
          select fullWidth label="Categorías favoritas"
          value={favorita}
          onChange={e=>setFavorita(e.target.value)}
          sx={{ mb:2, bgcolor:'grey.800', borderRadius:1 }}
        >
          <MenuItem value="">(ninguna)</MenuItem>
          {categoriasNav.map((cat,i)=>
            <MenuItem key={i} value={cat}>{cat}</MenuItem>
          )}
        </TextField>
        <Slider ref={sliderRef} {...settings}>
          {sugerencias.map((p,i)=>(
            <Box key={i} sx={{ px:1, pb:`${ROW_GAP}px` }}>
              <Box
                onClick={e=>{
                  if(isSliding){ e.preventDefault(); e.stopPropagation(); return; }
                  agregarAlCarrito(p);
                }}
                sx={{
                  height:CARD_HEIGHT, bgcolor:'grey.700', borderRadius:1,
                  p:1.5, display:'flex', flexDirection:'column',
                  justifyContent:'space-between',
                  cursor:isSliding?'default':'pointer',
                  '&:hover':{ bgcolor:!isSliding?'grey.600':'grey.700' }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight:600,lineHeight:1.2,
                    whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'
                  }}
                >
                  {p.nombre}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight:500 }}>
                  ${(parseFloat(p.precio)||0).toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color:'grey.300' }}>
                  {p.categoria} / {p.subcategoria}
                </Typography>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* DIALOG CLIENTE */}
      <Dialog open={openCliente} onClose={handleCloseCliente} fullWidth maxWidth="md">
        <DialogTitle>Datos del Cliente</DialogTitle>
        <DialogContent sx={{ bgcolor:'grey.900', color:'#fff', minHeight:400 }}>
          <Grid container spacing={3} sx={{ pt:2 }}>
            {['nombre','apellido','telefono','email'].map((f,idx)=>(
              <Grid item xs={12} sm={6} key={idx}>
                <TextField
                  fullWidth size="small" variant="outlined"
                  name={f}
                  label={f.charAt(0).toUpperCase()+f.slice(1)}
                  value={clienteForm[f]||''}
                  onChange={handleClienteChange}
                  sx={{ bgcolor:'grey.800', borderRadius:1 }}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" variant="outlined"
                name="dni" label="DNI" value={dniInput}
                onChange={handleClienteChange}
                InputProps={{
                  endAdornment:(
                    <InputAdornment position="end">
                      <IconButton onClick={handleClientSearch}>
                        <SearchIcon/>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ bgcolor:'grey.800', borderRadius:1 }}
              />
              {clientSuggestion && (
                <Typography
                  variant="caption"
                  sx={{
                    color: clientSuggestion.startsWith('Coincidencia')
                      ? 'success.main'
                      : 'error.main',
                    display:'block', mt:0.5
                  }}
                >
                  {clientSuggestion}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" variant="outlined" select
                name="atendidoPor" label="Atendido por"
                value={clienteForm.atendidoPor||''}
                onChange={handleClienteChange}
                sx={{ bgcolor:'grey.800', borderRadius:1 }}
              >
                <MenuItem value="Matias">Matias</MenuItem>
                <MenuItem value="Jhona">Jhona</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" variant="outlined"
                name="fechaRetiro" label="Fecha Retiro"
                type="datetime-local" InputLabelProps={{ shrink:true }}
                value={clienteForm.fechaRetiro||''}
                onChange={handleClienteChange}
                sx={{ bgcolor:'grey.800', borderRadius:1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ bgcolor:'grey.900', px:3, pb:2 }}>
          <Button onClick={handleCloseCliente}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveCliente}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* NAVBAR INFERIOR */}
      <BottomNav
        onOpenCliente={handleOpenCliente}
        onGenerarRemito={handleGenerarRemito}
        onCancelar={clearAll}
        onBuscarPedido={()=>{}}
      />
    </Box>
  );
}
