import React, { useState, useEffect } from 'react';
import { X, Search, RefreshCw, Calendar, Loader2 } from 'lucide-react';
import { obtenerTodosPedidosFirebase } from '../services/pedidosService';

export default function ListaPedidosModal({ open, onClose, onSelectPedido }) {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    useEffect(() => {
        if (open) {
            cargarPedidos();
        }
    }, [open]);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await obtenerTodosPedidosFirebase();
            setPedidos(data);
        } catch (error) {
            console.error("Error cargando pedidos:", error);
            alert("Error cargando pedidos");
        } finally {
            setLoading(false);
        }
    };

    const handleSeleccionar = (pedido) => {
        if (onSelectPedido) {
            onSelectPedido(pedido);
        }
        onClose();
    };

    // Filtrado
    const pedidosFiltrados = pedidos.filter((p) => {
        const term = busqueda.toLowerCase();
        const nro = String(p.pedidoNumero || '').toLowerCase();
        const cliente = (p.cliente?.nombre || '').toLowerCase();
        const matchTexto = nro.includes(term) || cliente.includes(term);

        let matchFecha = true;
        const ts = p.actualizadoEn || p.creadoEn;
        if (ts) {
            const fechaPedido = new Date(ts);
            if (fechaInicio) {
                const fInicio = new Date(fechaInicio);
                if (fechaPedido < fInicio) matchFecha = false;
            }
            if (fechaFin) {
                const fFin = new Date(fechaFin);
                fFin.setHours(23, 59, 59, 999);
                if (fechaPedido > fFin) matchFecha = false;
            }
        }

        return matchTexto && matchFecha;
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold text-white">Todos los Pedidos</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar N° o Cliente"
                            className="input-field pl-10 py-2 text-sm"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-3 relative">
                        <input
                            type="date"
                            className="input-field py-2 text-sm"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-3 relative">
                        <input
                            type="date"
                            className="input-field py-2 text-sm"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <button
                            onClick={cargarPedidos}
                            className="w-full h-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                            title="Recargar"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto min-h-[300px] border border-white/5 rounded-xl bg-black/20">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                            <Loader2 className="animate-spin" size={40} />
                            <p>Cargando pedidos...</p>
                        </div>
                    ) : pedidosFiltrados.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No se encontraron pedidos.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {pedidosFiltrados.map((p) => {
                                const ts = p.actualizadoEn || p.creadoEn;
                                const fechaStr = ts ? new Date(ts).toLocaleString() : 'Sin fecha';
                                const totalItems = (p.carrito || []).reduce((acc, item) => acc + (item.cantidad || 0), 0);

                                let totalVisual = p.totalFinal;
                                if (totalVisual === undefined) {
                                    const items = p.carrito || [];
                                    const mapJornadas = p.jornadasMap || {};
                                    const subTotal = items.reduce((sum, item, idx) => {
                                        const qty = parseInt(item.cantidad, 10) || 0;
                                        const j = parseInt(mapJornadas[idx], 10) || 1;
                                        const price = parseFloat(item.precio) || 0;
                                        return sum + qty * price * j;
                                    }, 0);
                                    const desc = p.descuento || 0;
                                    totalVisual = subTotal * (1 - desc / 100);
                                }

                                return (
                                    <div
                                        key={p.id || p.pedidoNumero}
                                        className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-white text-lg">#{p.pedidoNumero}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">{totalItems} items</span>
                                            </div>
                                            <div className="text-gray-400 text-sm mb-1">
                                                Cliente: <span className="text-gray-200">{p.cliente?.nombre || 'Anónimo'}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {fechaStr}</span>
                                                <span className="text-primary font-bold text-sm">
                                                    Total: ${totalVisual?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSeleccionar(p)}
                                            className="btn-secondary py-2 px-4 shadow-none opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0"
                                        >
                                            Cargar
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="text-gray-400 hover:text-white px-4 py-2">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
