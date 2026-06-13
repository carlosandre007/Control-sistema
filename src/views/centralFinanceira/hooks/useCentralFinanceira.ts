import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';

// ========================
// TYPES
// ========================
export interface CFCategory {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  created_at: string;
}

export interface CFReceita {
  id: string;
  user_id: string;
  date: string;
  description: string;
  category: string;
  origin: string;
  amount: number;
  created_at: string;
}

export interface CFDespesa {
  id: string;
  user_id: string;
  date: string;
  description: string;
  type: 'cartao' | 'conta_fixa' | 'financiamento' | 'assinatura' | 'gasto_diario' | 'parcela_manual' | 'outros';
  category: string;
  amount: number;
  payment_method?: 'dinheiro' | 'pix' | 'conta_bancaria' | 'cartao_credito' | 'cartao_debito';
  card_id?: string;
  card_name?: string;
  financing_id?: string;
  installments_total?: number;
  installments_paid?: number;
  installment_number?: number;
  due_date?: string;
  status: 'pendente' | 'pago' | 'atrasado';
  created_at: string;
}

// Custo Fixo: usamos cf_expenses com installments_total = -1
// card_name = 'ativo' | 'inativo' (status)
// installments_paid = dia do vencimento
export interface CFCustoFixo {
  id: string;
  user_id: string;
  description: string;
  category: string;
  amount: number;
  diaVencimento: number;  // armazenado em installments_paid
  ativo: boolean;         // armazenado em card_name ('ativo' | 'inativo')
  created_at: string;
}

export interface CFCreditCard {
  id: string;
  user_id: string;
  name: string;
  issuer_bank?: string;
  limit_amount: number;
  used_limit: number;
  available_limit?: number;
  closing_day: number;
  due_day: number;
  interest_rate?: number;
  created_at: string;
}

export interface CFBankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  agency?: string;
  account_number?: string;
  account_type: 'corrente' | 'poupanca' | 'pagamento' | 'empresarial';
  balance: number;
  overdraft_limit?: number;
  overdraft_used?: number;
  business_limit?: number;
  observation?: string;
  created_at: string;
}

export interface CFFinancing {
  id: string;
  user_id: string;
  institution: string;
  asset_name: string;
  original_amount: number;
  down_payment: number;
  remaining_balance: number;
  interest_rate?: number;
  total_installments: number;
  paid_installments: number;
  installment_value: number;
  due_day: number;
  start_date: string;
  created_at: string;
}

export interface CFInvestment {
  id: string;
  user_id: string;
  type: 'poupança' | 'CDB' | 'tesouro' | 'fundos' | 'outros';
  description: string;
  invested_amount: number;
  profitability?: number;
  liquidity: string;
  created_at: string;
}

export interface CFMeta {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: 'ativa' | 'pausada' | 'concluida';
  icon: string;
  created_at: string;
}

export interface CFFaturaRow {
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
}

// Helper
const addMonths = (dateStr: string, months: number) => {
  const date = new Date(dateStr + 'T12:00:00');
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

// Mapper: row from cf_expenses → CFCustoFixo
const rowToCustoFixo = (row: Record<string, unknown>): CFCustoFixo => ({
  id: row.id as string,
  user_id: row.user_id as string,
  description: row.description as string,
  category: row.category as string,
  amount: Number(row.amount),
  diaVencimento: Number(row.installments_paid) || 1,
  ativo: (row.card_name as string) !== 'inativo',
  created_at: row.created_at as string,
});

// ========================
// HOOK PRINCIPAL
// ========================
export function useCentralFinanceira() {
  const [categories, setCategories] = useState<CFCategory[]>([]);
  const [receitas, setReceitas] = useState<CFReceita[]>([]);
  const [despesas, setDespesas] = useState<CFDespesa[]>([]);
  const [custosFixosRaw, setCustosFixosRaw] = useState<CFCustoFixo[]>([]);
  const [metas, setMetas] = useState<CFMeta[]>([]);
  const [cartoes, setCartoes] = useState<CFCreditCard[]>([]);
  const [contas, setContas] = useState<CFBankAccount[]>([]);
  const [financiamentos, setFinanciamentos] = useState<CFFinancing[]>([]);
  const [investimentos, setInvestimentos] = useState<CFInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [catRes, rRes, dRes, cfRes, mRes, cRes, bRes, fRes, iRes] = await Promise.all([
        supabase.from('cf_categories').select('*').eq('user_id', userId).order('name', { ascending: true }),
        supabase.from('cf_income').select('*').eq('user_id', userId).order('date', { ascending: false }),
        // Despesas comuns: installments_total IS NULL or != -1
        supabase.from('cf_expenses').select('*').eq('user_id', userId)
          .neq('installments_total', -1).order('date', { ascending: false }),
        // Custos Fixos: installments_total = -1
        supabase.from('cf_expenses').select('*').eq('user_id', userId)
          .eq('installments_total', -1).order('description', { ascending: true }),
        supabase.from('cf_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('cf_credit_cards').select('*').eq('user_id', userId).order('name', { ascending: true }),
        supabase.from('cf_bank_accounts').select('*').eq('user_id', userId).order('bank_name', { ascending: true }),
        supabase.from('cf_financings').select('*').eq('user_id', userId).order('institution', { ascending: true }),
        supabase.from('cf_investments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);
      if (catRes.data) setCategories(catRes.data as CFCategory[]);
      if (rRes.data) setReceitas(rRes.data as CFReceita[]);
      if (dRes.data) setDespesas(dRes.data as CFDespesa[]);
      if (cfRes.data) setCustosFixosRaw(cfRes.data.map(rowToCustoFixo));
      if (mRes.data) setMetas(mRes.data as CFMeta[]);
      if (cRes.data) setCartoes(cRes.data as CFCreditCard[]);
      if (bRes.data) setContas(bRes.data as CFBankAccount[]);
      if (fRes.data) setFinanciamentos(fRes.data as CFFinancing[]);
      if (iRes.data) setInvestimentos(iRes.data as CFInvestment[]);
    } catch (err) {
      console.error('Error fetching Central Financeira data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAll();
  }, [userId, fetchAll]);

  // ========================
  // CRUD CATEGORIAS
  // ========================
  const addCategory = async (name: string, type: 'income' | 'expense', color?: string) => {
    if (!userId) return;
    const { error } = await supabase.from('cf_categories').insert({ name, type, color, user_id: userId });
    if (!error) fetchAll();
    return error;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('cf_categories').delete().eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  const updateCategory = async (id: string, name: string, color?: string) => {
    const { error } = await supabase.from('cf_categories').update({ name, color }).eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  const receitasCategorias = categories.filter(c => c.type === 'income');
  const despesasCategorias = categories.filter(c => c.type === 'expense');

  // ========================
  // CRUD RECEITAS
  // ========================
  const addReceita = async (data: Omit<CFReceita, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;
    const { error } = await supabase.from('cf_income').insert({ ...data, user_id: userId });
    if (!error) fetchAll();
    return error;
  };

  const deleteReceita = async (id: string) => {
    const { error } = await supabase.from('cf_income').delete().eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  // ========================
  // CRUD DESPESAS
  // ========================
  const addDespesa = async (data: Omit<CFDespesa, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;
    const { error } = await supabase.from('cf_expenses').insert({ ...data, user_id: userId });
    if (!error) fetchAll();
    return error;
  };

  const deleteDespesa = async (id: string) => {
    const { error } = await supabase.from('cf_expenses').delete().eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  const markDespesaPaga = async (id: string) => {
    const { error } = await supabase.from('cf_expenses').update({ status: 'pago' }).eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  // ========================
  // CRUD CUSTOS FIXOS MENSAIS
  // Armazenados em cf_expenses com installments_total = -1
  // card_name = 'ativo' | 'inativo' (status)
  // installments_paid = dia de vencimento
  // ========================
  const addCustoFixo = async (
    description: string,
    category: string,
    amount: number,
    diaVencimento: number,
    ativo: boolean = true
  ) => {
    if (!userId) return;
    const payload = {
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      description,
      type: 'conta_fixa' as const,
      category,
      amount,
      installments_total: -1,           // marcador de custo fixo
      installments_paid: diaVencimento, // dia do vencimento
      card_name: ativo ? 'ativo' : 'inativo',
      status: 'pendente' as const,
    };
    const { error } = await supabase.from('cf_expenses').insert(payload);
    if (!error) fetchAll();
    return error;
  };

  const deleteCustoFixo = async (id: string) => {
    const { error } = await supabase.from('cf_expenses').delete().eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  const toggleCustoFixoStatus = async (id: string, ativo: boolean) => {
    const { error } = await supabase
      .from('cf_expenses')
      .update({ card_name: ativo ? 'ativo' : 'inativo' })
      .eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  // ========================
  // CRUD CARTÕES
  // ========================
  const addCartao = async (data: Omit<CFCreditCard, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;
    const { error } = await supabase.from('cf_credit_cards').insert({ ...data, user_id: userId });
    if (!error) fetchAll();
    return error;
  };

  const deleteCartao = async (id: string) => {
    const { error } = await supabase.from('cf_credit_cards').delete().eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  // ========================
  // CRUD CONTAS
  // ========================
  const addConta = async (data: Omit<CFBankAccount, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;
    const { error } = await supabase.from('cf_bank_accounts').insert({ ...data, user_id: userId });
    if (!error) fetchAll();
    return error;
  };

  const deleteConta = async (id: string) => {
    const { error } = await supabase.from('cf_bank_accounts').delete().eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  // ========================
  // CRUD FINANCIAMENTOS
  // ========================
  const addFinanciamento = async (data: Omit<CFFinancing, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) {
      console.error('[addFinanciamento] userId nulo — usuário não autenticado.');
      return new Error('Usuário não autenticado.');
    }
    const payload = {
      user_id: userId,
      institution: data.institution,
      asset_name: data.asset_name,
      original_amount: data.original_amount,
      down_payment: data.down_payment ?? 0,
      remaining_balance: data.remaining_balance,
      interest_rate: data.interest_rate ?? 0,
      total_installments: data.total_installments,
      paid_installments: data.paid_installments ?? 0,
      installment_value: data.installment_value,
      due_day: data.due_day,
      start_date: data.start_date,
    };
    console.log('[addFinanciamento] Payload enviado:', payload);
    console.log('[addFinanciamento] Executando insert no Supabase...');
    const { data: finDataArray, error: finError } = await supabase
      .from('cf_financings')
      .insert(payload)
      .select();
    console.log('[addFinanciamento] Resposta recebida:', { finDataArray, finError });
    if (finError) {
      console.error('[addFinanciamento] Erro ao inserir financiamento:', finError.message, finError.details, finError.hint);
      return finError;
    }
    const finData = finDataArray?.[0];
    if (!finData) {
      console.error('[addFinanciamento] Nenhum dado retornado (array vazio) após inserção.');
      return new Error('Nenhum dado retornado após inserção.');
    }
    console.log('[addFinanciamento] Financiamento cadastrado com sucesso:', finData.id);
    await fetchAll();
    return null;
  };

  const deleteFinanciamento = async (id: string) => {
    await supabase.from('cf_expenses').delete().eq('financing_id', id);
    const { error } = await supabase.from('cf_financings').delete().eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  // ========================
  // CRUD INVESTIMENTOS
  // ========================
  const addInvestimento = async (data: Omit<CFInvestment, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;
    const { error } = await supabase.from('cf_investments').insert({ ...data, user_id: userId });
    if (!error) fetchAll();
    return error;
  };

  const deleteInvestimento = async (id: string) => {
    const { error } = await supabase.from('cf_investments').delete().eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  // ========================
  // CRUD METAS
  // ========================
  const addMeta = async (data: Omit<CFMeta, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;
    const { error } = await supabase.from('cf_goals').insert({ ...data, user_id: userId });
    if (!error) fetchAll();
    return error;
  };

  const deleteMeta = async (id: string) => {
    const { error } = await supabase.from('cf_goals').delete().eq('id', id);
    if (!error) fetchAll();
    return error;
  };

  // ========================
  // IMPORTAR FATURA DE CARTÃO
  // ========================
  const importarFatura = async (rows: CFFaturaRow[], cardId: string) => {
    if (!userId) return;
    const card = cartoes.find(c => c.id === cardId);
    const cardName = card ? card.name : 'Cartão';
    const inserts = rows.map((r) => ({
      user_id: userId,
      date: r.data,
      description: r.descricao,
      type: 'cartao' as const,
      category: r.categoria || 'Cartão',
      amount: r.valor,
      card_id: cardId,
      card_name: cardName,
      status: 'pendente' as const,
    }));
    if (card) {
      const totalImported = rows.reduce((s, r) => s + r.valor, 0);
      const newUsed = card.used_limit + totalImported;
      await supabase.from('cf_credit_cards')
        .update({ used_limit: newUsed, available_limit: Math.max(0, card.limit_amount - newUsed) })
        .eq('id', card.id);
    }
    const { error } = await supabase.from('cf_expenses').insert(inserts);
    if (!error) fetchAll();
    return error;
  };

  // ========================
  // CÁLCULOS DO DASHBOARD (NOVOS CARDS)
  // ========================
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  // CARD 1: Receitas do Mês (cf_income do mês atual)
  const receitasMes = receitas
    .filter(r => r.date.startsWith(currentMonth))
    .reduce((s, r) => s + Number(r.amount), 0);

  // CARD 2: Despesas Pagas (despesas comuns pagas no mês atual)
  const despesasPagas = despesas
    .filter(d => d.status === 'pago' && d.date.startsWith(currentMonth))
    .reduce((s, d) => s + Number(d.amount), 0);

  // Custos fixos ativos (independente do mês — são recorrentes)
  const custosFixos = custosFixosRaw;
  const totalCustosFixosAtivos = custosFixosRaw
    .filter(cf => cf.ativo)
    .reduce((s, cf) => s + Number(cf.amount), 0);

  // CARD 3: Débitos a Pagar (mês atual)
  // = custos fixos ativos + despesas comuns pendentes/atrasadas do mês atual + parcelas de financiamentos mensais
  const despesasPendentsMes = despesas
    .filter(d => d.status !== 'pago' && d.date.startsWith(currentMonth))
    .reduce((s, d) => s + Number(d.amount), 0);

  // Parcelas mensais de financiamentos ativos (somam como compromisso mensal)
  const parcelasFinanciamentos = financiamentos.reduce((s, f) => s + Number(f.installment_value), 0);

  const debitosAPagar = totalCustosFixosAtivos + despesasPendentsMes + parcelasFinanciamentos;

  // CARD 4: Saldo Previsto = Receitas - Despesas Pagas - Débitos a Pagar
  const saldoPrevisto = receitasMes - despesasPagas - debitosAPagar;

  // Legados (mantidos para compatibilidade com componentes existentes)
  const despesasMes = despesas
    .filter(d => d.date.startsWith(currentMonth))
    .reduce((s, d) => s + Number(d.amount), 0);
  const resultadoMes = receitasMes - despesasMes;
  const totalDividas = despesas.filter(d => d.status !== 'pago').reduce((s, d) => s + Number(d.amount), 0);
  const limiteTotalCartoes = cartoes.reduce((s, c) => s + Number(c.limit_amount), 0);
  const limiteUtilizadoCartoes = cartoes.reduce((s, c) => s + Number(c.used_limit), 0);
  const limiteDisponivelCartoes = limiteTotalCartoes - limiteUtilizadoCartoes;
  const valorComprometido = despesas
    .filter(d => d.status !== 'pago' && d.date.startsWith(currentMonth))
    .reduce((s, d) => s + Number(d.amount), 0);
  const saldoGeral = contas.reduce((s, c) => s + Number(c.balance), 0) +
    investimentos.reduce((s, i) => s + Number(i.invested_amount), 0);

  // Vencimentos
  const getVencimentosComFiltro = (dias: number) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limiteDia = new Date(hoje);
    limiteDia.setDate(hoje.getDate() + dias);
    return despesas.filter(d => {
      if (d.status === 'pago') return false;
      const due = d.due_date ? new Date(d.due_date + 'T12:00:00') : new Date(d.date + 'T12:00:00');
      if (dias === 0) return due.getTime() === hoje.getTime();
      return due >= hoje && due <= limiteDia;
    }).sort((a, b) => {
      const da = a.due_date ? new Date(a.due_date + 'T12:00:00') : new Date(a.date + 'T12:00:00');
      const db = b.due_date ? new Date(b.due_date + 'T12:00:00') : new Date(b.date + 'T12:00:00');
      return da.getTime() - db.getTime();
    });
  };
  const proximosVencimentos = getVencimentosComFiltro(5);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const atrasadas = despesas.filter(d => {
    if (d.status === 'pago') return false;
    const due = d.due_date ? new Date(d.due_date + 'T12:00:00') : new Date(d.date + 'T12:00:00');
    return due < hoje;
  });

  const gastosPorCategoria = despesas
    .filter(d => d.date.startsWith(currentMonth))
    .reduce<Record<string, number>>((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + Number(d.amount);
      return acc;
    }, {});

  const assinaturas = despesas.filter(d => d.type === 'assinatura' && d.status !== 'pago');
  const totalAssinaturas = assinaturas.reduce((s, d) => s + Number(d.amount), 0);

  // ========================
  // MOTOR DE INTELIGÊNCIA FINANCEIRA (MELHORADO)
  // ========================
  const insights: string[] = [];
  const despesasSuperfluas: { desc: string; economiaEstimada: number }[] = [];

  // Análise de financiamentos — sempre gera insights se existirem
  if (financiamentos.length > 0) {
    const totalParcelasMes = financiamentos.reduce((s, f) => s + Number(f.installment_value), 0);
    const totalRestante = financiamentos.reduce((s, f) => {
      const restantes = f.total_installments - f.paid_installments;
      return s + restantes * f.installment_value;
    }, 0);
    const totalParcelasRestantes = financiamentos.reduce(
      (s, f) => s + Math.max(0, f.total_installments - f.paid_installments), 0
    );
    const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    insights.push(`🏦 Você possui ${financiamentos.length} financiamento(s) ativo(s) comprometendo ${fmt(totalParcelasMes)}/mês.`);

    financiamentos.forEach(f => {
      const restantes = Math.max(0, f.total_installments - f.paid_installments);
      const mesesRestantes = restantes;
      if (restantes > 0) {
        insights.push(`📅 "${f.asset_name}": restam ${restantes} parcelas de ${fmt(f.installment_value)} — quitação em ~${mesesRestantes} meses.`);
      }
    });

    if (totalRestante > 0) {
      insights.push(`💰 Saldo devedor total dos financiamentos: ${fmt(totalRestante)}.`);
    }

    if (receitasMes > 0) {
      const pctFinanciamento = (totalParcelasMes / receitasMes) * 100;
      insights.push(`📊 Financiamentos comprometem ${Math.round(pctFinanciamento)}% das suas receitas mensais.`);
      if (pctFinanciamento > 30) {
        insights.push(`⚠️ Comprometimento acima de 30% da renda com financiamentos. Considere amortização antecipada.`);
      }
    }

    if (saldoPrevisto > 0 && totalParcelasMes > 0) {
      const parcelasAntecipadas = Math.floor(saldoPrevisto / financiamentos[0]?.installment_value || 1);
      if (parcelasAntecipadas >= 1) {
        insights.push(`💡 Com o saldo previsto positivo, seria possível antecipar ~${parcelasAntecipadas} parcela(s) e reduzir o prazo.`);
      }
    }

    insights.push(`🎯 Considere direcionar parte do saldo positivo mensal para amortizar os financiamentos.`);
  }

  // Custos fixos
  if (totalCustosFixosAtivos > 0) {
    insights.push(`📌 Seus custos fixos mensais somam R$ ${totalCustosFixosAtivos.toFixed(2).replace('.', ',')}.`);
    if (receitasMes > 0) {
      const pctCF = (totalCustosFixosAtivos / receitasMes) * 100;
      if (pctCF > 50) {
        insights.push(`⚠️ Custos fixos representam ${Math.round(pctCF)}% das receitas. Revise os gastos obrigatórios.`);
      }
    }
  }

  if (totalAssinaturas > 0) {
    insights.push(`🔄 Você possui R$ ${totalAssinaturas.toFixed(2).replace('.', ',')} em assinaturas recorrentes ativas.`);
    if (totalAssinaturas > 150) {
      despesasSuperfluas.push({ desc: 'Assinaturas e aplicativos recorrentes acumulados', economiaEstimada: totalAssinaturas * 0.3 });
    }
  }

  if (receitasMes > 0) {
    const pctComprometimento = (despesasMes / receitasMes) * 100;
    if (pctComprometimento > 70) {
      insights.push(`⚠️ Suas despesas representam ${Math.round(pctComprometimento)}% das receitas este mês. Risco de endividamento.`);
    }
  }

  const chequeEspecialUsado = contas.reduce((s, c) => s + Number(c.overdraft_used || 0), 0);
  if (chequeEspecialUsado > 0) {
    insights.push(`🚨 Você está utilizando R$ ${chequeEspecialUsado.toFixed(2).replace('.', ',')} do cheque especial. Regularize para evitar juros.`);
  }

  cartoes.forEach(c => {
    if (c.limit_amount > 0) {
      const pct = (c.used_limit / c.limit_amount) * 100;
      if (pct > 80) {
        insights.push(`💳 Cartão ${c.name}: limite ${Math.round(pct)}% comprometido.`);
      }
    }
  });

  if (atrasadas.length > 0) {
    insights.push(`🔴 Você possui ${atrasadas.length} pendência(s) em atraso. Regularize para evitar multas.`);
  }

  // Fallback — nenhum insight gerado ainda
  if (insights.length === 0) {
    if (receitasMes > 0 || despesasMes > 0) {
      insights.push(`✅ Suas finanças estão equilibradas este mês. Continue registrando seus lançamentos!`);
    } else {
      insights.push(`📋 Comece cadastrando suas receitas, despesas ou financiamentos para receber análises personalizadas.`);
    }
  }

  const economiaEstimadaTotal = despesasSuperfluas.reduce((s, item) => s + item.economiaEstimada, 0);

  // Estratégias de quitação (baseadas nas despesas comuns)
  const dividasAtivas = despesas.filter(
    d => d.status !== 'pago' && ['cartao', 'financiamento', 'parcela_manual'].includes(d.type)
  );
  const bolaNeve = [...dividasAtivas].sort((a, b) => Number(a.amount) - Number(b.amount));
  const avalanche = [...dividasAtivas].sort((a, b) => Number(b.amount) - Number(a.amount));
  const hibrido = [...dividasAtivas].sort((a, b) => (Number(a.amount) * 0.5) - (Number(b.amount) * 0.5));

  return {
    categories, receitasCategorias, despesasCategorias,
    addCategory, deleteCategory, updateCategory,
    receitas, despesas, custosFixos, metas, cartoes, contas, financiamentos, investimentos,
    loading, fetchAll,
    addReceita, deleteReceita,
    addDespesa, deleteDespesa, markDespesaPaga,
    addCustoFixo, deleteCustoFixo, toggleCustoFixoStatus,
    addCartao, deleteCartao,
    addConta, deleteConta,
    addFinanciamento, deleteFinanciamento,
    addInvestimento, deleteInvestimento,
    addMeta, deleteMeta,
    importarFatura,
    // Novos cards do dashboard
    receitasMes, despesasPagas, debitosAPagar, saldoPrevisto,
    totalCustosFixosAtivos,
    // Legados para compatibilidade
    saldoGeral, despesasMes, resultadoMes, totalDividas,
    limiteDisponivelCartoes, valorComprometido,
    proximosVencimentos, getVencimentosComFiltro, atrasadas,
    gastosPorCategoria, assinaturas, totalAssinaturas,
    insights, despesasSuperfluas, economiaEstimadaTotal,
    bolaNeve, avalanche, hibrido, dividas: dividasAtivas,
    currentMonth,
  };
}
