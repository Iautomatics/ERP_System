'use client';
import { useEffect, useState } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import BotonesReporte from '@/components/BotonesReporte';

interface Cuenta { id: number; codigo: string; nombre: string; tipo: string; }
interface Linea { cuenta: number; debe: number; haber: number; descripcion: string; }
interface Asiento { id: number; numero: string; fecha: string; descripcion: string; referencia: string; origen: string; lineas: { id: number; cuenta_codigo: string; cuenta_nombre: string; debe: number; haber: number; }[]; }
interface Balance { codigo: string; nombre: string; tipo: string; debe: number; haber: number; saldo: number; }

const origenColor: Record<string, string> = {
  manual: 'bg-slate-100 text-slate-600',
  venta: 'bg-emerald-100 text-emerald-700',
  compra: 'bg-orange-100 text-orange-700',
};

const tipoColor: Record<string, string> = {
  activo: 'bg-sky-100 text-sky-700',
  pasivo: 'bg-red-100 text-red-600',
  patrimonio: 'bg-violet-100 text-violet-700',
  ingreso: 'bg-emerald-100 text-emerald-700',
  gasto: 'bg-orange-100 text-orange-700',
};

export default function ContabilidadPage() {
  const [tab, setTab] = useState<'asientos' | 'cuentas' | 'balance'>('asientos');
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [balance, setBalance] = useState<Balance[]>([]);
  const [modal, setModal] = useState<'asiento' | 'cuenta' | null>(null);
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [lineas, setLineas] = useState<Linea[]>([{ cuenta: 0, debe: 0, haber: 0, descripcion: '' }]);
  const [cuentaForm, setCuentaForm] = useState({ codigo: '', nombre: '', tipo: 'activo' });
  const [loading, setLoading] = useState(false);
  const [asientoAbierto, setAsientoAbierto] = useState<number | null>(null);

  const load = () => {
    api.get('/contabilidad/asientos/').then(d => setAsientos(d.results ?? d));
    api.get('/contabilidad/cuentas/').then(d => setCuentas(d.results ?? d));
    api.get('/contabilidad/asientos/balance/').then(d => setBalance(d));
  };
  useEffect(() => { load(); }, []);

  const agregarLinea = () => setLineas([...lineas, { cuenta: 0, debe: 0, haber: 0, descripcion: '' }]);
  const eliminarLinea = (i: number) => setLineas(lineas.filter((_, idx) => idx !== i));
  const actualizarLinea = (i: number, campo: keyof Linea, valor: string | number) => {
    const nuevas = [...lineas];
    nuevas[i] = { ...nuevas[i], [campo]: valor };
    setLineas(nuevas);
  };

  const totalDebe = lineas.reduce((a, l) => a + Number(l.debe), 0);
  const totalHaber = lineas.reduce((a, l) => a + Number(l.haber), 0);
  const balanceado = totalDebe === totalHaber && totalDebe > 0;

  const guardarAsiento = async () => {
    if (!balanceado) return alert('El asiento no está balanceado (Debe = Haber)');
    setLoading(true);
    const res = await api.post('/contabilidad/asientos/', { fecha, descripcion, referencia, lineas });
    if (res.id) { setModal(null); load(); }
    else alert(JSON.stringify(res));
    setLoading(false);
  };

  const guardarCuenta = async () => {
    setLoading(true);
    await api.post('/contabilidad/cuentas/', cuentaForm);
    setModal(null); load(); setLoading(false);
  };

  const totalActivos = balance.filter(b => b.tipo === 'activo').reduce((a, b) => a + Number(b.saldo), 0);
  const totalPasivos = balance.filter(b => b.tipo === 'pasivo').reduce((a, b) => a + Number(b.saldo), 0);
  const totalIngresos = balance.filter(b => b.tipo === 'ingreso').reduce((a, b) => a + Number(b.haber), 0);
  const totalGastos = balance.filter(b => b.tipo === 'gasto').reduce((a, b) => a + Number(b.debe), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><BookOpen className="text-sky-600" /> Contabilidad</h1>
          <p className="text-slate-500 mt-1">Asientos contables, cuentas y balance general</p>
        </div>
        <div className="flex gap-2">
          {tab === 'asientos' && (
            <button onClick={() => { setFecha(''); setDescripcion(''); setReferencia(''); setLineas([{ cuenta: 0, debe: 0, haber: 0, descripcion: '' }]); setModal('asiento'); }}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <Plus size={16} /> Nuevo Asiento
            </button>
          )}
          {tab === 'cuentas' && (
            <button onClick={() => { setCuentaForm({ codigo: '', nombre: '', tipo: 'activo' }); setModal('cuenta'); }}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <Plus size={16} /> Nueva Cuenta
            </button>
          )}
          <BotonesReporte modulo="contabilidad" />
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Activos', value: totalActivos, color: 'bg-sky-500' },
          { label: 'Total Pasivos', value: totalPasivos, color: 'bg-red-500' },
          { label: 'Total Ingresos', value: totalIngresos, color: 'bg-emerald-500' },
          { label: 'Total Gastos', value: totalGastos, color: 'bg-orange-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} text-white rounded-2xl p-4 shadow`}>
            <p className="text-xs text-white/80">{label}</p>
            <p className="text-2xl font-bold">${Number(value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'asientos', label: 'Asientos' }, { key: 'cuentas', label: 'Plan de Cuentas' }, { key: 'balance', label: 'Balance' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 hover:bg-sky-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Asientos */}
      {tab === 'asientos' && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sky-50 text-sky-700">
              <tr>{['Número', 'Fecha', 'Descripción', 'Referencia', 'Origen', ''].map(h => (
                <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {asientos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No hay asientos registrados</td></tr>
              ) : asientos.map(a => (
                <>
                  <tr key={a.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setAsientoAbierto(asientoAbierto === a.id ? null : a.id)}>
                    <td className="px-6 py-4 font-mono text-sky-600">{a.numero}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(a.fecha).toLocaleDateString('es')}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{a.descripcion}</td>
                    <td className="px-6 py-4 text-slate-500">{a.referencia || '—'}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${origenColor[a.origen]}`}>{a.origen}</span></td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{asientoAbierto === a.id ? '▲' : '▼'}</td>
                  </tr>
                  {asientoAbierto === a.id && (
                    <tr key={`${a.id}-detalle`}>
                      <td colSpan={6} className="px-6 py-3 bg-sky-50">
                        <table className="w-full text-xs">
                          <thead><tr className="text-sky-700"><th className="text-left py-1">Cuenta</th><th className="text-right py-1">Debe</th><th className="text-right py-1">Haber</th></tr></thead>
                          <tbody>
                            {a.lineas.map(l => (
                              <tr key={l.id}>
                                <td className="py-1">{l.cuenta_codigo} - {l.cuenta_nombre}</td>
                                <td className="text-right py-1 text-emerald-600">{Number(l.debe) > 0 ? `$${Number(l.debe).toLocaleString()}` : '—'}</td>
                                <td className="text-right py-1 text-red-500">{Number(l.haber) > 0 ? `$${Number(l.haber).toLocaleString()}` : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cuentas */}
      {tab === 'cuentas' && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sky-50 text-sky-700">
              <tr>{['Código', 'Nombre', 'Tipo'].map(h => <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cuentas.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">No hay cuentas registradas</td></tr>
              ) : cuentas.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-sky-600">{c.codigo}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{c.nombre}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${tipoColor[c.tipo]}`}>{c.tipo}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Balance */}
      {tab === 'balance' && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sky-50 text-sky-700">
              <tr>{['Código', 'Cuenta', 'Tipo', 'Debe', 'Haber', 'Saldo'].map(h => <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {balance.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Sin movimientos contables</td></tr>
              ) : balance.map(b => (
                <tr key={b.codigo} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-sky-600">{b.codigo}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{b.nombre}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${tipoColor[b.tipo]}`}>{b.tipo}</span></td>
                  <td className="px-6 py-4 text-emerald-600">${Number(b.debe).toLocaleString()}</td>
                  <td className="px-6 py-4 text-red-500">${Number(b.haber).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">${Number(b.saldo).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nuevo Asiento */}
      {modal === 'asiento' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-800">Nuevo Asiento Contable</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Fecha</label>
                  <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Referencia</label>
                  <input value={referencia} onChange={e => setReferencia(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Descripción</label>
                <input value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Líneas del Asiento</label>
                  <button onClick={agregarLinea} className="text-xs text-sky-600 hover:underline flex items-center gap-1"><Plus size={12} /> Agregar línea</button>
                </div>
                <div className="space-y-2">
                  {lineas.map((l, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl">
                      <div className="col-span-4">
                        <select value={l.cuenta} onChange={e => actualizarLinea(i, 'cuenta', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500">
                          <option value={0}>Cuenta</option>
                          {cuentas.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input type="number" placeholder="Debe" value={l.debe}
                          onChange={e => actualizarLinea(i, 'debe', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" placeholder="Haber" value={l.haber}
                          onChange={e => actualizarLinea(i, 'haber', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button onClick={() => eliminarLinea(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between mt-3 text-sm font-semibold px-2 ${balanceado ? 'text-emerald-600' : 'text-red-500'}`}>
                  <span>Debe: ${totalDebe.toLocaleString()}</span>
                  <span>{balanceado ? '✓ Balanceado' : '✗ No balanceado'}</span>
                  <span>Haber: ${totalHaber.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
                <button onClick={guardarAsiento} disabled={loading || !balanceado}
                  className="flex-1 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition disabled:opacity-60">
                  {loading ? 'Guardando...' : 'Guardar Asiento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Cuenta */}
      {modal === 'cuenta' && (
        <Modal title="Nueva Cuenta Contable" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Código</label>
                <input value={cuentaForm.codigo} onChange={e => setCuentaForm({ ...cuentaForm, codigo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" placeholder="Ej: 1101" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Tipo</label>
                <select value={cuentaForm.tipo} onChange={e => setCuentaForm({ ...cuentaForm, tipo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm">
                  {['activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <input value={cuentaForm.nombre} onChange={e => setCuentaForm({ ...cuentaForm, nombre: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={guardarCuenta} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition disabled:opacity-60">
                {loading ? 'Guardando...' : 'Crear Cuenta'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
