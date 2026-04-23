'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import BotonesReporte from '@/components/BotonesReporte';

interface Cliente { id: number; nombre: string; identificacion: string; email: string; telefono: string; }
interface Producto { id: number; nombre: string; codigo: string; precio_venta: number; }
interface DetalleForm { producto: number; producto_nombre: string; cantidad: number; precio_unitario: number; descuento: number; }
interface Venta { id: number; numero: string; cliente: number; cliente_nombre: string; fecha: string; estado: string; total: number; notas: string; }

const estadoColor: Record<string, string> = {
  borrador: 'bg-slate-100 text-slate-600',
  confirmada: 'bg-sky-100 text-sky-700',
  facturada: 'bg-emerald-100 text-emerald-700',
  anulada: 'bg-red-100 text-red-600',
};

const emptyCliente = { nombre: '', identificacion: '', email: '', telefono: '' };

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modal, setModal] = useState<'venta' | 'cliente' | null>(null);
  const [clienteForm, setClienteForm] = useState(emptyCliente);
  const [clienteId, setClienteId] = useState(0);
  const [estado, setEstado] = useState('borrador');
  const [notas, setNotas] = useState('');
  const [detalles, setDetalles] = useState<DetalleForm[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/ventas/').then(d => setVentas(d.results ?? d));
    api.get('/ventas/clientes/').then(d => setClientes(d.results ?? d));
    api.get('/productos/').then(d => setProductos(d.results ?? d));
  };
  useEffect(() => { load(); }, []);

  const openNuevaVenta = () => {
    setClienteId(0); setEstado('borrador'); setNotas(''); setDetalles([]); setModal('venta');
  };

  const agregarDetalle = () => {
    setDetalles([...detalles, { producto: 0, producto_nombre: '', cantidad: 1, precio_unitario: 0, descuento: 0 }]);
  };

  const actualizarDetalle = (i: number, campo: keyof DetalleForm, valor: number | string) => {
    const nuevos = [...detalles];
    if (campo === 'producto') {
      const prod = productos.find(p => p.id === Number(valor));
      nuevos[i] = { ...nuevos[i], producto: Number(valor), producto_nombre: prod?.nombre ?? '', precio_unitario: prod?.precio_venta ?? 0 };
    } else {
      nuevos[i] = { ...nuevos[i], [campo]: valor };
    }
    setDetalles(nuevos);
  };

  const eliminarDetalle = (i: number) => setDetalles(detalles.filter((_, idx) => idx !== i));

  const subtotalDetalle = (d: DetalleForm) => d.cantidad * d.precio_unitario * (1 - d.descuento / 100);
  const totalVenta = detalles.reduce((acc, d) => acc + subtotalDetalle(d), 0);

  const guardarVenta = async () => {
    if (!clienteId) return alert('Selecciona un cliente');
    if (detalles.length === 0) return alert('Agrega al menos un producto');
    setLoading(true);
    await api.post('/ventas/', {
      cliente: clienteId,
      estado,
      notas,
      detalles: detalles.map(d => ({
        producto: d.producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        descuento: d.descuento,
        subtotal: subtotalDetalle(d),
      })),
    });
    setModal(null); load(); setLoading(false);
  };

  const guardarCliente = async () => {
    setLoading(true);
    const nuevo = await api.post('/ventas/clientes/', clienteForm);
    setClientes([...clientes, nuevo]);
    setClienteId(nuevo.id);
    setModal('venta');
    setLoading(false);
  };

  const eliminarVenta = async (id: number) => {
    if (!confirm('¿Eliminar esta venta?')) return;
    await api.delete(`/ventas/${id}/`); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="text-emerald-600" /> Ventas</h1>
          <p className="text-slate-500 mt-1">Gestión de ventas y clientes</p>
        </div>
        <button onClick={openNuevaVenta} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Nueva Venta
        </button>
        <BotonesReporte modulo="ventas" />
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 text-emerald-700">
            <tr>{['Número', 'Cliente', 'Fecha', 'Estado', 'Total', ''].map(h => (
              <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ventas.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No hay ventas registradas</td></tr>
            ) : ventas.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-mono text-emerald-600">{v.numero}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{v.cliente_nombre}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(v.fecha).toLocaleDateString('es')}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColor[v.estado]}`}>{v.estado}</span></td>
                <td className="px-6 py-4 font-bold text-slate-800">${Number(v.total).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <button onClick={() => eliminarVenta(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Venta */}
      {modal === 'venta' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-800">Nueva Venta</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">

              {/* Cliente */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Cliente</label>
                  <button onClick={() => { setClienteForm(emptyCliente); setModal('cliente'); }}
                    className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                    <Plus size={12} /> Nuevo cliente
                  </button>
                </div>
                <select value={clienteId} onChange={e => setClienteId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                  <option value={0}>Seleccionar cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.identificacion}</option>)}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="text-sm font-medium text-slate-700">Estado</label>
                <select value={estado} onChange={e => setEstado(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                  {['borrador', 'confirmada', 'facturada', 'anulada'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Productos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Productos</label>
                  <button onClick={agregarDetalle} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
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
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs">
                          <option value={0}>Producto</option>
                          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" placeholder="Cant." value={d.cantidad}
                          onChange={e => actualizarDetalle(i, 'cantidad', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" placeholder="Precio" value={d.precio_unitario}
                          onChange={e => actualizarDetalle(i, 'precio_unitario', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs" />
                      </div>
                      <div className="col-span-2 text-xs font-semibold text-emerald-600 text-right">
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
                    Total: <span className="text-emerald-600 ml-2">${totalVenta.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="text-sm font-medium text-slate-700">Notas</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
                <button onClick={guardarVenta} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-60">
                  {loading ? 'Guardando...' : 'Guardar Venta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {modal === 'cliente' && (
        <Modal title="Nuevo Cliente" onClose={() => setModal('venta')}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Nombre</label>
                <input value={clienteForm.nombre} onChange={e => setClienteForm({ ...clienteForm, nombre: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Identificación</label>
                <input value={clienteForm.identificacion} onChange={e => setClienteForm({ ...clienteForm, identificacion: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={clienteForm.email} onChange={e => setClienteForm({ ...clienteForm, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <input value={clienteForm.telefono} onChange={e => setClienteForm({ ...clienteForm, telefono: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal('venta')} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={guardarCliente} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-60">
                {loading ? 'Guardando...' : 'Crear Cliente'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
