'use client';
import { useEffect, useState } from 'react';
import { Warehouse, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import BotonesReporte from '@/components/BotonesReporte';

interface Almacen { id: number; nombre: string; ubicacion: string; activo: boolean; }
interface Stock { id: number; producto_nombre: string; almacen_nombre: string; cantidad: number; }
interface Movimiento { id: number; tipo: string; producto: number; almacen: number; cantidad: number; referencia: string; notas: string; fecha: string; }
interface Producto { id: number; nombre: string; }

const emptyAlmacen = { id: 0, nombre: '', ubicacion: '', activo: true };
const emptyMov = { id: 0, tipo: 'entrada', producto: 0, almacen: 0, cantidad: 0, referencia: '', notas: '', fecha: '' };
const tipoColor: Record<string, string> = {
  entrada: 'bg-emerald-100 text-emerald-700', salida: 'bg-red-100 text-red-600',
  ajuste: 'bg-sky-100 text-sky-700', traslado: 'bg-violet-100 text-violet-700',
};

export default function InventarioPage() {
  const [stock, setStock] = useState<Stock[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tab, setTab] = useState<'stock' | 'almacenes' | 'movimientos'>('stock');
  const [modal, setModal] = useState<'almacen' | 'movimiento' | null>(null);
  const [formAlmacen, setFormAlmacen] = useState<Almacen>(emptyAlmacen);
  const [formMov, setFormMov] = useState<Movimiento>(emptyMov);
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/inventario/stock/').then(d => setStock(d.results ?? d));
    api.get('/inventario/almacenes/').then(d => setAlmacenes(d.results ?? d));
    api.get('/inventario/movimientos/').then(d => setMovimientos(d.results ?? d));
    api.get('/productos/').then(d => setProductos(d.results ?? d));
  };
  useEffect(() => { load(); }, []);

  const saveAlmacen = async () => {
    setLoading(true);
    if (formAlmacen.id) await api.put(`/inventario/almacenes/${formAlmacen.id}/`, formAlmacen);
    else await api.post('/inventario/almacenes/', formAlmacen);
    setModal(null); load(); setLoading(false);
  };

  const saveMov = async () => {
    setLoading(true);
    await api.post('/inventario/movimientos/', formMov);
    setModal(null); load(); setLoading(false);
  };

  const removeAlmacen = async (id: number) => {
    if (!confirm('¿Eliminar este almacén?')) return;
    await api.delete(`/inventario/almacenes/${id}/`); load();
  };

  const tabs = [
    { key: 'stock', label: 'Stock Actual' },
    { key: 'almacenes', label: 'Almacenes' },
    { key: 'movimientos', label: 'Movimientos' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><Warehouse className="text-violet-600" /> Inventario</h1>
          <p className="text-slate-500 mt-1">Stock, almacenes y movimientos</p>
        </div>
        <div className="flex gap-2">
          {tab === 'almacenes' && (
            <button onClick={() => { setFormAlmacen(emptyAlmacen); setModal('almacen'); }}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <Plus size={16} /> Nuevo Almacén
            </button>
          )}
          {tab === 'movimientos' && (
            <button onClick={() => { setFormMov(emptyMov); setModal('movimiento'); }}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <Plus size={16} /> Nuevo Movimiento
            </button>
          )}
          <BotonesReporte modulo="inventario" />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-violet-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {tab === 'stock' && (
          <table className="w-full text-sm">
            <thead className="bg-violet-50 text-violet-700">
              <tr>{['Producto', 'Almacén', 'Cantidad'].map(h => <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stock.length === 0 ? <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">Sin stock registrado</td></tr>
                : stock.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{s.producto_nombre}</td>
                    <td className="px-6 py-4 text-slate-500">{s.almacen_nombre}</td>
                    <td className="px-6 py-4"><span className={`font-bold ${Number(s.cantidad) <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>{s.cantidad}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {tab === 'almacenes' && (
          <table className="w-full text-sm">
            <thead className="bg-violet-50 text-violet-700">
              <tr>{['Nombre', 'Ubicación', 'Estado', ''].map(h => <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {almacenes.length === 0 ? <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Sin almacenes registrados</td></tr>
                : almacenes.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{a.nombre}</td>
                    <td className="px-6 py-4 text-slate-500">{a.ubicacion || '—'}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${a.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{a.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => { setFormAlmacen(a); setModal('almacen'); }} className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-600 transition"><Pencil size={15} /></button>
                      <button onClick={() => removeAlmacen(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {tab === 'movimientos' && (
          <table className="w-full text-sm">
            <thead className="bg-violet-50 text-violet-700">
              <tr>{['Fecha', 'Tipo', 'Cantidad', 'Referencia', 'Notas'].map(h => <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.length === 0 ? <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Sin movimientos registrados</td></tr>
                : movimientos.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{new Date(m.fecha).toLocaleDateString('es')}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${tipoColor[m.tipo]}`}>{m.tipo}</span></td>
                    <td className="px-6 py-4 font-bold text-slate-800">{m.cantidad}</td>
                    <td className="px-6 py-4 text-slate-500">{m.referencia || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">{m.notas || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'almacen' && (
        <Modal title={formAlmacen.id ? 'Editar Almacén' : 'Nuevo Almacén'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <input value={formAlmacen.nombre} onChange={e => setFormAlmacen({ ...formAlmacen, nombre: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Ubicación</label>
              <input value={formAlmacen.ubicacion} onChange={e => setFormAlmacen({ ...formAlmacen, ubicacion: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="activo" checked={formAlmacen.activo} onChange={e => setFormAlmacen({ ...formAlmacen, activo: e.target.checked })} />
              <label htmlFor="activo" className="text-sm text-slate-700">Activo</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={saveAlmacen} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition disabled:opacity-60">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'movimiento' && (
        <Modal title="Nuevo Movimiento" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Tipo</label>
                <select value={formMov.tipo} onChange={e => setFormMov({ ...formMov, tipo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                  {['entrada', 'salida', 'ajuste', 'traslado'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Cantidad</label>
                <input type="number" value={formMov.cantidad} onChange={e => setFormMov({ ...formMov, cantidad: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Producto</label>
              <select value={formMov.producto} onChange={e => setFormMov({ ...formMov, producto: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                <option value={0}>Seleccionar producto</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Almacén</label>
              <select value={formMov.almacen} onChange={e => setFormMov({ ...formMov, almacen: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                <option value={0}>Seleccionar almacén</option>
                {almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Referencia</label>
              <input value={formMov.referencia} onChange={e => setFormMov({ ...formMov, referencia: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={saveMov} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition disabled:opacity-60">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
