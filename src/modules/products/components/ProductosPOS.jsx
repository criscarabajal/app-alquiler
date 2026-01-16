// src/modules/products/components/ProductosPOS.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Slider from 'react-slick';
import { Search, MoreVertical, X, Settings, User, Save, UploadCloud } from 'lucide-react';
import Carrito from '../../orders/components/Carrito';
import BottomNav from '../../../shared/components/BottomNav';
import ListaPedidosModal from '../../orders/components/ListaPedidosModal';
import { getProducts } from '../services/products.service';
import { generarRemitoPDF, generarPresupuestoPDF, generarSeguroPDF } from '../../documents';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import logoImg from '../../../assets/logo.png';
import { createOrUpdateOrder, getOrder } from '../../orders';

const defaultCats = [
  'LUCES', 'GRIPERIA', 'TELAS', 'CAMARAS', 'LENTES',
  'BATERIAS', 'MONITOREO', 'FILTROS', 'ACCESORIOS DE CAMARA', 'SONIDO',
];

export default function ProductosPOS({ usuario }) {
  // ===== Descuento =====
  const [discount, setDiscount] = useState('0');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // ===== Pedido / separador =====
  const [pedidoNumero, setPedidoNumero] = useState('');
  const [grupoActual, setGrupoActual] = useState('');

  // ===== Cliente =====
  const initialClienteForm = {
    nombre: '',
    fechaRetiro: '',
    fechaDevolucion: '',
  };
  const [clienteForm, setClienteForm] = useState(initialClienteForm);
  const [cliente, setCliente] = useState({});

  // ===== Carrito =====
  const [carrito, setCarrito] = useState(() =>
    JSON.parse(localStorage.getItem('carrito') || '[]')
  );
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  // ===== Jornadas =====
  const [jornadasMap, setJornadasMap] = useState({});

  // ===== Logic: Guardar/Cargar =====
  const handleGuardarPedido = async () => {
    const nro = String(pedidoNumero || "").trim();
    if (!nro) return alert('Ingresá un "Pedido N°" para guardar.');
    if (carrito.length === 0) return alert("El carrito está vacío.");

    const totalConJornadas = carrito.reduce((sum, item, idx) => {
      const qty = parseInt(item.cantidad, 10) || 0;
      const j = parseInt(jornadasMap[idx], 10) || 1;
      const price = parseFloat(item.precio) || 0;
      return sum + qty * price * j;
    }, 0);
    const totalFinal = totalConJornadas * (1 - appliedDiscount / 100);

    try {
      await createOrUpdateOrder({
        pedidoNumero: nro,
        cliente: clienteForm,
        carrito,
        jornadasMap,
        usuario,
        descuento: appliedDiscount,
        descuentoLabel: discount,
        totalFinal,
      });
      alert("Pedido guardado correctamente ☁️");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el pedido.");
    }
  };

  const handleCargarPedido = async () => {
    const nro = String(pedidoNumero || "").trim();
    if (!nro) return alert('Ingresá un "Pedido N°" para cargar.');
    try {
      const data = await getOrder(nro);
      if (!data) return alert("No se encontró ningún pedido con ese número.");

      setClienteForm(data.cliente || initialClienteForm);
      setCarrito(data.carrito || []);
      setJornadasMap(data.jornadasMap || {});
      setAppliedDiscount(data.descuento || 0);
      setDiscount(data.descuentoLabel || '0');
      setGrupoActual("");
      alert("Pedido cargado correctamente ✅");
    } catch (err) {
      console.error(err);
      alert("Error al cargar el pedido.");
    }
  };

  // ===== Lista de pedidos Modal =====
  const [openListaPedidos, setOpenListaPedidos] = useState(false);
  const handleSeleccionarPedidoDesdeLista = (pedido) => {
    if (!pedido) return;
    setPedidoNumero(pedido.pedidoNumero || "");
    setClienteForm(pedido.cliente || initialClienteForm);
    setCarrito(pedido.carrito || []);
    setJornadasMap(pedido.jornadasMap || {});
    setAppliedDiscount(pedido.descuento || 0);
    setDiscount(pedido.descuentoLabel || '0');
    setGrupoActual("");
  };

  // ===== Categorías nav (editables) =====
  const [categoriasNav, setCategoriasNav] = useState(() => {
    const saved = localStorage.getItem('categoriasNav');
    return saved ? JSON.parse(saved) : defaultCats;
  });
  useEffect(() => {
    localStorage.setItem('categoriasNav', JSON.stringify(categoriasNav));
  }, [categoriasNav]);

  const [openEditCats, setOpenEditCats] = useState(false);
  const handleCatChange = (idx, val) =>
    setCategoriasNav((c) => {
      const cc = [...c];
      cc[idx] = val;
      return cc;
    });

  // ===== Productos Fetch =====
  const [productosRaw, setProductosRaw] = useState([]);
  const [productos, setProductos] = useState([]);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    getProducts()
      .then((raw) => {
        setProductosRaw(raw);
        const grouped = raw.reduce((acc, p) => {
          if (!acc[p.nombre]) {
            acc[p.nombre] = { ...p, seriales: [], valorReposicion: p.valorReposicion };
          }
          if (p.serial) acc[p.nombre].seriales.push(p.serial);
          if (p.valorReposicion > (acc[p.nombre].valorReposicion || 0)) {
            acc[p.nombre].valorReposicion = p.valorReposicion;
          }
          return acc;
        }, {});
        setProductos(Object.values(grouped));
      })
      .finally(() => setIsSliding(false));
  }, []);

  // ===== Filtros =====
  const [buscar, setBuscar] = useState('');
  const [favorita, setFavorita] = useState('');
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    setSugerencias(
      productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
          (!favorita || p.categoria === favorita)
      )
    );
  }, [productos, buscar, favorita]);

  // ===== Slider Logic =====
  const [rows, setRows] = useState(1);
  const sliderRef = useRef(null);
  const HEADER = 72;
  const FOOTER = 72;
  const CARD_HEIGHT = 180;
  const ROW_GAP = 16;
  const SLIDES_PER_ROW = window.innerWidth < 768 ? 3 : window.innerWidth < 1024 ? 4 : 5;

  useEffect(() => {
    const calcularFilas = () => {
      const alto = window.innerHeight - HEADER - FOOTER - ROW_GAP;
      setRows(Math.max(1, Math.floor(alto / (CARD_HEIGHT + ROW_GAP))));
    };
    calcularFilas();
    window.addEventListener('resize', calcularFilas);
    return () => window.removeEventListener('resize', calcularFilas);
  }, []);

  useEffect(() => {
    sliderRef.current?.slickGoTo(0);
  }, [buscar, favorita, rows, sugerencias.length]);

  const settings = {
    arrows: true,
    infinite: false,
    rows,
    slidesPerRow: SLIDES_PER_ROW,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 600,
    cssEase: 'ease-in-out',
    beforeChange: (o, n) => o !== n && setIsSliding(true),
    afterChange: () => setIsSliding(false),
  };

  // ===== Add to Cart Logic =====
  const agregarAlCarritoConSerial = (prod, serial) => {
    setCarrito((c) => [
      ...c,
      {
        ...prod,
        serial,
        cantidad: 1,
        grupo: (grupoActual || '').trim(),
      },
    ]);
  };

  // ===== Serial Dialog =====
  const [openSerialDialog, setOpenSerialDialog] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [selectedSerial, setSelectedSerial] = useState('');

  const handleCardClick = (prod) => {
    if (isSliding) return;
    const seriales = Array.isArray(prod.seriales) ? prod.seriales : [];
    if (seriales.length === 0) {
      agregarAlCarritoConSerial(prod, '');
      return;
    }
    if (seriales.length === 1) {
      agregarAlCarritoConSerial(prod, seriales[0]);
      return;
    }
    setPendingProduct(prod);
    setSelectedSerial(seriales[0] || '');
    setOpenSerialDialog(true);
  };

  const handleConfirmSerial = () => {
    if (pendingProduct) {
      agregarAlCarritoConSerial(pendingProduct, selectedSerial || '');
    }
    setOpenSerialDialog(false);
    setPendingProduct(null);
    setSelectedSerial('');
  };

  // ===== PDFs =====
  const handleGenerarRemito = () => {
    if (!pedidoNumero) return alert('Ingresá un "Pedido N°".');
    generarRemitoPDF({ ...clienteForm, nombre: clienteForm.nombre?.trim() }, carrito, pedidoNumero, pedidoNumero, jornadasMap);
  };

  const handleGenerarPresupuesto = async () => {
    if (!pedidoNumero) return alert('Ingresá un "Pedido N°".');
    if (carrito.length === 0) return alert('Carrito vacío.');
    try {
      await createOrUpdateOrder({
        pedidoNumero: String(pedidoNumero).trim(),
        cliente: clienteForm,
        carrito,
        jornadasMap,
        usuario,
        tipo: 'presupuesto',
        fechaCreacion: new Date().toISOString(),
      });
      generarPresupuestoPDF({ ...clienteForm, nombre: clienteForm.nombre?.trim() }, carrito, jornadasMap, new Date().toLocaleDateString('es-AR'), pedidoNumero);
      setJornadasMap({});
    } catch (e) {
      console.error(e);
      alert('Error guardando presupuesto.');
    }
  };

  const handleGenerarSeguro = () => {
    if (!pedidoNumero) return alert('Ingresá un "Pedido N°".');
    generarSeguroPDF({ ...clienteForm, nombre: clienteForm.nombre?.trim() }, carrito, new Date().toLocaleDateString('es-AR'), pedidoNumero, pedidoNumero, jornadasMap);
  };

  return (
    <div className="flex flex-col h-screen bg-dark-900 overflow-hidden text-white font-sans">
      {/* HEADER */}
      <div className="flex-none h-[72px] bg-dark-900 border-b border-white/10 flex items-center px-4 z-40 relative">
        <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Cliente Inputs */}
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder="Nombre Cliente"
                value={clienteForm.nombre}
                onChange={e => setClienteForm(prev => ({ ...prev, nombre: e.target.value }))}
                className="input-field pl-9 py-2 w-48 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-500 ml-1">Retiro</label>
              <input
                type="datetime-local"
                value={clienteForm.fechaRetiro}
                onChange={e => setClienteForm(prev => ({ ...prev, fechaRetiro: e.target.value }))}
                className="input-field py-1 px-2 text-xs w-40"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-500 ml-1">Devolución</label>
              <input
                type="datetime-local"
                value={clienteForm.fechaDevolucion}
                onChange={e => setClienteForm(prev => ({ ...prev, fechaDevolucion: e.target.value }))}
                className="input-field py-1 px-2 text-xs w-40"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={buscar}
                onChange={e => setBuscar(e.target.value)}
                className="input-field pl-10 py-2 w-64"
              />
            </div>
            <img src={logoImg} alt="logo" className="h-12 opacity-90" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Carrito */}
        <div className="w-[30%] min-w-[320px] max-w-[450px] bg-dark-900 border-r border-white/10 pb-[72px]">
          <Carrito
            productosSeleccionados={carrito}
            onIncrementar={(i) => {
              const c = [...carrito]; c[i].cantidad++; setCarrito(c);
            }}
            onDecrementar={(i) => {
              const c = [...carrito];
              if (c[i].cantidad > 1) c[i].cantidad--;
              setCarrito(c);
            }}
            onCantidadChange={(i, v) => {
              const c = [...carrito];
              c[i].cantidad = v === '' ? '' : Math.max(1, parseInt(v, 10));
              setCarrito(c);
            }}
            onEliminar={(i) => {
              const c = [...carrito]; c.splice(i, 1); setCarrito(c);
              // Fix mapping logic for jornadas if needed, simplified here
              const newMap = {};
              Object.keys(jornadasMap).forEach(k => {
                const idx = parseInt(k);
                if (idx < i) newMap[idx] = jornadasMap[idx];
                else if (idx > i) newMap[idx - 1] = jornadasMap[idx];
              });
              setJornadasMap(newMap);
            }}
            jornadasMap={jornadasMap}
            setJornadasMap={setJornadasMap}
            pedidoNumero={pedidoNumero}
            setPedidoNumero={setPedidoNumero}
            setGrupoActual={setGrupoActual}
            discount={discount}
            setDiscount={setDiscount}
            appliedDiscount={appliedDiscount}
            setAppliedDiscount={setAppliedDiscount}
            onClearAll={() => {
              setCarrito([]);
              setJornadasMap({});
              setAppliedDiscount(0);
              setDiscount('0');
            }}
          />
        </div>

        {/* Right: Productos */}
        <div className="flex-1 bg-dark-800 relative pb-[72px] overflow-hidden flex flex-col">
          {/* Categories Sticky */}
          <div className="flex-none p-2 bg-dark-800/95 backdrop-blur z-30 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/5">
            <button
              onClick={() => setFavorita('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${!favorita ? 'bg-primary text-dark-900' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              TODAS
            </button>
            {categoriasNav.map((cat, i) => (
              <button
                key={i}
                onClick={() => setFavorita(favorita === cat ? '' : cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${favorita === cat ? 'bg-primary text-dark-900' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
              >
                {cat}
              </button>
            ))}
            <button onClick={() => setOpenEditCats(true)} className="ml-auto p-2 text-gray-400 hover:text-white">
              <Settings size={20} />
            </button>
          </div>

          {/* Products Grid/Slider */}
          <div className="flex-1 overflow-hidden p-4">
            <Slider ref={sliderRef} {...settings} className="h-full">
              {sugerencias.map((p, i) => (
                <div key={i} className="px-2 pb-4 h-full">
                  <div
                    onClick={() => handleCardClick(p)}
                    className={`
                             h-[180px] bg-dark-700/50 hover:bg-dark-600 border border-white/5 hover:border-primary/30 
                             rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer group
                             ${isSliding ? 'opacity-50 pointer-events-none' : ''}
                          `}
                  >
                    <h3 className="font-bold text-gray-200 group-hover:text-white leading-tight line-clamp-3">
                      {p.nombre}
                    </h3>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-primary">
                        ${(parseFloat(p.precio) || 0).toFixed(0)}
                      </div>
                      {p.seriales.length > 0 && (
                        <span className="text-xs bg-black/30 px-2 py-1 rounded text-gray-400">
                          {p.seriales.length} s/n
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <BottomNav
        onOpenCliente={() => { }} // Inputs are in header now
        onGenerarRemito={handleGenerarRemito}
        onGenerarPresupuesto={handleGenerarPresupuesto}
        onGenerarSeguro={handleGenerarSeguro}
        onGuardarPedido={handleGuardarPedido}
        onCargarPedido={handleCargarPedido}
        onVerTodosPedidos={() => setOpenListaPedidos(true)}
        onCancelar={() => {
          if (window.confirm('¿Borrar todo?')) {
            setCarrito([]);
            setClienteForm(initialClienteForm);
            setPedidoNumero('');
            setJornadasMap({});
          }
        }}
      />

      {/* MODALS */}
      {/* Edit Categories */}
      {openEditCats && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpenEditCats(false)} />
          <div className="card w-full max-w-md relative z-10 animate-fade-in-up">
            <h3 className="text-lg font-bold mb-4">Editar Categorías</h3>
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
              {categoriasNav.map((cat, idx) => (
                <input
                  key={idx}
                  value={cat}
                  onChange={(e) => handleCatChange(idx, e.target.value)}
                  className="input-field py-2 text-sm"
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setOpenEditCats(false)} className="btn-primary py-2 px-6">Listo</button>
            </div>
          </div>
        </div>
      )}

      {/* Serial Selection */}
      {openSerialDialog && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpenSerialDialog(false)} />
          <div className="card w-full max-w-sm relative z-10 animate-fade-in-up">
            <h3 className="text-lg font-bold mb-1">Seleccionar Serial</h3>
            <p className="text-sm text-gray-400 mb-4">{pendingProduct?.nombre}</p>

            <div className="space-y-2">
              {(pendingProduct?.seriales || []).map((s, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="serial"
                    value={s}
                    checked={selectedSerial === s}
                    onChange={(e) => setSelectedSerial(e.target.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-gray-200">{s}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpenSerialDialog(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
              <button
                onClick={handleConfirmSerial}
                disabled={!selectedSerial}
                className="btn-primary py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista Pedidos */}
      <ListaPedidosModal
        open={openListaPedidos}
        onClose={() => setOpenListaPedidos(false)}
        onSelectPedido={handleSeleccionarPedidoDesdeLista}
      />
    </div>
  );
}
