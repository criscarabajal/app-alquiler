// src/components/BottomNav.jsx
import React from 'react';
import { Save, UploadCloud, List, FileCheck, FileText, ShieldCheck, XCircle } from 'lucide-react';

export default function BottomNav({
  onOpenCliente = () => { },
  onGenerarRemito = () => { },
  onGenerarPresupuesto = () => { },
  onGenerarSeguro = () => { },
  onCancelar = () => { },
  onGuardarPedido = () => { },
  onCargarPedido = () => { },
  onVerTodosPedidos = () => { },
}) {
  const ButtonAction = ({ onClick, label, icon: Icon, colorClass }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${colorClass} whitespace-nowrap`}
    >
      {Icon && <Icon size={18} />}
      {label}
    </button>
  );

  return (
    <div className="fixed left-0 right-0 bottom-0 h-[72px] bg-dark-900 border-t border-white/10 flex items-center gap-2 px-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 w-full max-w-[1920px] mx-auto">
        {/* Acciones Principales */}
        <ButtonAction onClick={onGuardarPedido} label="Guardar" icon={Save} colorClass="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" />
        <ButtonAction onClick={onCargarPedido} label="Cargar" icon={UploadCloud} colorClass="bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20" />
        <ButtonAction onClick={onVerTodosPedidos} label="Todos" icon={List} colorClass="bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20" />

        <div className="w-px h-8 bg-white/10 mx-2" />

        {/* Generadores */}
        <ButtonAction onClick={onGenerarSeguro} label="Seguros" icon={ShieldCheck} colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20" />
        <ButtonAction onClick={onGenerarRemito} label="Remito" icon={FileText} colorClass="bg-white/10 text-white border border-white/20 hover:bg-white/20" />
        <ButtonAction onClick={onGenerarPresupuesto} label="Presupuesto" icon={FileCheck} colorClass="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20" />

        <div className="ml-auto">
          <ButtonAction onClick={onCancelar} label="Cancelar" icon={XCircle} colorClass="text-red-400 hover:bg-red-500/10 hover:text-red-300" />
        </div>
      </div>
    </div>
  );
}
