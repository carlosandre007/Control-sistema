import React, { useState } from 'react';
import { LayoutDashboard, List, Pin, BarChart3, Plus, X, Trash2, CheckCircle, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCentralFinanceira } from './hooks/useCentralFinanceira';
import { NovaMovimentacaoModal, ImportarFaturaModal, NovaMetaModal, NovoFinanciamentoModal, NovoCustoFixoModal } from './components/CFModals';
import { CartoesEBancos } from './components/CartoesEBancos';
import CartaoDetalhe from './components/CartaoDetalhe';
import ContaDetalhe from './components/ContaDetalhe';

// ========================
// HELPERS
// ========================
const fmt = (v: number) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d: string) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const typeLabel: Record<string, string> = {
  receita: 'Receita',
  gasto_diario: 'Gasto Diário', conta_fixa: 'Conta Fixa',
  cartao: 'Cartão', assinatura: 'Assinatura', financiamento: 'Financiamento',
  parcela_manual: 'Parcela', outros: 'Outros',
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    pago: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    atrasado: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    receita: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  };
  const label: Record<string, string> = { pendente: 'Pendente', pago: 'Pago', atrasado: 'Atrasado', receita: 'Recebido' };
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${map[status] || ''}`}>{label[status] || status}</span>;
};

// ========================
// ABA: DASHBOARD
// ========================
const TabDashboard = ({ data, onNovaMeta, onNovoFinanciamento }: {
  data: ReturnType<typeof useCentralFinanceira>;
  onNovaMeta: () => void;
  onNovoFinanciamento: () => void;
}) => {
  const {
    receitasMes, despesasPagas, debitosAPagar, saldoPrevisto,
    insights, receitas, despesas, financiamentos,
    totalCustosFixosAtivos,
  } = data;

  // Gráfico 6 meses
  const meses: { name: string; Receitas: number; Despesas: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const name = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const rec = receitas.filter(r => r.date.startsWith(key)).reduce((s, r) => s + Number(r.amount), 0);
    const desp = despesas.filter(dd => dd.date.startsWith(key)).reduce((s, dd) => s + Number(dd.amount), 0);
    meses.push({ name, Receitas: rec, Despesas: desp });
  }

  const cards = [
    {
      icon: '💰',
      label: 'Receitas do Mês',
      value: receitasMes,
      color: 'text-green-600',
      bg: 'border-l-4 border-green-500',
      sub: 'Entradas registradas no mês'
    },
    {
      icon: '✅',
      label: 'Despesas Pagas',
      value: despesasPagas,
      color: 'text-blue-600',
      bg: 'border-l-4 border-blue-500',
      sub: 'Compromissos quitados no mês'
    },
    {
      icon: '⚠️',
      label: 'Débitos a Pagar',
      value: debitosAPagar,
      color: 'text-orange-600',
      bg: 'border-l-4 border-orange-400',
      sub: `Fixos (${fmt(totalCustosFixosAtivos)}) + pendentes + financiamentos`
    },
    {
      icon: '💵',
      label: 'Saldo Previsto',
      value: saldoPrevisto,
      color: saldoPrevisto >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: saldoPrevisto >= 0 ? 'border-l-4 border-emerald-500' : 'border-l-4 border-red-500',
      sub: 'Receitas − Pagas − Débitos'
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <div key={i} className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm ${c.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{c.icon}</span>
              <p className="text-xs font-semibold text-slate-500">{c.label}</p>
            </div>
            <p className={`text-xl font-black ${c.color}`}>{fmt(c.value)}</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">📊 Receitas x Despesas (6 meses)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={meses} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Financiamentos resumo no Dashboard */}
      {financiamentos.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">🏦 Financiamentos Ativos</h3>
            <button onClick={onNovoFinanciamento} className="text-xs text-primary font-semibold hover:underline">+ Novo</button>
          </div>
          <div className="space-y-3">
            {financiamentos.map(f => {
              const restantes = Math.max(0, f.total_installments - f.paid_installments);
              const pct = Math.round((f.paid_installments / f.total_installments) * 100);
              return (
                <div key={f.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{f.asset_name}</span>
                    <span className="text-xs text-slate-500">{fmt(f.installment_value)}/mês · {restantes} restantes</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-red-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>{f.institution}</span>
                    <span>{pct}% pago</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inteligência Financeira */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🧠</span>
          <h3 className="font-bold text-white">Inteligência Financeira</h3>
          <span className="text-xs text-slate-400">Análise automática dos seus dados</span>
        </div>
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
              <p className="text-sm text-slate-200">{ins}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Planejamento dentro do dashboard */}
      <TabPlanejamento data={data} onNovaMeta={onNovaMeta} onNovoFinanciamento={onNovoFinanciamento} />
    </div>
  );
};

// ========================
// ABA: MOVIMENTAÇÃO DIÁRIA (Receitas + Despesas unificadas)
// ========================
const TabMovimentacao = ({ data, onNova, onImportar }: {
  data: ReturnType<typeof useCentralFinanceira>;
  onNova: () => void;
  onImportar: () => void;
}) => {
  const { receitas, despesas, deleteReceita, deleteDespesa, markDespesaPaga, receitasMes, despesasMes } = data;
  const [filtro, setFiltro] = useState<'todos' | 'receitas' | 'despesas'>('todos');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Unificar receitas e despesas em uma única lista
  const itensReceitas = receitas.map(r => ({
    id: r.id, date: r.date, description: r.description,
    category: r.category, tipo: 'receita' as const, amount: r.amount,
    status: 'receita' as const, isReceita: true,
  }));
  const itensDespesas = despesas.map(d => ({
    id: d.id, date: d.date, description: d.description,
    category: d.category, tipo: d.type, amount: d.amount,
    status: d.status, isReceita: false,
  }));

  const todos = [...itensReceitas, ...itensDespesas].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtrados = todos.filter(item => {
    if (filtro === 'receitas') return item.isReceita;
    if (filtro === 'despesas') return !item.isReceita;
    if (filtroTipo && !item.isReceita) return item.tipo === filtroTipo;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">📋 Movimentação Diária</h2>
          <p className="text-sm text-slate-500">
            Entradas: <span className="text-green-600 font-bold">{fmt(receitasMes)}</span>
            {' · '}
            Saídas: <span className="text-red-500 font-bold">{fmt(despesasMes)}</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={onImportar} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm">
            📂 Importar Fatura
          </button>
          <button onClick={onNova} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-4 py-2.5 rounded-xl transition shadow-lg text-sm">
            <Plus size={16} /> Nova Movimentação
          </button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide flex-wrap">
        {(['todos', 'receitas', 'despesas'] as const).map(f => (
          <button key={f} onClick={() => { setFiltro(f); setFiltroTipo(''); }}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition ${filtro === f && !filtroTipo
              ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
            {f === 'todos' ? 'Todos' : f === 'receitas' ? '💰 Receitas' : '💸 Despesas'}
          </button>
        ))}
        {['gasto_diario', 'conta_fixa', 'cartao', 'assinatura', 'financiamento'].map(t => (
          <button key={t} onClick={() => { setFiltro('todos'); setFiltroTipo(t); }}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition ${filtroTipo === t
              ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
            {typeLabel[t]}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <List size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold">Nenhum lançamento encontrado.</p>
          <p className="text-sm mt-1">Clique em "+ Nova Movimentação" para começar.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-400 font-semibold">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(item => (
                  <tr key={item.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{fmtDate(item.date)}</td>
                    <td className="px-4 py-3 font-semibold text-sm text-slate-800 dark:text-white">{item.description}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${item.isReceita
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {item.isReceita ? '💰 Receita' : typeLabel[item.tipo] || item.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.category}</td>
                    <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${item.isReceita ? 'text-green-600' : 'text-red-600'}`}>
                      {item.isReceita ? '+' : '-'}{fmt(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {!item.isReceita && item.status !== 'pago' && (
                          <button onClick={() => markDespesaPaga(item.id)} title="Marcar como pago"
                            className="text-slate-300 hover:text-green-500 transition p-1 rounded">
                            <CheckCircle size={15} />
                          </button>
                        )}
                        <button onClick={() => item.isReceita ? deleteReceita(item.id) : deleteDespesa(item.id)}
                          title="Excluir" className="text-slate-300 hover:text-red-500 transition p-1 rounded">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================
// ABA: CUSTOS FIXOS MENSAIS
// ========================
const TabCustosFixos = ({ data, onNovo }: {
  data: ReturnType<typeof useCentralFinanceira>;
  onNovo: () => void;
}) => {
  const { custosFixos, deleteCustoFixo, toggleCustoFixoStatus, totalCustosFixosAtivos } = data;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">📌 Custos Fixos Mensais</h2>
          <p className="text-sm text-slate-500">
            Total ativo: <span className="text-red-500 font-bold">{fmt(totalCustosFixosAtivos)}</span>/mês
          </p>
        </div>
        <button onClick={onNovo} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-lg text-sm">
          <Plus size={16} /> Novo Custo Fixo
        </button>
      </div>

      {custosFixos.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Pin size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold">Nenhum custo fixo cadastrado.</p>
          <p className="text-sm mt-1">Cadastre aluguel, energia, salários, internet e outros custos recorrentes.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-400 font-semibold">
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-center">Dia Venc.</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {custosFixos.map(cf => (
                  <tr key={cf.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition ${!cf.ativo ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-sm text-slate-800 dark:text-white">{cf.description}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{cf.category}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-md">
                        Dia {cf.diaVencimento}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{fmt(cf.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleCustoFixoStatus(cf.id, !cf.ativo)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-md transition ${cf.ativo
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 hover:bg-red-100 hover:text-red-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-green-100 hover:text-green-700'}`}>
                        {cf.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteCustoFixo(cf.id)}
                        className="text-slate-300 hover:text-red-500 transition p-1 rounded">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-between">
            <span className="text-xs text-slate-500">{custosFixos.filter(c => c.ativo).length} custo(s) ativo(s)</span>
            <span className="text-sm font-black text-red-600">{fmt(totalCustosFixosAtivos)}/mês</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================
// ABA: PLANEJAMENTO ESTRATÉGICO
// ========================
const TabPlanejamento = ({ data, onNovaMeta, onNovoFinanciamento }: {
  data: ReturnType<typeof useCentralFinanceira>;
  onNovaMeta: () => void;
  onNovoFinanciamento: () => void;
}) => {
  const {
    metas, bolaNeve, avalanche, dividas, deleteMeta,
    totalDividas, totalAssinaturas, financiamentos, deleteFinanciamento,
    insights, receitasMes, totalCustosFixosAtivos, debitosAPagar, saldoPrevisto,
  } = data;
  const [estrategia, setEstrategia] = useState<'bola_neve' | 'avalanche' | 'hibrido'>('hibrido');

  const ordem = estrategia === 'bola_neve' ? bolaNeve
    : estrategia === 'avalanche' ? avalanche
    : [...dividas].sort((a, b) => Number(b.amount) - Number(a.amount));

  const totalParcelasMensais = financiamentos.reduce((s, f) => s + Number(f.installment_value), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">📈 Planejamento Estratégico</h2>
          <p className="text-sm text-slate-500">Análises inteligentes com base nos seus dados.</p>
        </div>
        <button onClick={onNovoFinanciamento}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-lg text-sm shrink-0">
          <Plus size={16} /> Novo Financiamento
        </button>
      </div>

      {/* Indicadores rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 mb-1">Total a Pagar</p>
          <p className="text-xl font-black text-slate-800 dark:text-white">{fmt(totalDividas)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 border-red-400">
          <p className="text-xs text-slate-500 mb-1">Parcelas/Mês</p>
          <p className="text-xl font-black text-red-600">{fmt(totalParcelasMensais)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 border-orange-400">
          <p className="text-xs text-slate-500 mb-1">Custos Fixos</p>
          <p className="text-xl font-black text-orange-500">{fmt(totalCustosFixosAtivos)}</p>
        </div>
        <div className={`p-4 rounded-2xl ${saldoPrevisto >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500' : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'}`}>
          <p className="text-xs text-slate-500 mb-1">Saldo Previsto</p>
          <p className={`text-xl font-black ${saldoPrevisto >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(saldoPrevisto)}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Esquerda */}
        <div className="flex-1 space-y-6">
          {/* Análises automáticas */}
          <div className="bg-slate-900 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🧠</span>
              <h3 className="font-bold text-white">Análise Automática</h3>
            </div>
            <div className="space-y-2">
              {insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                  <p className="text-sm text-slate-200">{ins}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Estratégias de quitação */}
          {dividas.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">✨</span>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Estratégias de Quitação</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {([
                  { key: 'bola_neve', icon: '❄️', title: 'Bola de Neve', desc: 'Menores dívidas primeiro. Rápida sensação de vitória.' },
                  { key: 'avalanche', icon: '🏔️', title: 'Avalanche', desc: 'Maiores juros primeiro. Mais eficiente matematicamente.' },
                  { key: 'hibrido', icon: '🧠', title: 'Híbrido', desc: 'Equilibra prazo e custo.', recommended: true },
                ] as const).map(e => (
                  <button key={e.key} type="button" onClick={() => setEstrategia(e.key)}
                    className={`relative p-4 rounded-xl border-2 text-left transition ${estrategia === e.key
                      ? 'border-slate-800 dark:border-white bg-slate-50 dark:bg-slate-900/60'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>
                    {'recommended' in e && e.recommended && (
                      <span className="absolute -top-2.5 -right-2.5 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md">RECOMENDADO</span>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl">{e.icon}</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${estrategia === e.key ? 'border-slate-800 dark:border-white bg-slate-800 dark:bg-white' : 'border-slate-300'}`} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1">{e.title}</h4>
                    <p className="text-xs text-slate-500">{e.desc}</p>
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                      <th className="pb-3 font-semibold">Ordem</th>
                      <th className="pb-3 font-semibold">Obrigação</th>
                      <th className="pb-3 font-semibold">Tipo</th>
                      <th className="pb-3 font-semibold text-right">Valor</th>
                      <th className="pb-3 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordem.map((d, i) => (
                      <tr key={d.id} className={`border-b border-slate-100 dark:border-slate-700 ${i === 0 ? 'bg-red-50/40 dark:bg-red-900/10' : ''}`}>
                        <td className="py-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{i + 1}</div>
                        </td>
                        <td className="py-3 font-semibold text-sm text-slate-800 dark:text-white pr-4">{d.description}</td>
                        <td className="py-3 text-xs text-slate-500">{typeLabel[d.type]}</td>
                        <td className="py-3 text-right font-bold text-slate-800 dark:text-white">{fmt(d.amount)}</td>
                        <td className="py-3 text-right">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${i === 0 ? 'bg-red-600 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'}`}>
                            {i === 0 ? 'Liquidar Primeiro' : 'Pagar Mínimo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Direita: Metas + Financiamentos */}
        <div className="w-full lg:w-72 shrink-0 space-y-5">
          {/* Metas */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">🎯 Metas Financeiras</h3>
              <button onClick={onNovaMeta} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-200 transition">
                <Plus size={16} />
              </button>
            </div>
            {metas.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p className="text-sm">Nenhuma meta cadastrada.</p>
                <button onClick={onNovaMeta} className="text-primary text-xs underline mt-2">Adicionar meta</button>
              </div>
            ) : (
              <div className="space-y-4">
                {metas.map(m => {
                  const pct = Math.min(Math.round((m.current_amount / m.target_amount) * 100), 100);
                  return (
                    <div key={m.id} className="group">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                          <span>{m.icon}</span>
                          <span className="font-semibold text-sm text-slate-800 dark:text-white">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`font-bold text-sm ${pct >= 100 ? 'text-green-600' : 'text-primary'}`}>{pct}%</span>
                          <button onClick={() => deleteMeta(m.id)} className="opacity-0 group-hover:opacity-100 transition text-slate-300 hover:text-red-500 p-0.5"><X size={12} /></button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-1.5">{fmt(m.current_amount)} de {fmt(m.target_amount)}</p>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                      </div>
                      {m.deadline && <p className="text-[10px] text-right text-slate-400 mt-1">Prazo: {fmtDate(m.deadline)}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Financiamentos */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">🏦 Financiamentos</h3>
            </div>
            {financiamentos.length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                <p className="text-sm">Nenhum financiamento cadastrado.</p>
                <button onClick={onNovoFinanciamento} className="text-primary text-xs underline mt-2">Cadastrar financiamento</button>
              </div>
            ) : (
              <div className="space-y-4">
                {financiamentos.map(f => (
                  <div key={f.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{f.asset_name}</h4>
                        <p className="text-xs text-slate-400">{f.institution}</p>
                      </div>
                      <button onClick={() => deleteFinanciamento(f.id)}
                        className="text-slate-300 hover:text-red-500 p-1 transition rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-slate-400">Total:</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{fmt(f.original_amount)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Parcela:</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{fmt(f.installment_value)}/mês</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Restantes:</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{Math.max(0, f.total_installments - f.paid_installments)} parcelas</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Vencimento:</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Dia {f.due_day}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================
// COMPONENTE PRINCIPAL
// ========================
type TabName = 'dashboard' | 'movimentacao' | 'custosFixos' | 'cartoes';
type ModalType = 'movimentacao' | 'importar' | 'meta' | 'financiamento' | 'custoFixo' | null;

const CentralFinanceiraView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [modal, setModal] = useState<ModalType>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedContaId, setSelectedContaId] = useState<string | null>(null);
  const data = useCentralFinanceira();

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'movimentacao' as const, label: 'Movimentação Diária', icon: <List size={18} /> },
    { id: 'custosFixos' as const, label: 'Custos Fixos', icon: <Pin size={18} /> },
    { id: 'cartoes' as const, label: 'Cartões e Bancos', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col hidden md:flex shrink-0">
        <div className="p-5 flex flex-col h-full">
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-5">Central Financeira</h1>

          <button
            onClick={() => setModal('movimentacao')}
            className="w-full bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-black text-white rounded-xl py-2.5 px-4 font-bold text-sm transition-all flex items-center justify-center gap-2 mb-6 shadow-md"
          >
            <Plus size={16} /> Novo Lançamento
          </button>

          <nav className="space-y-0.5 flex-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          {data.loading && <p className="text-xs text-slate-400 text-center mt-4 animate-pulse">Carregando dados...</p>}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <h1 className="font-black text-slate-900 dark:text-white text-base">Central Financeira</h1>
        <div className="flex gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`p-2 rounded-lg transition ${activeTab === item.id ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide relative">
        <div className="md:hidden h-14" />
        {data.loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <TabDashboard data={data} onNovaMeta={() => setModal('meta')} onNovoFinanciamento={() => setModal('financiamento')} />
            )}
            {activeTab === 'movimentacao' && (
              <TabMovimentacao data={data} onNova={() => setModal('movimentacao')} onImportar={() => setModal('importar')} />
            )}
            {activeTab === 'custosFixos' && (
              <TabCustosFixos data={data} onNovo={() => setModal('custoFixo')} />
            )}
            {activeTab === 'cartoes' && (
              selectedCardId ? (
                <CartaoDetalhe cardId={selectedCardId} onBack={() => setSelectedCardId(null)} />
              ) : selectedContaId ? (
                <ContaDetalhe contaId={selectedContaId} onBack={() => setSelectedContaId(null)} />
              ) : (
                <CartoesEBancos onSelectCard={setSelectedCardId} onSelectConta={setSelectedContaId} />
              )
            )}
          </>
        )}
      </main>

      {/* FAB Mobile */}
      <div className="md:hidden fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2">
        {fabOpen && (
          <>
            <button onClick={() => { setModal('movimentacao'); setFabOpen(false); }}
              className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-lg">
              📋 Movimentação
            </button>
            <button onClick={() => { setModal('custoFixo'); setFabOpen(false); }}
              className="flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-lg">
              📌 Custo Fixo
            </button>
            <button onClick={() => { setModal('importar'); setFabOpen(false); }}
              className="flex items-center gap-2 bg-slate-700 text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-lg">
              📂 Importar
            </button>
            <button onClick={() => { setModal('financiamento'); setFabOpen(false); }}
              className="flex items-center gap-2 bg-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-lg">
              🏦 Financiamento
            </button>
          </>
        )}
        <button onClick={() => setFabOpen(v => !v)}
          className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition">
          <Plus size={24} className={`transition-transform ${fabOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Modais */}
      <NovaMovimentacaoModal isOpen={modal === 'movimentacao'} onClose={() => setModal(null)}
        onSaveReceita={data.addReceita} onSaveDespesa={data.addDespesa}
        cartoes={data.cartoes} receitasCategorias={data.receitasCategorias}
        despesasCategorias={data.despesasCategorias} />
      <ImportarFaturaModal isOpen={modal === 'importar'} onClose={() => setModal(null)} onImport={data.importarFatura} />
      <NovaMetaModal isOpen={modal === 'meta'} onClose={() => setModal(null)} onSave={data.addMeta} />
      <NovoFinanciamentoModal isOpen={modal === 'financiamento'} onClose={() => setModal(null)} onSave={data.addFinanciamento} />
      <NovoCustoFixoModal isOpen={modal === 'custoFixo'} onClose={() => setModal(null)} onSave={data.addCustoFixo}
        despesasCategorias={data.despesasCategorias} />
    </div>
  );
};

export default CentralFinanceiraView;
