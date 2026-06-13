-- =========================================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - CENTRAL FINANCEIRA (ISOLADO)
-- Execute este script no SQL Editor do Supabase.
-- =========================================================================================

-- 1. Categorias
CREATE TABLE public.cf_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Contas a Pagar
CREATE TABLE public.cf_bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.cf_categories(id) ON DELETE SET NULL,
    company TEXT,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'vencido')) DEFAULT 'pendente',
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cartões de Crédito
CREATE TABLE public.cf_credit_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    limit_amount NUMERIC NOT NULL,
    available_limit NUMERIC NOT NULL,
    closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Lançamentos de Cartão (Parcelas)
CREATE TABLE public.cf_card_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.cf_credit_cards(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.cf_categories(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    installments INTEGER DEFAULT 1,
    current_installment INTEGER DEFAULT 1,
    total_amount NUMERIC NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Financiamentos
CREATE TABLE public.cf_financings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    original_amount NUMERIC NOT NULL,
    down_payment NUMERIC DEFAULT 0,
    remaining_balance NUMERIC NOT NULL,
    interest_rate NUMERIC NOT NULL,
    total_installments INTEGER NOT NULL,
    paid_installments INTEGER DEFAULT 0,
    installment_value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Parcelamentos Genéricos (Fora de cartão/financiamento)
CREATE TABLE public.cf_installments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    total_installments INTEGER NOT NULL,
    remaining_installments INTEGER NOT NULL,
    total_amount NUMERIC NOT NULL,
    committed_amount NUMERIC NOT NULL,
    installment_value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Assinaturas e Sistemas
CREATE TABLE public.cf_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    renewal_date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('mensal', 'trimestral', 'semestral', 'anual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Gastos Diários (Rápidos)
CREATE TABLE public.cf_daily_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.cf_categories(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Metas Financeiras
CREATE TABLE public.cf_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('quitar_cartao', 'quitar_financiamento', 'comprar_veiculo', 'comprar_imovel', 'reserva')),
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================================
-- APLICAÇÃO DE RLS (ROW LEVEL SECURITY)
-- Isso garante que cada usuário só veja seus próprios dados
-- =========================================================================================

ALTER TABLE public.cf_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_financings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_daily_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_goals ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Users can manage their own categories" ON public.cf_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own bills" ON public.cf_bills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own credit cards" ON public.cf_credit_cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own card transactions" ON public.cf_card_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own financings" ON public.cf_financings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own installments" ON public.cf_installments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own subscriptions" ON public.cf_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own daily expenses" ON public.cf_daily_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own goals" ON public.cf_goals FOR ALL USING (auth.uid() = user_id);
