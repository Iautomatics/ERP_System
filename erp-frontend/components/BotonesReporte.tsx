'use client';
import { Download } from 'lucide-react';

interface Props {
  modulo: 'productos' | 'inventario' | 'ventas' | 'compras' | 'contabilidad';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function BotonesReporte({ modulo }: Props) {
  const descargar = async (formato: 'csv' | 'xml') => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_URL}/reportes/${modulo}/${formato}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modulo}.${formato}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => descargar('csv')}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition">
        <Download size={13} /> CSV
      </button>
      <button onClick={() => descargar('xml')}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium transition">
        <Download size={13} /> XML
      </button>
    </div>
  );
}
