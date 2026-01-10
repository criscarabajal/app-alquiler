import React, { useEffect, useState } from 'react';
import { Plus, Minus, Trash2, MoreVertical, X, Check, Save } from 'lucide-react';

export default function Carrito({
  productosSeleccionados,
  onIncrementar,
  onDecrementar,
  onCantidadChange,
  onEliminar,
  jornadasMap,
  setJornadasMap,
  pedidoNumero,
  setPedidoNumero,
  grupoActual,
  setGrupoActual,
  onClearAll,
  discount,
  setDiscount,
  appliedDiscount,
  setAppliedDiscount
}) {
  const [openIncludes, setOpenIncludes] = useState(false);
  const [serialMap, setSerialMap] = useState({});
  const [massJornadas, setMassJornadas] = useState('');

  useEffect(() => {
    localStorage.setItem('descuento', JSON.stringify(appliedDiscount));
  }, [appliedDiscount]);

  useEffect(() => {
    if (!openIncludes) return;
    const init = {};
    productosSeleccionados.forEach((item, idx) => {
      const opts = Array.isArray(item.seriales) ? item.seriales : [];
      init[idx] = serialMap[idx] ?? opts[0] ?? '';
    });
    setSerialMap(init);
  }, [openIncludes, productosSeleccionados]);

  const handleApplyDiscount = () => {
    if (discount === 'especial') {
      const pwd = prompt('Contraseña:');
      if (pwd !== 'veok') return alert('Contraseña incorrecta');
      const pct = parseFloat(prompt('Porcentaje (0–100):'));
      if (isNaN(pct) || pct < 0 || pct > 100) return alert('Inválido');
      return setAppliedDiscount(pct);
    }
    const pct = parseFloat(discount);
    if (isNaN(pct) || pct < 0 || pct > 100) return alert('Seleccione válido');
    setAppliedDiscount(pct);
  };

  const bumpAllJornadas = (delta) => {
    setJornadasMap(prev => {
      const next = { ...prev };
      productosSeleccionados.forEach((_, idx) => {
        const cur = parseInt(next[idx], 10) || 1;
        next[idx] = Math.max(1, cur + delta);
      });
      return next;
    });
  };

  const applyAllJornadas = (val) => {
    const v = Math.max(1, parseInt(val, 10) || 1);
    setJornadasMap(prev => {
      const next = { ...prev };
      productosSeleccionados.forEach((_, idx) => { next[idx] = v; });
      return next;
    });
  };

  const totalConJornadas = productosSeleccionados.reduce((sum, item, idx) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const j = parseInt(jornadasMap[idx], 10) || 1;
    const price = parseFloat(item.precio) || 0;
    return sum + qty * price * j;
  }, 0);

  const discountAmount = totalConJornadas * (appliedDiscount / 100);
  const finalTotal = totalConJornadas - discountAmount;
  const totalWithIva = finalTotal * 1.21;

  const ordenados = productosSeleccionados.map((p, i) => ({ p, i })).reverse();

  return (
    <div className="h-full flex flex-col bg-dark-900 border-r border-white/10 p-4">
      {/* Header pedido */}
      <div className="flex items-center gap-2 mb-4 bg-dark-800 p-2 rounded-xl border border-white/5">
        <span className="font-bold text-white whitespace-nowrap text-sm">Pedido N°</span>
        <input
          value={pedidoNumero}
          onChange={e => setPedidoNumero(e.target.value)}
          className="bg-transparent border-b border-white/20 text-center text-white w-20 focus:outline-none focus:border-primary font-mono"
          placeholder="000"
        />
        <button
          onClick={() => setOpenIncludes(true)}
          className="ml-auto p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {ordenados.map(({ p: item, i: idx }) => (
          <div key={idx} className="bg-dark-800 rounded-xl p-3 border border-white/5 group hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-200 line-clamp-2 leading-tight">
                {item.nombre}
              </span>
              <button
                onClick={() => onEliminar(idx)}
                className="text-gray-600 hover:text-red-400 transition-colors p-1 -mr-1 -mt-1"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between bg-black/20 rounded-lg p-1">
              <button onClick={() => onDecrementar(idx)} className="p-1 hover:text-white text-gray-400">
                <Minus size={14} />
              </button>
              <input
                value={item.cantidad}
                onChange={e => onCantidadChange(idx, e.target.value)}
                className="w-8 text-center bg-transparent text-sm font-mono focus:outline-none text-white"
              />
              <button onClick={() => onIncrementar(idx)} className="p-1 hover:text-white text-gray-400">
                <Plus size={14} />
              </button>
            </div>
            <div className="text-xs text-right mt-1 text-gray-500 font-mono">
              ${parseFloat(item.precio).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="mt-4 pt-4 border-t border-white/10 text-right space-y-1">
        <div className="text-sm text-gray-400">Subtotal: <span className="text-white">${totalConJornadas.toLocaleString()}</span></div>

        {appliedDiscount > 0 && (
          <div className="text-xs text-primary">
            Descuento ({appliedDiscount}%): -${discountAmount.toLocaleString()}
          </div>
        )}

        <div className="text-xl font-bold text-white">
          ${finalTotal.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">
          + IVA: ${(totalWithIva).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Descuentos y Acciones */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <select
            value={discount}
            onChange={e => setDiscount(e.target.value)}
            className="flex-1 bg-dark-800 text-sm text-gray-300 border border-white/10 rounded-lg px-2 py-2 focus:outline-none focus:border-white/30"
          >
            <option value="0">Sin dcto</option>
            <option value="10">10%</option>
            <option value="20">20%</option>
            <option value="25">25%</option>
            <option value="especial">Especial</option>
          </select>
          <button
            onClick={handleApplyDiscount}
            className="bg-dark-800 border border-white/10 text-white px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors"
          >
            Aplicar
          </button>
        </div>
        <button
          onClick={onClearAll}
          className="w-full py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
        >
          Vaciar Carrito
        </button>
      </div>

      {/* DETALLES DE PRODUCTOS MODAL */}
      {openIncludes && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpenIncludes(false)} />
          <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col relative z-20 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
              <h3 className="font-bold text-lg">Detalles y Jornadas</h3>
              <button onClick={() => setOpenIncludes(false)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-1">
              {/* Mass control */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-dark-800 rounded-xl border border-white/5">
                <span className="text-sm font-bold text-gray-400">Todas las jornadas:</span>
                <button onClick={() => bumpAllJornadas(-1)} className="p-1 bg-black/40 rounded hover:text-white text-gray-400"><Minus size={16} /></button>
                <input
                  type="number"
                  value={massJornadas}
                  onChange={(e) => setMassJornadas(e.target.value)}
                  className="w-12 text-center bg-transparent border-b border-white/20 text-white focus:outline-none"
                />
                <button onClick={() => bumpAllJornadas(1)} className="p-1 bg-black/40 rounded hover:text-white text-gray-400"><Plus size={16} /></button>
                <button onClick={() => applyAllJornadas(massJornadas)} className="ml-auto text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30">Aplicar</button>
              </div>

              {/* List */}
              <div className="space-y-2">
                {[...productosSeleccionados].reverse().map((item, idx) => {
                  const realIdx = productosSeleccionados.length - 1 - idx;
                  const j = jornadasMap[realIdx] || 1;
                  const qty = parseInt(item.cantidad, 10) || 1;

                  return (
                    <div key={realIdx} className="grid grid-cols-[auto_1fr_auto] gap-4 items-center bg-dark-800 p-3 rounded-xl border border-white/5">
                      {/* Qty */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 mb-1">CANT</span>
                        <div className="flex items-center bg-black/40 rounded-lg p-1">
                          <button onClick={() => onDecrementar(realIdx)} disabled={qty <= 1} className="p-1 hover:text-white text-gray-500 disabled:opacity-30"><Minus size={14} /></button>
                          <span className="w-6 text-center text-sm">{qty}</span>
                          <button onClick={() => onIncrementar(realIdx)} className="p-1 hover:text-white text-gray-500"><Plus size={14} /></button>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <div className="font-bold text-sm text-gray-200">{item.nombre}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{item.incluye || 'Sin detalles'}</div>
                      </div>

                      {/* Jornadas */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 mb-1">JORNADAS</span>
                        <div className="flex items-center bg-black/40 rounded-lg p-1">
                          <button onClick={() => setJornadasMap(prev => ({ ...prev, [realIdx]: Math.max(1, j - 1) }))} className="p-1 hover:text-white text-gray-500"><Minus size={14} /></button>
                          <span className="w-6 text-center text-sm font-bold text-primary">{j}</span>
                          <button onClick={() => setJornadasMap(prev => ({ ...prev, [realIdx]: j + 1 }))} className="p-1 hover:text-white text-gray-500"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={() => setOpenIncludes(false)} className="btn-primary py-2 px-6 text-sm">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
