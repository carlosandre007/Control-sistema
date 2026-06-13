import React from 'react';
import { Banknote, ArrowLeft } from 'lucide-react';
import { useCentralFinanceira } from '../hooks/useCentralFinanceira';

interface ContaDetalheProps {
  contaId: string;
  onBack: () => void;
}

const ContaDetalhe: React.FC<ContaDetalheProps> = ({ contaId, onBack }) => {
  const { contas, despesas, loading } = useCentralFinanceira();

  const conta = contas.find((c) => c.id === contaId);

  const transacoes = despesas.filter((d) => d.payment_method === 'conta_bancaria' && (conta?.account_number ? d.account_number === conta.account_number : true));

  if (loading) {
    return <p className="text-center text-sm text-slate-500">Carregando detalhes...</p>;
  }

  if (!conta) {
    return (
      <div className="p-4">
        <p className="text-red-600">Conta não encontrada.</p>
        <button onClick={onBack} className="mt-2 text-primary underline">
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary mb-4">
        <ArrowLeft size={16} /> Voltar
      </button>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Banknote size={24} className="text-primary" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{conta.bank_name}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400">Saldo</p>
            <p className="font-bold text-lg text-slate-800 dark:text-white">
              R$ {conta.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400">Tipo</p>
            <p className="font-bold text-lg text-slate-800 dark:text-white">{conta.account_type}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400">Agência</p>
            <p className="font-bold text-lg text-slate-800 dark:text-white">{conta.agency || '-'}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400">Conta</p>
            <p className="font-bold text-lg text-slate-800 dark:text-white">{conta.account_number || '-'}
            </p>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">Transações</h3>
        {transacoes.length === 0 ? (
          <p className="text-slate-500">Nenhuma transação encontrada para esta conta.</p>
        ) : (
          <div className="space-y-3">
            {transacoes.map((d) => (
              <div key={d.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">{d.description}</p>
                  <p className="text-xs text-slate-500">{d.date}</p>
                </div>
                <p className="font-bold text-red-600">R$ {d.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContaDetalhe;
