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
  useTheme
} from '@mui/material';
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

  const [productos, setProductos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [carrito, setCarrito] = useState(
    JSON.parse(localStorage.getItem('carrito') || '[]')
  );
  const [comentario, setComentario] = useState('');
  const [rows, setRows] = useState(1);
  const [isSliding, setIsSliding] = useState(false);

  const sliderRef = useRef(null);

  // 1) Calcular filas según alto de viewport
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

  // 2) Cargar productos
  useEffect(() => {
    fetchProductos().then(setProductos);
  }, []);

  // 3) Guardar carrito
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  const subcategorias = [...new Set(
    productos
      .filter(p => !categoria || p.categoria === categoria)
      .map(p => p.subcategoria)
      .filter(Boolean)
  )];
  const sugerencias = productos.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
    (!categoria || p.categoria === categoria) &&
    (!subcategoria || p.subcategoria === subcategoria)
  );

  // 4) Reset al cambiar filtros o filas
  useEffect(() => {
    sliderRef.current?.slickGoTo(0);
  }, [buscar, categoria, subcategoria, rows, sugerencias.length]);

  // 5) Handlers carrito
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
  const setCantidad = (i, v) => {
    // permite campo vacío
    if (v === '') {
      const c=[...carrito];
      c[i].cantidad = v;
      setCarrito(c);
      return;
    }
    const val = parseInt(v, 10);
    if (isNaN(val) || val<1) return;
    const c=[...carrito];
    c[i].cantidad = val;
    setCarrito(c);
  };
  const eliminar = i => { const c=[...carrito]; c.splice(i,1); setCarrito(c); };
  const clearAll = () => setCarrito([]);

  const total = carrito.reduce((s,x) => s + (parseFloat(x.precio)||0) * (parseInt(x.cantidad)||0), 0);

  // 6) Dialog Cliente
  const [openCliente, setOpenCliente] = useState(false);
  const [clienteForm, setClienteForm] = useState(
    JSON.parse(localStorage.getItem('cliente')||'{}')
  );
  const [cliente, setCliente] = useState(
    JSON.parse(localStorage.getItem('cliente')||'{}')
  );
  const handleOpenCliente = () => setOpenCliente(true);
  const handleCloseCliente = () => setOpenCliente(false);
  const handleClienteChange = e => {
    const { name, value } = e.target;
    setClienteForm(prev => ({ ...prev, [name]: value }));
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
    if (!cliente.nombre) return handleOpenCliente();
    const num = generarNumeroRemito();
    const fecha = new Date().toLocaleDateString('es-AR');
    generarRemitoPDF(cliente, carrito, cliente.atendidoPor, num, fecha);
  };

  // 7) Configuración slider
  const settings = {
    arrows: false,
    infinite: false,
    rows,
    slidesPerRow: SLIDES_PER_ROW,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 600,
    cssEase: 'ease-in-out',
    beforeChange: () => setIsSliding(true),
    afterChange: () => setIsSliding(false),
    initialSlide: 0,
    key: `${sugerencias.length}-${rows}`
  };

  return (
    <Box>
      {/* Barra búsqueda */}
      <Box sx={{
        position:'fixed', top:0,left:0,right:0,
        height:HEADER, bgcolor:'grey.900',
        display:'flex',alignItems:'center',gap:2,px:2,zIndex:1200
      }}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Buscar producto"
          value={buscar}
          onChange={e=>setBuscar(e.target.value)}
          sx={{ flexGrow:1, backgroundColor:'grey.800', borderRadius:1 }}
        />
        <TextField
          size="small"
          select
          value={categoria}
          onChange={e=>{setCategoria(e.target.value);setSubcategoria('');}}
          sx={{ minWidth:140, backgroundColor:'grey.800', borderRadius:1 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categorias.map((c,i)=><MenuItem key={i} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField
          size="small"
          select
          value={subcategoria}
          onChange={e=>setSubcategoria(e.target.value)}
          disabled={!categoria}
          sx={{ minWidth:140, backgroundColor:'grey.800', borderRadius:1 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {subcategorias.map((s,i)=><MenuItem key={i} value={s}>{s}</MenuItem>)}
        </TextField>
      </Box>

      {/* Carrito 30% */}
      <Box sx={{
        position:'fixed', top:HEADER, bottom:FOOTER, left:0,
        width:'30%', p:2, bgcolor:'grey.900', overflowY:'auto', zIndex:1000
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

      {/* Slider 70% */}
      <Box sx={{
        position:'fixed', top:HEADER, bottom:FOOTER,
        left:'30%', right:0, p:2, bgcolor:'grey.800'
      }}>
        <Slider ref={sliderRef} {...settings}>
          {sugerencias.map((p,i)=>(
            <Box key={i} sx={{ px:1, pb:`${ROW_GAP}px` }}>
              <Box
                onClick={()=>{ if(!isSliding) agregarAlCarrito(p); }}
                sx={{
                  height:CARD_HEIGHT,
                  bgcolor:'grey.700',
                  borderRadius:1,
                  p:1.5,
                  display:'flex',
                  flexDirection:'column',
                  justifyContent:'space-between',
                  cursor:isSliding?'default':'pointer',
                  '&:hover':{ bgcolor: !isSliding?'grey.600':'grey.700' }
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight:600,
                    lineHeight:1.2,
                    display:'-webkit-box',
                    WebkitLineClamp:2,
                    WebkitBoxOrient:'vertical',
                    overflow:'hidden'
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

      {/* Dialog Cliente */}
      <Dialog open={openCliente} onClose={handleCloseCliente}>
        <DialogTitle>Datos del Cliente</DialogTitle>
        <DialogContent sx={{ backgroundColor:'grey.900', color:'white' }}>
          <Grid container spacing={2} sx={{ pt:1 }}>
            {['nombre','apellido','dni'].map(f=>(
              <Grid item xs={12} key={f}>
                <TextField
                  fullWidth name={f}
                  label={f.charAt(0).toUpperCase()+f.slice(1)}
                  value={clienteForm[f]||''}
                  onChange={handleClienteChange}
                  variant="outlined" size="small"
                  sx={{ backgroundColor:'grey.800', borderRadius:1 }}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField
                select fullWidth name="atendidoPor" label="Atendido por"
                value={clienteForm.atendidoPor||''}
                onChange={handleClienteChange}
                variant="outlined" size="small"
                sx={{ backgroundColor:'grey.800', borderRadius:1 }}
              >
                <MenuItem value="">Seleccionar...</MenuItem>
                <MenuItem value="Matias">Matias</MenuItem>
                <MenuItem value="Jhona">Jhona</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth name="fechaRetiro" label="Fecha de Retiro" type="datetime-local"
                InputLabelProps={{ shrink:true }}
                value={clienteForm.fechaRetiro||''}
                onChange={handleClienteChange}
                size="small"
                sx={{ backgroundColor:'grey.800', borderRadius:1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor:'grey.900', px:3, pb:2 }}>
          <Button onClick={handleCloseCliente}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveCliente}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Navbar Inferior */}
      <BottomNav
        onOpenCliente={handleOpenCliente}
        onGenerarRemito={handleGenerarRemito}
        onCancelar={clearAll}
        onBuscarPedido={()=>{}}
      />
    </Box>
  );
}
