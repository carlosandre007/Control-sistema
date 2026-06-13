-- =========================================================================================
-- SCRIPT COMPLEMENTAR DE TABELAS - CENTRAL FINANCEIRA V2 (COMPLETO)
-- Execute este script no SQL Editor do Supabase para garantir a existência de todas as tabelas.
-- =========================================================================================

-- 1. Categorias Customizadas
CREATE TABLE IF NOT EXISTS public.cf_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Contas Bancárias
CREATE TABLE IF NOT EXISTS public.cf_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bank_name TEXT NOT NULL,
    agency TEXT,
    account_number TEXT,
    account_type TEXT NOT NULL CHECK (account_type IN ('corrente', 'poupanca', 'pagamento', 'empresarial')),
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    overdraft_limit NUMERIC(12,2) DEFAULT 0,
    overdraft_used NUMERIC(12,2) DEFAULT 0,
    business_limit NUMERIC(12,2) DEFAULT 0,
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cartões de Crédito
CREATE TABLE IF NOT EXISTS public.cf_credit_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    issuer_bank TEXT NOT NULL,
    limit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    used_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
    closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    interest_rate NUMERIC(8,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Financiamentos
CREATE TABLE IF NOT EXISTS public.cf_financings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    institution TEXT NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    down_payment NUMERIC(12,2) DEFAULT 0,
    installments_total INTEGER NOT NULL,
    installment_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    interest_rate NUMERIC(8,4) DEFAULT 0,
    start_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Investimentos
CREATE TABLE IF NOT EXISTS public.cf_investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('poupança', 'CDB', 'tesouro', 'fundos', 'outros')),
    description TEXT NOT NULL,
    invested_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    profitability NUMERIC(8,4) DEFAULT 0,
    liquidity TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Metas Financeiras (Garantir colunas)
CREATE TABLE IF NOT EXISTS public.cf_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'concluida')),
    icon TEXT DEFAULT '🎯',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Despesas Unificadas (atualizações)
ALTER TABLE public.cf_expenses ADD COLUMN IF NOT EXISTS card_id UUID REFERENCES public.cf_credit_cards(id) ON DELETE SET NULL;
ALTER TABLE public.cf_expenses ADD COLUMN IF NOT EXISTS financing_id UUID REFERENCES public.cf_financings(id) ON DELETE SET NULL;
ALTER TABLE public.cf_expenses ADD COLUMN IF NOT EXISTS installment_number INTEGER;
ALTER TABLE public.cf_expenses ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('dinheiro', 'pix', 'conta_bancaria', 'cartao_credito', 'cartao_debito'));

-- Habilitar RLS
ALTER TABLE public.cf_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_financings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_goals ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DROP POLICY IF EXISTS "cf_categories_user" ON public.cf_categories;
CREATE POLICY "cf_categories_user" ON public.cf_categories FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cf_bank_accounts_user" ON public.cf_bank_accounts;
CREATE POLICY "cf_bank_accounts_user" ON public.cf_bank_accounts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cf_credit_cards_user" ON public.cf_credit_cards;
CREATE POLICY "cf_credit_cards_user" ON public.cf_credit_cards FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cf_financings_user" ON public.cf_financings;
CREATE POLICY "cf_financings_user" ON public.cf_financings FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cf_investments_user" ON public.cf_investments;
CREATE POLICY "cf_investments_user" ON public.cf_investments FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cf_goals_user" ON public.cf_goals;
CREATE POLICY "cf_goals_user" ON public.cf_goals FOR ALL USING (auth.uid() = user_id);
