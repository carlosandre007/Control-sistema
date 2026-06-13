import React, { useState } from 'react';
import { CreditCard, Banknote, Plus } from 'lucide-react';
import { useCentralFinanceira } from '../hooks/useCentralFinanceira';

export const CartoesEBancos: React.FC<{ onSelectCard: (id: string) => void; onSelectConta: (id: string) => void; }> = ({ onSelectCard, onSelectConta }) => {
  const { cartoes, contas, loading, addCartao, addConta } = useCentralFinanceira();
  const [modalCartao, setModalCartao] = useState(false);
  const [modalConta, setModalConta] = useState(false);
  const [formCartao, setFormCartao] = useState({ name: '', issuer_bank: '', limit_amount: '', closing_day: '', due_day: '' });
  const [formConta, setFormConta] = useState({ bank_name: '', account_type: 'corrente', balance: 0, agency: '', account_number: '' });
  const [errorCartao, setErrorCartao] = useState('');

  const handleAddCartao = async () => {
    if (!formCartao.name.trim()) {
      setErrorCartao('O nome do cartão é obrigatório.');
      return;
    }
    const closingNum = Number(formCartao.closing_day);
    const dueNum = Number(formCartao.due_day);

    if (isNaN(closingNum) || closingNum < 1 || closingNum > 31) {
      setErrorCartao('Dia de fechamento inválido (deve ser entre 1 e 31).');
      return;
    }
    if (isNaN(dueNum) || dueNum < 1 || dueNum > 31) {
      setErrorCartao('Dia de vencimento inválido (deve ser entre 1 e 31).');
      return;
    }

    setErrorCartao('');
    const payload: any = {
      name: formCartao.name.trim(),
      issuer_bank: formCartao.issuer_bank.trim() || '-',
      limit_amount: Number(formCartao.limit_amount) || 0,
      used_limit: 0,
      available_limit: Number(formCartao.limit_amount) || 0,
      closing_day: closingNum,
      due_day: dueNum,
    };

    const err: any = await addCartao(payload);
    if (err) {
      setErrorCartao(`Erro no banco: ${err.message || 'Falha na conexão.'} ${err.details || ''}`);
      return;
    }

    setModalCartao(false);
    setFormCartao({ name: '', issuer_bank: '', limit_amount: '', closing_day: '', due_day: '' });
  };

  const handleAddConta = async () => {
    await addConta({
      bank_name: formConta.bank_name,
      agency: formConta.agency,
      account_number: formConta.account_number,
      account_type: formConta.account_type,
      balance: Number(formConta.balance),
    });
    setModalConta(false);
    setFormConta({ bank_name: '', account_type: 'corrente', balance: 0, agency: '', account_number: '' });
  };

  if (loading) {
    return <p className="text-center text-sm text-slate-500">Carregando cartões e contas...</p>;
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {modalCartao && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Adicionar Cartão</h3>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Preencha os dados do cartão de crédito.</p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Cartão *</label>
                <input className="w-full border rounded-xl p-2.5 bg-transparent dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ex: Nubank Principal" value={formCartao.name} onChange={e => setFormCartao({ ...formCartao, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Banco Emissor</label>
                <input className="w-full border rounded-xl p-2.5 bg-transparent dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ex: Nubank" value={formCartao.issuer_bank} onChange={e => setFormCartao({ ...formCartao, issuer_bank: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Limite total (R$)</label>
                <input className="w-full border rounded-xl p-2.5 bg-transparent dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" type="number" placeholder="Ex: 5000" value={formCartao.limit_amount} onChange={e => setFormCartao({ ...formCartao, limit_amount: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Fechamento (Dia) *</label>
                  <input className="w-full border rounded-xl p-2.5 bg-transparent dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" type="number" placeholder="Ex: 5" min="1" max="31" value={formCartao.closing_day} onChange={e => setFormCartao({ ...formCartao, closing_day: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Vencimento (Dia) *</label>
                  <input className="w-full border rounded-xl p-2.5 bg-transparent dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" type="number" placeholder="Ex: 12" min="1" max="31" value={formCartao.due_day} onChange={e => setFormCartao({ ...formCartao, due_day: e.target.value })} />
                </div>
              </div>
            </div>

            {errorCartao && <p className="text-red-500 text-xs mb-4 font-semibold">{errorCartao}</p>}

            <button onClick={handleAddCartao} className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-bold mb-2 transition">Adicionar Cartão</button>
            <button onClick={() => { setModalCartao(false); setErrorCartao(''); setFormCartao({ name: '', issuer_bank: '', limit_amount: '', closing_day: '', due_day: '' }); }} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white py-2 rounded-xl text-sm transition">Cancelar</button>
          </div>
        </div>
      )}
      {modalConta && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Adicionar Conta</h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Preencha os dados da conta.</p>
            <input className="w-full border rounded p-2 mb-2" placeholder="Nome do Banco" onChange={e => setFormConta({ ...formConta, bank_name: e.target.value })} />
            <select className="w-full border rounded p-2 mb-2" onChange={e => setFormConta({ ...formConta, account_type: e.target.value as any })}>
              <option value="">Tipo de Conta</option>
              <option value="corrente">Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="pagamento">Pagamento</option>
              <option value="empresarial">Empresarial</option>
            </select>
            <input className="w-full border rounded p-2 mb-2" type="number" placeholder="Saldo" onChange={e => setFormConta({ ...formConta, balance: Number(e.target.value) })} />
            <button onClick={handleAddConta} className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-xl mb-2">Adicionar</button>
            <button onClick={() => setModalConta(false)} className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white py-2 rounded-xl">Cancelar</button>
          </div>
        </div>
      )}
      {/* Cartões */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Cartões de Crédito</h2>
          <button onClick={() => setModalCartao(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-xl">
            <Plus size={16} /> Novo Cartão
          </button>
        </div>
      {cartoes.length === 0 ? (
        <p className="text-slate-500">Nenhum cartão cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cartoes.map((c) => (
            <div key={c.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer" onClick={() => onSelectCard(c.id)}>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={20} className="text-primary" />
                <h3 className="font-semibold text-slate-800 dark:text-white">{c.name}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Limite: R$ {c.limit_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Utilizado: R$ {c.used_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm font-medium text-slate-800 dark:text-white mt-1">
                Disponível: R$ {(c.limit_amount - c.used_limit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Contas Bancárias */}
        <div className="flex items-center justify-between mb-4 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Contas Bancárias</h2>
          <button onClick={() => setModalConta(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-xl">
            <Plus size={16} /> Nova Conta
          </button>
        </div>
      
      {contas.length === 0 ? (
        <p className="text-slate-500">Nenhuma conta bancária cadastrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contas.map((b) => (
            <div key={b.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer" onClick={() => onSelectConta(b.id)}>
              <div className="flex items-center gap-2 mb-2">
                <Banknote size={20} className="text-primary" />
                <h3 className="font-semibold text-slate-800 dark:text-white">{b.bank_name}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Agência: {b.agency || '-'} </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Conta: {b.account_number || '-'} </p>
              <p className="text-sm font-medium text-slate-800 dark:text-white mt-1">
                Saldo: R$ {b.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
