'use client';
import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import BotonesReporte from '@/components/BotonesReporte';

interface Proveedor { id: number; nombre: string; identificacion: string; email: string; telefono: string; }
interface Producto { id: number; nombre: string; codigo: string; precio_compra: number; }
interface DetalleForm { producto: number; producto_nombre: string; cantidad: number; precio_unitario: number; }
interface OrdenCompra { id: number; numero: string; proveedor: number; proveedor_nombre: string; fecha: string; fecha_entrega: string; estado: string; total: number; }

const estadoColor: Record<string, string> = {
  borrador: 'bg-slate-100 text-slate-600', enviada: 'bg-sky-100 text-sky-700',
  recibida: 'bg-emerald-100 text-emerald-700', anulada: 'bg-red-100 text-red-600',
};
const emptyProveedor = { nombre: '', identificacion: '', email: '', telefono: '' };

export default function ComprasPage() {
  const [compras, setCompras] = useState<OrdenCompra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modal, setModal] = useState<'compra' | 'proveedor' | null>(null);
  const [proveedorForm, setProveedorForm] = useState(emptyProveedor);
  const [proveedorId, setProveedorId] = useState(0);
  const [estado, setEstado] = useState('borrador');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [notas, setNotas] = useState('');
  const [detalles, setDetalles] = useState<DetalleForm[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/compras/').then(d => setCompras(d.results ?? d));
    api.get('/compras/proveedores/').then(d => setProveedores(d.results ?? d));
    api.get('/productos/').then(d => setProductos(d.results ?? d));
  };
  useEffect(() => { load(); }, []);

  const openNuevaCompra = () => {
    setProveedorId(0); setEstado('borrador'); setFechaEntrega(''); setNotas(''); setDetalles([]); setModal('compra');
  };

  const agregarDetalle = () => setDetalles([...detalles, { producto: 0, producto_nombre: '', cantidad: 1, precio_unitario: 0 }]);

  const actualizarDetalle = (i: number, campo: keyof DetalleForm, valor: number | string) => {
    const nuevos = [...detalles];
    if (campo === 'producto') {
      const prod = productos.find(p => p.id === Number(valor));
      nuevos[i] = { ...nuevos[i], producto: Number(valor), producto_nombre: prod?.nombre ?? '', precio_unitario: prod?.precio_compra ?? 0 };
    } else {
      nuevos[i] = { ...nuevos[i], [campo]: valor };
    }
    setDetalles(nuevos);
  };

  const eliminarDetalle = (i: number) => setDetalles(detalles.filter((_, idx) => idx !== i));
  const subtotalDetalle = (d: DetalleForm) => d.cantidad * d.precio_unitario;
  const totalOrden = detalles.reduce((acc, d) => acc + subtotalDetalle(d), 0);

  const guardarCompra = async () => {
    if (!proveedorId) return alert('Selecciona un proveedor');
    if (detalles.length === 0) return alert('Agrega al menos un producto');
    setLoading(true);
    const res = await api.post('/compras/', {
      proveedor: proveedorId,
      estado,
      fecha_entrega: fechaEntrega || null,
      notas,
      detalles: detalles.map(d => ({
        producto: d.producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
      })),
    });
    if (res.id) { setModal(null); load(); }
    else alert(JSON.stringify(res));
    setLoading(false);
  };

  const guardarProveedor = async () => {
    setLoading(true);
    const nuevo = await api.post('/compras/proveedores/', proveedorForm);
    setProveedores([...proveedores, nuevo]);
    setProveedorId(nuevo.id);
    setModal('compra');
    setLoading(false);
  };

  const eliminarCompra = async (id: number) => {
    if (!confirm('¿Eliminar esta orden?')) return;
    await api.delete(`/compras/${id}/`); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><ShoppingCart className="text-orange-600" /> Compras</h1>
          <p className="text-slate-500 mt-1">Gestión de órdenes de compra y proveedores</p>
        </div>
        <button onClick={openNuevaCompra} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Nueva Orden
        </button>
        <BotonesReporte modulo="compras" />
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 text-orange-700">
            <tr>{['Número', 'Proveedor', 'Fecha', 'Entrega', 'Estado', 'Total', ''].map(h => (
              <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {compras.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">No hay órdenes registradas</td></tr>
            ) : compras.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-mono text-orange-600">{c.numero}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{c.proveedor_nombre}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(c.fecha).toLocaleDateString('es')}</td>
                <td className="px-6 py-4 text-slate-500">{c.fecha_entrega ? new Date(c.fecha_entrega).toLocaleDateString('es') : '—'}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColor[c.estado]}`}>{c.estado}</span></td>
                <td className="px-6 py-4 font-bold text-slate-800">${Number(c.total).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <button onClick={() => eliminarCompra(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Orden */}
      {modal === 'compra' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-800">Nueva Orden de Compra</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">

              {/* Proveedor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Proveedor</label>
                  <button onClick={() => { setProveedorForm(emptyProveedor); setModal('proveedor'); }}
                    className="text-xs text-orange-600 hover:underline flex items-center gap-1">
                    <Plus size={12} /> Nuevo proveedor
                  </button>
                </div>
                <select value={proveedorId} onChange={e => setProveedorId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                  <option value={0}>Seleccionar proveedor</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre} — {p.identificacion}</option>)}
                </select>
              </div>

              {/* Estado y Fecha entrega */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Estado</label>
                  <select value={estado} onChange={e => setEstado(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                    {['borrador', 'enviada', 'recibida', 'anulada'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Fecha de Entrega</label>
                  <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
              </div>

              {/* Productos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Productos</label>
                  <button onClick={agregarDetalle} className="text-xs text-orange-600 hover:underline flex items-center gap-1">
                    <Plus size={12} /> Agregar producto
                  </button>
                </div>
                {detalles.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">
                    Haz clic en "Agregar producto"
                  </p>
                )}
                <div className="space-y-3">
                  {detalles.map((d, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-xl">
                      <div className="col-span-5">
                        <select value={d.producto} onChange={e => actualizarDetalle(i, 'producto', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs">
                          <option value={0}>Producto</option>
                          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" placeholder="Cant." value={d.cantidad}
                          onChange={e => actualizarDetalle(i, 'cantidad', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" placeholder="Precio" value={d.precio_unitario}
                          onChange={e => actualizarDetalle(i, 'precio_unitario', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs" />
                      </div>
                      <div className="col-span-2 text-xs font-semibold text-orange-600 text-right">
                        ${subtotalDetalle(d).toLocaleString()}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button onClick={() => eliminarDetalle(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                {detalles.length > 0 && (
                  <div className="flex justify-end mt-3 text-sm font-bold text-slate-800">
                    Total: <span className="text-orange-600 ml-2">${totalOrden.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="text-sm font-medium text-slate-700">Notas</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
                <button onClick={guardarCompra} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition disabled:opacity-60">
                  {loading ? 'Guardando...' : 'Guardar Orden'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Proveedor */}
      {modal === 'proveedor' && (
        <Modal title="Nuevo Proveedor" onClose={() => setModal('compra')}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Nombre</label>
                <input value={proveedorForm.nombre} onChange={e => setProveedorForm({ ...proveedorForm, nombre: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Identificación</label>
                <input value={proveedorForm.identificacion} onChange={e => setProveedorForm({ ...proveedorForm, identificacion: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={proveedorForm.email} onChange={e => setProveedorForm({ ...proveedorForm, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <input value={proveedorForm.telefono} onChange={e => setProveedorForm({ ...proveedorForm, telefono: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal('compra')} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={guardarProveedor} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition disabled:opacity-60">
                {loading ? 'Guardando...' : 'Crear Proveedor'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
