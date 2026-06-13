-- =========================================================================================
-- SCRIPT DE COMPLEMENTO DO BANCO DE DADOS - CENTRAL FINANCEIRA
-- Execute este script no SQL Editor do Supabase após o primeiro.
-- =========================================================================================

-- 1. Contas Bancárias
CREATE TABLE public.cf_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    agency TEXT,
    account_number TEXT,
    account_type TEXT NOT NULL CHECK (account_type IN ('corrente', 'poupanca', 'pagamento', 'empresarial')),
    balance NUMERIC NOT NULL DEFAULT 0,
    overdraft_limit NUMERIC DEFAULT 0,
    overdraft_used NUMERIC DEFAULT 0,
    business_limit NUMERIC DEFAULT 0,
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Investimentos
CREATE TABLE public.cf_investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    invested_amount NUMERIC NOT NULL DEFAULT 0,
    profitability NUMERIC DEFAULT 0,
    liquidity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- APLICAÇÃO DE RLS (ROW LEVEL SECURITY)
ALTER TABLE public.cf_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bank accounts" ON public.cf_bank_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own investments" ON public.cf_investments FOR ALL USING (auth.uid() = user_id);
