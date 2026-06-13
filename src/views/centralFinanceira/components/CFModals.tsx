import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, CheckCircle, AlertCircle, Plus, Trash2, Settings, Edit } from 'lucide-react';
import { CFReceita, CFDespesa, CFMeta, CFFaturaRow, CFFinancing, CFCategory, CFCreditCard } from '../hooks/useCentralFinanceira';
import { useCentralFinanceira } from '../hooks/useCentralFinanceira';

// ========================
// HELPERS
// ========================
const InputField = ({ label, type = 'text', value, onChange, required = false, placeholder = '' }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
    >
      <option value="">Selecione...</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

interface ModalWrapperProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }
const ModalWrapper = ({ isOpen, onClose, title, children }: ModalWrapperProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ========================
// MODAL GERENCIAR CATEGORIAS
// ========================
export const GerenciarCategoriasModal = ({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: 'income' | 'expense' }) => {
  const { categories, addCategory, deleteCategory, updateCategory } = useCentralFinanceira();
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const filteredCats = categories.filter((c) => c.type === type);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const err = await addCategory(newCatName.trim(), type);
    if (err) {
      setError('Erro ao criar categoria.');
    } else {
      setNewCatName('');
      setError('');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    const err = await updateCategory(id, editingName.trim());
    if (err) {
      setError('Erro ao atualizar categoria.');
    } else {
      setEditingId(null);
      setEditingName('');
      setError('');
    }
  };

  const handleDelete = async (id: string) => {
    const err = await deleteCategory(id);
    if (err) {
      setError('Erro ao excluir categoria (pode estar em uso).');
    } else {
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            📁 {type === 'income' ? 'Categorias de Receitas' : 'Categorias de Despesas'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nova categoria..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-xl transition flex items-center gap-1 text-xs font-bold">
            <Plus size={14} /> Add
          </button>
        </form>

        {error && <p className="text-red-500 text-xs mb-3 font-semibold">{error}</p>}

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {filteredCats.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Nenhuma categoria cadastrada.</p>
          ) : (
            filteredCats.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {editingId === c.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-2 py-1 mr-2 rounded border text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                )}

                <div className="flex items-center gap-1.5">
                  {editingId === c.id ? (
                    <button onClick={() => handleUpdate(c.id)} className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 p-1.5 rounded transition">
                      <CheckCircle size={14} />
                    </button>
                  ) : (
                    <button onClick={() => { setEditingId(c.id); setEditingName(c.name); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded transition">
                      <Edit size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button onClick={onClose} className="w-full mt-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white py-2 rounded-xl text-xs font-bold transition">
          Fechar
        </button>
      </div>
    </div>
  );
};

// ========================
// MODAL NOVA RECEITA
// ========================
interface NovaReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CFReceita, 'id' | 'user_id' | 'created_at'>) => Promise<unknown>;
}

export const NovaReceitaModal = ({ isOpen, onClose, onSave }: NovaReceitaModalProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ date: today, description: '', category: '', origin: '', amount: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showManageCats, setShowManageCats] = useState(false);

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setError('Informe um valor válido.'); return; }
    setSaving(true); setError('');
    const err = await onSave({ date: form.date, description: form.description, category: form.category || 'Outros', origin: form.origin, amount: Number(form.amount) });
    setSaving(false);
    if (err) { setError('Erro ao salvar. Tente novamente.'); return; }
    setForm({ date: today, description: '', category: '', origin: '', amount: '' });
    onClose();
  };

  const { receitasCategorias } = useCentralFinanceira();
  const categorias = receitasCategorias.map(c => ({ value: c.name, label: c.name }));

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="💰 Nova Receita">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Data" type="date" value={form.date} onChange={set('date')} required />
          <InputField label="Valor (R$)" type="number" value={form.amount} onChange={set('amount')} required placeholder="0,00" />
        </div>
        <InputField label="Descrição" value={form.description} onChange={set('description')} required placeholder="Ex: Locação veículo" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoria *</label>
            <div className="flex gap-2">
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              >
                <option value="">Selecione...</option>
                {categorias.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setShowManageCats(true)}
                className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-white rounded-xl transition flex items-center justify-center"
                title="Gerenciar Categorias"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
          <InputField label="Origem" value={form.origin} onChange={set('origin')} placeholder="Ex: Cliente ABC" />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
          {saving ? 'Salvando...' : 'Salvar Receita'}
        </button>
      </form>

      <GerenciarCategoriasModal isOpen={showManageCats} onClose={() => setShowManageCats(false)} type="income" />
    </ModalWrapper>
  );
};

// ========================
// MODAL NOVA DESPESA
// ========================
interface NovaDespesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CFDespesa, 'id' | 'user_id' | 'created_at'>) => Promise<unknown>;
}

export const NovaDespesaModal = ({ isOpen, onClose, onSave }: NovaDespesaModalProps) => {
  const today = new Date().toISOString().split('T')[0];
  const { despesasCategorias, cartoes } = useCentralFinanceira();
  const [tipo, setTipo] = useState<CFDespesa['type'] | ''>('');
  const [form, setForm] = useState({ date: today, description: '', category: '', amount: '', payment_method: '', card_id: '', card_name: '', installments_total: '', due_date: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showManageCats, setShowManageCats] = useState(false);

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const tipos = [
    { value: 'gasto_diario', label: '🛒 Gasto Diário', color: 'blue' },
    { value: 'conta_fixa', label: '📄 Conta Fixa', color: 'purple' },
    { value: 'cartao', label: '💳 Cartão de Crédito', color: 'orange' },
    { value: 'assinatura', label: '🔄 Assinatura', color: 'teal' },
    { value: 'financiamento', label: '🏦 Financiamento', color: 'red' },
  ];

  const categoriasOptions = despesasCategorias.map(c => ({ value: c.name, label: c.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo) { setError('Selecione o tipo de despesa.'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError('Informe um valor válido.'); return; }
    setSaving(true); setError('');
    const err = await onSave({
      date: form.date,
      description: form.description,
      type: tipo as CFDespesa['type'],
      category: form.category || 'Outros',
      amount: Number(form.amount),
      payment_method: form.payment_method as CFDespesa['payment_method'],
      card_id: form.card_id || undefined,
      card_name: form.card_name || undefined,
      installments_total: form.installments_total ? Number(form.installments_total) : undefined,
      installments_paid: 0,
      due_date: form.due_date || undefined,
      status: 'pendente',
    });
    setSaving(false);
    if (err) { setError('Erro ao salvar. Tente novamente.'); return; }
    setForm({ date: today, description: '', category: '', amount: '', payment_method: '', card_id: '', card_name: '', installments_total: '', due_date: '' });
    setTipo('');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="💸 Nova Despesa">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo */}
        {!tipo ? (
          <div>
            <p className="text-sm text-slate-500 mb-3">Selecione o tipo de despesa:</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {tipos.map((t) => (
                <button key={t.value} type="button" onClick={() => setTipo(t.value as CFDespesa['type'])}
                  className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-slate-700 dark:text-white">{tipos.find((t) => t.value === tipo)?.label}</span>
              <button type="button" onClick={() => setTipo('')} className="text-xs text-slate-400 underline">Trocar</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Data" type="date" value={form.date} onChange={set('date')} required />
              <InputField label="Valor (R$)" type="number" value={form.amount} onChange={set('amount')} required placeholder="0,00" />
            </div>
            <InputField label="Descrição" value={form.description} onChange={set('description')} required placeholder="Ex: Parcela do carro" />
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoria</label>
              <div className="flex gap-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                >
                  <option value="">Selecione...</option>
                  {categoriasOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowManageCats(true)}
                  className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-white rounded-xl transition flex items-center justify-center"
                  title="Gerenciar Categorias"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
          
            <SelectField label="Forma de Pagamento" value={form.payment_method} onChange={set('payment_method')} options={[
              { value: 'dinheiro', label: 'Dinheiro' },
              { value: 'pix', label: 'PIX' },
              { value: 'conta_bancaria', label: 'Conta Bancária' },
              { value: 'cartao_credito', label: 'Cartão Crédito' },
              { value: 'cartao_debito', label: 'Cartão Débito' },
            ]} required />
            
            {(form.payment_method === 'cartao_credito' || form.payment_method === 'cartao_debito') && (
              <SelectField label="Cartão" value={form.card_id || ''} onChange={set('card_id')} options={
                cartoes.map(c => ({ value: c.id, label: c.name }))
              } required />
            )}

            {tipo === 'cartao' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nome do Cartão" value={form.card_name} onChange={set('card_name')} placeholder="Ex: Nubank" />
                <InputField label="Nº de Parcelas" type="number" value={form.installments_total} onChange={set('installments_total')} placeholder="Ex: 12" />
              </div>
            )}
            {(tipo === 'conta_fixa' || tipo === 'financiamento' || tipo === 'assinatura') && (
              <InputField label="Data de Vencimento" type="date" value={form.due_date} onChange={set('due_date')} />
            )}
          </>
        )}

        {error && <p className="text-red-500 text-xs">{error}</p>}
        {tipo && (
          <button type="submit" disabled={saving} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
            {saving ? 'Salvando...' : 'Salvar Despesa'}
          </button>
        )}
      </form>

      <GerenciarCategoriasModal isOpen={showManageCats} onClose={() => setShowManageCats(false)} type="expense" />
    </ModalWrapper>
  );
};

// ========================
// MODAL IMPORTAR FATURA
// ========================
interface ImportarFaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: CFFaturaRow[], cardName: string) => Promise<unknown>;
}

export const ImportarFaturaModal = ({ isOpen, onClose, onImport }: ImportarFaturaModalProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CFFaturaRow[]>([]);
  const [cardName, setCardName] = useState('');
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const parseValue = (v: unknown): number => {
    if (typeof v === 'number') return Math.abs(v);
    const str = String(v).replace(/[R$\s]/g, '').replace(',', '.');
    return Math.abs(parseFloat(str) || 0);
  };

  const parseDate = (v: unknown): string => {
    if (!v) return new Date().toISOString().split('T')[0];
    if (typeof v === 'number') {
      // Excel serial date
      const date = new Date((v - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    const str = String(v);
    // Try DD/MM/YYYY
    const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    // Try YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    return new Date().toISOString().split('T')[0];
  };

  const guessCategory = (desc: string): string => {
    const d = desc.toLowerCase();
    if (/posto|combustiv|gasolina|etanol/.test(d)) return 'Combustível';
    if (/mercado|superm|atacad/.test(d)) return 'Mercado';
    if (/restaur|almoço|lanche|ifood|rappi|pizz/.test(d)) return 'Alimentação';
    if (/farmac|drogari|remedy/.test(d)) return 'Farmácia';
    if (/netflix|spotify|disney|amazon|prime|hbo/.test(d)) return 'Streaming';
    if (/uber|99|taxi|cabify/.test(d)) return 'Transporte';
    return 'Outros';
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];

        if (json.length < 2) { setError('Planilha vazia ou sem dados.'); return; }

        // Find column indexes heuristically
        const header = json[0].map((h: unknown) => String(h).toLowerCase().trim());
        let dateIdx = header.findIndex((h) => /data|date/.test(h));
        let descIdx = header.findIndex((h) => /desc|estabelec|histor|nome|lanc|item/.test(h));
        let valIdx = header.findIndex((h) => /valor|value|amount|total|vl/.test(h));

        // Fallbacks
        if (dateIdx === -1) dateIdx = 0;
        if (descIdx === -1) descIdx = 1;
        if (valIdx === -1) valIdx = 2;

        const parsed: CFFaturaRow[] = [];
        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (!row || !row[valIdx]) continue;
          const val = parseValue(row[valIdx]);
          if (val <= 0) continue;
          const desc = String(row[descIdx] ?? 'Lançamento').trim();
          const date = parseDate(row[dateIdx]);
          parsed.push({ data: date, descricao: desc, valor: val, categoria: guessCategory(desc) });
        }

        if (parsed.length === 0) { setError('Nenhum lançamento válido encontrado.'); return; }
        setRows(parsed);
        setStep('preview');
      } catch {
        setError('Erro ao processar o arquivo. Verifique o formato.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    setImporting(true);
    const err = await onImport(rows, cardName || 'Cartão');
    setImporting(false);
    if (err) { setError('Erro ao importar. Tente novamente.'); return; }
    setStep('success');
  };

  const handleClose = () => {
    setRows([]); setCardName(''); setStep('upload'); setError('');
    if (fileRef.current) fileRef.current.value = '';
    onClose();
  };

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} title="📂 Importar Fatura">
      {step === 'upload' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Aceita arquivos <strong>.XLSX</strong>, <strong>.XLS</strong> e <strong>.CSV</strong>.<br />O sistema identificará automaticamente Data, Descrição e Valor.</p>
          <InputField label="Nome do Cartão" value={cardName} onChange={setCardName} placeholder="Ex: Nubank, Itaú, C6..." />
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition"
          >
            <Upload className="text-slate-400" size={36} />
            <p className="font-semibold text-slate-600 dark:text-slate-300">Clique para selecionar o arquivo</p>
            <p className="text-xs text-slate-400">XLSX, XLS ou CSV</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
          </div>
          {error && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Não tem planilha? Baixe o modelo:</p>
            <button
              type="button"
              onClick={() => {
                const ws = XLSX.utils.json_to_sheet([
                  { Data: '10/06/2026', Descrição: 'Posto Ipiranga', Valor: 150.00, Categoria: 'Combustível' },
                  { Data: '11/06/2026', Descrição: 'Supermercado Extra', Valor: 450.50, Categoria: 'Mercado' },
                  { Data: '12/06/2026', Descrição: 'Netflix', Valor: 55.90, Categoria: 'Streaming' },
                  { Data: '13/06/2026', Descrição: 'iFood', Valor: 89.90, Categoria: 'Alimentação' },
                  { Data: '14/06/2026', Descrição: 'Farmácia Moderna', Valor: 120.00, Categoria: 'Farmácia' },
                ]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Modelo Fatura');
                XLSX.writeFile(wb, 'modelo_fatura_central_financeira.xlsx');
              }}
              className="text-xs text-primary underline font-semibold"
            >
              ⬇ Baixar modelo XLSX
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-white">{rows.length} lançamentos encontrados</p>
            <button type="button" onClick={() => setStep('upload')} className="text-xs text-slate-400 underline">Voltar</button>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-500">Data</th>
                  <th className="px-3 py-2 font-semibold text-slate-500">Descrição</th>
                  <th className="px-3 py-2 font-semibold text-slate-500 text-right">Valor</th>
                  <th className="px-3 py-2 font-semibold text-slate-500">Categoria</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{r.data}</td>
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-white max-w-[140px] truncate">{r.descricao}</td>
                    <td className="px-3 py-2 text-right font-bold text-red-600">{fmt(r.valor)}</td>
                    <td className="px-3 py-2 text-slate-500">{r.categoria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm text-slate-500">Total importado:</span>
            <span className="font-black text-red-600">{fmt(rows.reduce((s, r) => s + r.valor, 0))}</span>
          </div>
          {error && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
          <button onClick={handleImport} disabled={importing} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
            {importing ? 'Importando...' : `Confirmar e Importar ${rows.length} Lançamentos`}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <CheckCircle className="text-green-500" size={56} />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Importação Concluída!</h3>
          <p className="text-sm text-slate-500 text-center">{rows.length} lançamentos foram adicionados às suas despesas.</p>
          <button onClick={handleClose} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition">Fechar</button>
        </div>
      )}
    </ModalWrapper>
  );
};

// ========================
// MODAL NOVA META
// ========================
interface NovaMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CFMeta, 'id' | 'user_id' | 'created_at'>) => Promise<unknown>;
}

export const NovaMetaModal = ({ isOpen, onClose, onSave }: NovaMetaModalProps) => {
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '0', deadline: '', icon: '🎯' });
  const [saving, setSaving] = useState(false);
  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const icons = ['🎯', '✈️', '🏠', '🚗', '💊', '🎓', '💼', '🌴', '💍', '📱'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name: form.name,
      target_amount: Number(form.target_amount),
      current_amount: Number(form.current_amount),
      deadline: form.deadline,
      icon: form.icon,
      status: 'ativa',
    });
    setSaving(false);
    setForm({ name: '', target_amount: '', current_amount: '0', deadline: '', icon: '🎯' });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="🎯 Nova Meta Financeira">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Ícone</label>
          <div className="flex gap-2 flex-wrap">
            {icons.map((ic) => (
              <button key={ic} type="button" onClick={() => set('icon')(ic)}
                className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition ${form.icon === ic ? 'bg-primary/20 ring-2 ring-primary' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}>
                {ic}
              </button>
            ))}
          </div>
        </div>
        <InputField label="Nome da Meta" value={form.name} onChange={set('name')} required placeholder="Ex: Viagem para Europa" />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Valor da Meta (R$)" type="number" value={form.target_amount} onChange={set('target_amount')} required placeholder="15000" />
          <InputField label="Já Guardado (R$)" type="number" value={form.current_amount} onChange={set('current_amount')} placeholder="0" />
        </div>
        <InputField label="Prazo" type="date" value={form.deadline} onChange={set('deadline')} required />
        <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
          {saving ? 'Salvando...' : 'Salvar Meta'}
        </button>
      </form>
    </ModalWrapper>
  );
};

// ========================
// MODAL NOVO FINANCIAMENTO
// ========================
interface NovoFinanciamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CFFinancing, 'id' | 'user_id' | 'created_at'>) => Promise<unknown>;
}

export const NovoFinanciamentoModal = ({ isOpen, onClose, onSave }: NovoFinanciamentoModalProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    name: '',
    institution: '',
    total_amount: '',
    down_payment: '0',
    installments_total: '',
    installment_value: '',
    due_day: '',
    interest_rate: '0',
    start_date: today
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Informe o nome do financiamento.'); return; }
    if (!form.institution.trim()) { setError('Informe a instituição.'); return; }
    if (!form.total_amount || Number(form.total_amount) <= 0) { setError('Informe o valor total válido.'); return; }
    if (!form.installments_total || Number(form.installments_total) <= 0) { setError('Informe a quantidade de parcelas.'); return; }
    if (!form.installment_value || Number(form.installment_value) <= 0) { setError('Informe o valor da parcela.'); return; }
    const dueDayNum = Number(form.due_day);
    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) { setError('Dia de vencimento deve ser entre 1 e 31.'); return; }

    setSaving(true); setError('');
    const totalAmount = Number(form.total_amount);
    const downPayment = Number(form.down_payment) || 0;
    const err = await onSave({
      institution: form.institution.trim(),
      asset_name: form.name.trim(),
      original_amount: totalAmount,
      down_payment: downPayment,
      remaining_balance: totalAmount - downPayment,
      total_installments: Number(form.installments_total),
      paid_installments: 0,
      installment_value: Number(form.installment_value),
      due_day: dueDayNum,
      interest_rate: Number(form.interest_rate) || 0,
      start_date: form.start_date
    });
    setSaving(false);
    if (err) {
      const msg = (err as { message?: string }).message;
      setError(`Erro ao salvar financiamento: ${msg || 'Verifique a conexão com o banco.'}`);
      console.error('[NovoFinanciamentoModal] Erro completo:', err);
      return;
    }
    setForm({
      name: '',
      institution: '',
      total_amount: '',
      down_payment: '0',
      installments_total: '',
      installment_value: '',
      due_day: '',
      interest_rate: '0',
      start_date: today
    });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="🏦 Novo Financiamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Nome do Financiamento *" value={form.name} onChange={set('name')} required placeholder="Ex: Financiamento Carro" />
        <InputField label="Instituição Bancária *" value={form.institution} onChange={set('institution')} required placeholder="Ex: Banco Itaú" />
        
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Valor Financiado (R$) *" type="number" value={form.total_amount} onChange={set('total_amount')} required placeholder="0,00" />
          <InputField label="Entrada (R$)" type="number" value={form.down_payment} onChange={set('down_payment')} placeholder="0,00" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Total de Parcelas *" type="number" value={form.installments_total} onChange={set('installments_total')} required placeholder="Ex: 36" />
          <InputField label="Valor da Parcela (R$) *" type="number" value={form.installment_value} onChange={set('installment_value')} required placeholder="0,00" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <InputField label="Data de Início *" type="date" value={form.start_date} onChange={set('start_date')} required />
          </div>
          <div>
            <InputField label="Dia Venc. *" type="number" value={form.due_day} onChange={set('due_day')} required placeholder="1-31" />
          </div>
        </div>

        <InputField label="Taxa de Juros A.M. (%)" type="number" value={form.interest_rate} onChange={set('interest_rate')} placeholder="Ex: 1.5" />

        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
        <button type="submit" disabled={saving} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
          {saving ? 'Salvando...' : 'Salvar Financiamento'}
        </button>
      </form>
    </ModalWrapper>
  );
};

// ========================
// MODAL NOVA MOVIMENTAÇÃO (Receita ou Despesa unificado)
// ========================
interface NovaMovimentacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReceita: (data: Omit<CFReceita, 'id' | 'user_id' | 'created_at'>) => Promise<unknown>;
  onSaveDespesa: (data: Omit<CFDespesa, 'id' | 'user_id' | 'created_at'>) => Promise<unknown>;
  cartoes: CFCreditCard[];
  receitasCategorias: CFCategory[];
  despesasCategorias: CFCategory[];
}

export const NovaMovimentacaoModal = ({
  isOpen, onClose, onSaveReceita, onSaveDespesa, cartoes, receitasCategorias, despesasCategorias
}: NovaMovimentacaoModalProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [tipoMovimentacao, setTipoMovimentacao] = useState<'receita' | 'despesa' | null>(null);
  const [form, setForm] = useState({ date: today, description: '', category: '', origin: '', amount: '', status: 'pendente', tipoDespesa: '', due_date: '', card_id: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const handleClose = () => {
    setTipoMovimentacao(null);
    setForm({ date: today, description: '', category: '', origin: '', amount: '', status: 'pendente', tipoDespesa: '', due_date: '', card_id: '' });
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setError('Informe um valor válido.'); return; }
    if (!form.description.trim()) { setError('Informe uma descrição.'); return; }
    setSaving(true); setError('');

    if (tipoMovimentacao === 'receita') {
      const err = await onSaveReceita({
        date: form.date,
        description: form.description,
        category: form.category || 'Outros',
        origin: form.origin,
        amount: Number(form.amount),
      });
      setSaving(false);
      if (err) { setError('Erro ao salvar receita.'); return; }
    } else {
      if (!form.tipoDespesa) { setError('Selecione o tipo de despesa.'); setSaving(false); return; }
      const card = cartoes.find(c => c.id === form.card_id);
      const err = await onSaveDespesa({
        date: form.date,
        description: form.description,
        type: form.tipoDespesa as CFDespesa['type'],
        category: form.category || 'Outros',
        amount: Number(form.amount),
        card_id: form.card_id || undefined,
        card_name: card?.name || undefined,
        due_date: form.due_date || undefined,
        status: (form.status as 'pendente' | 'pago') || 'pendente',
      });
      setSaving(false);
      if (err) { setError('Erro ao salvar despesa.'); return; }
    }
    handleClose();
  };

  const recCats = receitasCategorias.map(c => ({ value: c.name, label: c.name }));
  const despCats = despesasCategorias.map(c => ({ value: c.name, label: c.name }));

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} title="📋 Nova Movimentação">
      {!tipoMovimentacao ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 mb-4">Selecione o tipo de movimentação:</p>
          <button onClick={() => setTipoMovimentacao('receita')}
            className="w-full p-4 rounded-xl border-2 border-green-200 hover:border-green-500 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 transition text-left">
            <p className="text-lg font-bold text-green-700 dark:text-green-400">💰 Receita</p>
            <p className="text-xs text-slate-500 mt-1">Salário, venda, comissão, aluguel recebido...</p>
          </button>
          <button onClick={() => setTipoMovimentacao('despesa')}
            className="w-full p-4 rounded-xl border-2 border-red-200 hover:border-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 transition text-left">
            <p className="text-lg font-bold text-red-700 dark:text-red-400">💸 Despesa</p>
            <p className="text-xs text-slate-500 mt-1">Compras, faturas, gastos diários...</p>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${tipoMovimentacao === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
              {tipoMovimentacao === 'receita' ? '💰 Receita' : '💸 Despesa'}
            </span>
            <button type="button" onClick={() => setTipoMovimentacao(null)} className="text-xs text-slate-400 underline">Trocar</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Data" type="date" value={form.date} onChange={set('date')} required />
            <InputField label="Valor (R$)" type="number" value={form.amount} onChange={set('amount')} required placeholder="0,00" />
          </div>
          <InputField label="Descrição *" value={form.description} onChange={set('description')} required placeholder="Ex: Salário, Supermercado..." />

          <SelectField
            label="Categoria"
            value={form.category}
            onChange={set('category')}
            options={tipoMovimentacao === 'receita' ? recCats : despCats}
          />

          {tipoMovimentacao === 'receita' && (
            <InputField label="Origem" value={form.origin} onChange={set('origin')} placeholder="Ex: Empresa XYZ" />
          )}

          {tipoMovimentacao === 'despesa' && (
            <>
              <SelectField label="Tipo de Despesa *" value={form.tipoDespesa} onChange={set('tipoDespesa')} required options={[
                { value: 'gasto_diario', label: '🛒 Gasto Diário' },
                { value: 'conta_fixa', label: '📄 Conta Fixa' },
                { value: 'cartao', label: '💳 Cartão de Crédito' },
                { value: 'assinatura', label: '🔄 Assinatura' },
                { value: 'financiamento', label: '🏦 Financiamento' },
                { value: 'outros', label: '📌 Outros' },
              ]} />
              <SelectField label="Status" value={form.status} onChange={set('status')} options={[
                { value: 'pendente', label: 'Pendente' },
                { value: 'pago', label: 'Pago' },
              ]} />
              {(form.tipoDespesa === 'cartao' || form.tipoDespesa === 'conta_fixa' || form.tipoDespesa === 'financiamento') && (
                <InputField label="Data de Vencimento" type="date" value={form.due_date} onChange={set('due_date')} />
              )}
              {form.tipoDespesa === 'cartao' && cartoes.length > 0 && (
                <SelectField label="Cartão" value={form.card_id} onChange={set('card_id')} options={cartoes.map(c => ({ value: c.id, label: c.name }))} />
              )}
            </>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={saving}
            className={`w-full font-bold py-3 rounded-xl transition disabled:opacity-60 text-white ${
              tipoMovimentacao === 'receita' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}>
            {saving ? 'Salvando...' : tipoMovimentacao === 'receita' ? 'Salvar Receita' : 'Salvar Despesa'}
          </button>
        </form>
      )}
    </ModalWrapper>
  );
};

// ========================
// MODAL NOVO CUSTO FIXO MENSAL
// ========================
interface NovoCustoFixoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string, category: string, amount: number, diaVencimento: number, ativo?: boolean) => Promise<unknown>;
  despesasCategorias: CFCategory[];
}

export const NovoCustoFixoModal = ({ isOpen, onClose, onSave, despesasCategorias }: NovoCustoFixoModalProps) => {
  const [form, setForm] = useState({ description: '', category: '', amount: '', diaVencimento: '1', ativo: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const sugestoes = ['Aluguel', 'Energia', 'Água', 'Internet', 'Sistema', 'Funcionários', 'Seguro', 'Assinatura', 'Telefone', 'Contador'];
  const cats = despesasCategorias.map(c => ({ value: c.name, label: c.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) { setError('Informe a descrição.'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError('Informe um valor válido.'); return; }
    const dia = Number(form.diaVencimento);
    if (isNaN(dia) || dia < 1 || dia > 31) { setError('Dia de vencimento deve ser entre 1 e 31.'); return; }
    setSaving(true); setError('');
    const err = await onSave(form.description.trim(), form.category || 'Custos Fixos', Number(form.amount), dia, form.ativo);
    setSaving(false);
    if (err) { setError('Erro ao salvar custo fixo.'); return; }
    setForm({ description: '', category: '', amount: '', diaVencimento: '1', ativo: true });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="📌 Novo Custo Fixo Mensal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Sugestões rápidas</label>
          <div className="flex flex-wrap gap-1.5">
            {sugestoes.map(s => (
              <button key={s} type="button"
                onClick={() => setForm(f => ({ ...f, description: s }))}
                className={`text-xs px-2.5 py-1 rounded-lg border transition font-semibold ${
                  form.description === s
                    ? 'bg-primary text-white border-primary'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <InputField label="Descrição *" value={form.description} onChange={set('description')} required placeholder="Ex: Aluguel do escritório" />
        <SelectField label="Categoria" value={form.category} onChange={set('category')} options={cats.length ? cats : [{ value: 'Custos Fixos', label: 'Custos Fixos' }]} />

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Valor Mensal (R$) *" type="number" value={form.amount} onChange={set('amount')} required placeholder="0,00" />
          <InputField label="Dia de Vencimento *" type="number" value={form.diaVencimento} onChange={set('diaVencimento')} required placeholder="1-31" />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              form.ativo ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
              form.ativo ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {form.ativo ? 'Ativo — impacta Débitos a Pagar' : 'Inativo — não impacta o Dashboard'}
          </span>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" disabled={saving}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
          {saving ? 'Salvando...' : 'Salvar Custo Fixo'}
        </button>
      </form>
    </ModalWrapper>
  );
};
