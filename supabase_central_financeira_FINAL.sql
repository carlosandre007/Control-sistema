-- ============================================================
-- SCRIPT CENTRAL FINANCEIRA - TABELAS PRINCIPAIS
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Receitas (cf_income)
CREATE TABLE IF NOT EXISTS public.cf_income (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Outros',
    origin TEXT,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Despesas Unificadas (cf_expenses)
CREATE TABLE IF NOT EXISTS public.cf_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gasto_diario','conta_fixa','cartao','assinatura','financiamento')),
    category TEXT NOT NULL DEFAULT 'Outros',
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    card_name TEXT,
    installments_total INTEGER,
    installments_paid INTEGER DEFAULT 0,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','pago','atrasado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Metas Financeiras (cf_goals)
CREATE TABLE IF NOT EXISTS public.cf_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','pausada','concluida')),
    icon TEXT DEFAULT '🎯',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Contas Bancárias (cf_bank_accounts)
CREATE TABLE IF NOT EXISTS public.cf_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bank_name TEXT NOT NULL,
    agency TEXT,
    account_number TEXT,
    account_type TEXT NOT NULL DEFAULT 'corrente' CHECK (account_type IN ('corrente','poupanca','pagamento','empresarial')),
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    overdraft_limit NUMERIC(12,2) DEFAULT 0,
    overdraft_used NUMERIC(12,2) DEFAULT 0,
    business_limit NUMERIC(12,2) DEFAULT 0,
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Investimentos (cf_investments)
CREATE TABLE IF NOT EXISTS public.cf_investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    invested_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    profitability NUMERIC(8,4) DEFAULT 0,
    liquidity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- SEGURANÇA: Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.cf_income          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_expenses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_goals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_bank_accounts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_investments     ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuário vê apenas os próprios dados
CREATE POLICY "cf_income_user"        ON public.cf_income        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cf_expenses_user"      ON public.cf_expenses      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cf_goals_user"         ON public.cf_goals         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cf_bank_accounts_user" ON public.cf_bank_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cf_investments_user"   ON public.cf_investments   FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- ÍNDICES de performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cf_income_user_date    ON public.cf_income (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cf_expenses_user_date  ON public.cf_expenses (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cf_expenses_user_type  ON public.cf_expenses (user_id, type);
CREATE INDEX IF NOT EXISTS idx_cf_expenses_user_status ON public.cf_expenses (user_id, status);
CREATE INDEX IF NOT EXISTS idx_cf_goals_user          ON public.cf_goals (user_id);
