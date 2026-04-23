'use client';
import { useEffect, useState } from 'react';
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import BotonesReporte from '@/components/BotonesReporte';

interface Categoria { id: number; nombre: string; }
interface Producto {
  id: number; codigo: string; nombre: string; descripcion: string;
  categoria: number | null; categoria_nombre: string;
  precio_compra: number; precio_venta: number; activo: boolean;
}
const empty = { id: 0, codigo: '', nombre: '', descripcion: '', categoria: null, categoria_nombre: '', precio_compra: 0, precio_venta: 0, activo: true };

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Producto>(empty);
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/productos/').then(d => setProductos(d.results ?? d));
    api.get('/productos/categorias/').then(d => setCategorias(d.results ?? d));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setModal(true); };
  const openEdit = (p: Producto) => { setForm(p); setModal(true); };

  const save = async () => {
    setLoading(true);
    if (form.id) await api.put(`/productos/${form.id}/`, form);
    else await api.post('/productos/', form);
    setModal(false);
    load();
    setLoading(false);
  };

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await api.delete(`/productos/${id}/`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><Package className="text-indigo-600" /> Productos</h1>
          <p className="text-slate-500 mt-1">Gestión de productos y categorías</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Nuevo Producto
        </button>
        <BotonesReporte modulo="productos" />
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700">
            <tr>{['Código', 'Nombre', 'Categoría', 'Precio Compra', 'Precio Venta', 'Estado', ''].map(h => (
              <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productos.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">No hay productos registrados</td></tr>
            ) : productos.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-mono text-indigo-600">{p.codigo}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{p.nombre}</td>
                <td className="px-6 py-4 text-slate-500">{p.categoria_nombre}</td>
                <td className="px-6 py-4 text-slate-700">${Number(p.precio_compra).toLocaleString()}</td>
                <td className="px-6 py-4 text-emerald-600 font-semibold">${Number(p.precio_venta).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"><Pencil size={15} /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={form.id ? 'Editar Producto' : 'Nuevo Producto'} onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Código</label>
                <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Nombre</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Categoría</label>
              <select value={form.categoria ?? ''} onChange={e => setForm({ ...form, categoria: Number(e.target.value) || null })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Precio Compra</label>
                <input type="number" value={form.precio_compra} onChange={e => setForm({ ...form, precio_compra: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Precio Venta</label>
                <input type="number" value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} className="rounded" />
              <label htmlFor="activo" className="text-sm text-slate-700">Activo</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={save} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-60">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
