import React from 'react';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { useCentralFinanceira } from '../hooks/useCentralFinanceira';

interface CartaoDetalheProps {
  cardId: string;
  onBack: () => void;
}

const CartaoDetalhe: React.FC<CartaoDetalheProps> = ({ cardId, onBack }) => {
  const { cartoes, despesas, loading } = useCentralFinanceira();

  const card = cartoes.find((c) => c.id === cardId);

  const transacoes = despesas.filter((d) => d.card_id === cardId);

  if (loading) {
    return <p className="text-center text-sm text-slate-500">Carregando detalhes...</p>;
  }

  if (!card) {
    return (
      <div className="p-4">
        <p className="text-red-600">Cartão não encontrado.</p>
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
          <CreditCard size={24} className="text-primary" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{card.name}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400">Limite</p>
            <p className="font-bold text-lg text-slate-800 dark:text-white">
              R$ {card.limit_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400">Utilizado</p>
            <p className="font-bold text-lg text-slate-800 dark:text-white">
              R$ {card.used_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400">Disponível</p>
            <p className="font-bold text-lg text-slate-800 dark:text-white">
              R$ {(card.limit_amount - card.used_limit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400">Fechamento / Vencimento</p>
            <p className="font-bold text-lg text-slate-800 dark:text-white">
              {card.closing_day}/{card.due_day}
            </p>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">Transações</h3>
        {transacoes.length === 0 ? (
          <p className="text-slate-500">Nenhuma despesa registrada para este cartão.</p>
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

export default CartaoDetalhe;
