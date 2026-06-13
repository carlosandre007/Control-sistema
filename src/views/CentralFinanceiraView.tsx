import React, { useState } from 'react';
import { LayoutDashboard, Wallet, TrendingDown, CalendarClock, Plus, Download, HelpCircle, LogOut } from 'lucide-react';
import * as XLSX from 'xlsx';

// Modals Principais
const LançamentoModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Novo Lançamento</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Wallet size={20} /></div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Receita</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><TrendingDown size={20} /></div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Despesa Diária</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">credit_card</span></div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Cartão</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><CalendarClock size={20} /></div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm text-center">Fixo/Assinatura</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-Telas
const Dashboard = () => (
    <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Visão Geral do Mês</h2>
        
        {/* Cards de Saldo e Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <p className="text-sm font-semibold text-slate-500 mb-1">Saldo Geral</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">R$ 25.600,00</p>
                <p className="text-xs text-slate-400 mt-1">Soma de todas as contas</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border-b-4 border-green-500 shadow-sm flex flex-col justify-between">
                <p className="text-sm font-semibold text-slate-500 mb-1">Receitas do Mês</p>
                <p className="text-2xl font-black text-green-600">R$ 18.200,00</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border-b-4 border-red-500 shadow-sm flex flex-col justify-between">
                <p className="text-sm font-semibold text-slate-500 mb-1">Despesas do Mês</p>
                <p className="text-2xl font-black text-red-500">R$ 5.750,00</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <p className="text-sm font-semibold text-slate-500 mb-1">Resultado do Mês</p>
                <p className="text-2xl font-black text-blue-600">R$ 12.450,00</p>
            </div>
        </div>

        {/* 2ª Linha de Cards (Limites e Dívidas) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500">Total de Dívidas</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">R$ 45.230,00</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500">Limites Disponíveis</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">R$ 18.000,00</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500">Valor Comprometido</p>
                <p className="text-lg font-bold text-orange-500">35%</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500">Próximos Vencimentos</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">5 Contas</p>
            </div>
        </div>

        {/* Área Destacada: Débitos dos Próximos 5 Dias */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-orange-500 text-xl">event_upcoming</span>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Débitos dos Próximos 5 Dias</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">Contas fixas, parcelas de financiamentos e faturas vencendo em breve.</p>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                            <th className="pb-3 font-semibold">Vencimento</th>
                            <th className="pb-3 font-semibold">Descrição</th>
                            <th className="pb-3 font-semibold text-right">Valor</th>
                            <th className="pb-3 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-orange-50/30 dark:bg-orange-900/10">
                            <td className="py-4 font-bold text-slate-800 dark:text-white text-sm">Amanhã</td>
                            <td className="py-4">
                                <p className="font-semibold text-sm text-slate-800 dark:text-white">Fatura Cartão Nubank</p>
                                <p className="text-xs text-slate-500">Cartões</p>
                            </td>
                            <td className="py-4 text-right font-bold text-slate-800 dark:text-white text-sm">R$ 1.250,00</td>
                            <td className="py-4 text-right">
                                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-md">Vencendo</span>
                            </td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                            <td className="py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">15/06</td>
                            <td className="py-4">
                                <p className="font-semibold text-sm text-slate-800 dark:text-white">Parcela 12/48 - Veículo</p>
                                <p className="text-xs text-slate-500">Financiamento</p>
                            </td>
                            <td className="py-4 text-right font-bold text-slate-800 dark:text-white text-sm">R$ 1.800,00</td>
                            <td className="py-4 text-right">
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-md">Pendente</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const Receitas = () => (
    <div className="p-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Receitas</h2>
        <p className="text-slate-500">Listagem de receitas (Locadora, Rastreamento, Vendas)...</p>
    </div>
);

const Despesas = () => {
    const handleDownloadModelo = () => {
        const ws = XLSX.utils.json_to_sheet([
            { Data: '10/06/2026', Descrição: 'Posto Ipiranga', Valor: '150,00', Categoria: 'Combustível' },
            { Data: '11/06/2026', Descrição: 'Supermercado Extra', Valor: '450,50', Categoria: 'Mercado' },
            { Data: '12/06/2026', Descrição: 'Netflix', Valor: '55,90', Categoria: 'Assinaturas' },
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Modelo");
        XLSX.writeFile(wb, "modelo_fatura.xlsx");
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Despesas</h2>
                <div className="flex gap-2">
                    <button onClick={handleDownloadModelo} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl transition-all">
                        <Download size={16} /> Baixar Modelo
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition-all shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-[18px]">upload_file</span> Importar Fatura
                    </button>
                </div>
            </div>
            <p className="text-slate-500">Listagem global de saídas (Conta Fixa, Gasto Diário, Assinatura, Parcela Manual)...</p>
        </div>
    );
};

const CartoesBancos = () => (
    <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Cartões e Bancos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">account_balance</span> Contas Bancárias</h3>
                <p className="text-sm text-slate-500">Gestão de saldo, cheque especial e limites empresariais.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-orange-500">credit_card</span> Cartões de Crédito</h3>
                <p className="text-sm text-slate-500">Controle de limites utilizados, próximas faturas e compras parceladas.</p>
            </div>
        </div>
    </div>
);

const Planejamento = () => (
    <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">Planejamento Estratégico</h2>
        <p className="text-slate-500 mb-8 text-sm">Visão inteligente de dívidas, financiamentos, investimentos e estratégias de quitação.</p>
        
        {/* Painel Central */}
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Esquerda: Cards e Estratégia */}
            <div className="flex-1 space-y-6">
                {/* 3 Cards Superiores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-slate-500">Total a Pagar (Ativo)</span>
                            <span className="material-symbols-outlined text-slate-400">account_balance_wallet</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">R$ 45.230,00</p>
                            <p className="text-xs text-slate-400 mt-1">Inclui financiamentos e parcelas</p>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border-l-4 border-red-500 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-slate-500">Total Vencido</span>
                            <span className="material-symbols-outlined text-red-500">warning</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-red-600">R$ 1.850,00</p>
                            <p className="text-xs text-slate-400 mt-1">Cartões e Parcelas atrasadas</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-slate-500">Comprometimento Futuro</span>
                            <span className="material-symbols-outlined text-slate-400">event_upcoming</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">R$ 3.200,00</p>
                            <p className="text-xs text-slate-400 mt-1">Média mensal próximos 6 meses</p>
                        </div>
                    </div>
                </div>

                {/* Bloco Preto de Economia */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-400 mb-1">Economia Possível</p>
                        <p className="text-4xl font-black tracking-tight text-white">R$ 4.500,00</p>
                        <p className="text-xs text-slate-400 mt-2">Aplicando Estratégia Inteligente de Quitação</p>
                    </div>
                    <span className="material-symbols-outlined text-8xl text-slate-800 absolute -right-4 top-2 opacity-50 z-0">savings</span>
                </div>

                {/* Estratégias */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Estratégias de Quitação</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">Selecione o melhor plano algorítmico para liquidar suas obrigações.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:border-primary transition">
                            <div className="flex justify-between items-start mb-2">
                                <span className="material-symbols-outlined text-slate-400">ac_unit</span>
                                <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                            </div>
                            <h4 className="font-bold text-sm mb-1 text-slate-800 dark:text-white">Bola de Neve</h4>
                            <p className="text-xs text-slate-500">Pague as menores dívidas primeiro. Rápida sensação de vitória.</p>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:border-primary transition">
                            <div className="flex justify-between items-start mb-2">
                                <span className="material-symbols-outlined text-slate-400">landscape</span>
                                <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                            </div>
                            <h4 className="font-bold text-sm mb-1 text-slate-800 dark:text-white">Avalanche</h4>
                            <p className="text-xs text-slate-500">Ataca os maiores juros primeiro. Matematicamente mais eficiente.</p>
                        </div>
                        <div className="border-2 border-slate-800 dark:border-slate-600 rounded-xl p-4 cursor-pointer relative bg-slate-50 dark:bg-slate-900/50">
                            <div className="absolute -top-3 -right-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md">RECOMENDADO</div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="material-symbols-outlined text-slate-800 dark:text-white">psychology</span>
                                <div className="w-4 h-4 rounded-full border-4 border-slate-800 dark:border-white"></div>
                            </div>
                            <h4 className="font-bold text-sm mb-1 text-slate-800 dark:text-white">Inteligente</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Equilibra juros altos e fluxo de caixa. Otimização híbrida.</p>
                        </div>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900/80 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-semibold text-slate-500">Projeção da Estratégia Inteligente</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                Quitação em: <span className="text-primary">Nov 2026</span> | Juros Salvos: <span className="text-green-600">R$ 4.500,00</span>
                            </p>
                        </div>
                        <button className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-lg text-sm font-bold transition">
                            Aplicar Plano
                        </button>
                    </div>
                </div>

                {/* Tabela de Ordem */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Ordem de Pagamento Recomendada</h3>
                        <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                                    <th className="pb-3 font-semibold">Ordem</th>
                                    <th className="pb-3 font-semibold">Obrigação</th>
                                    <th className="pb-3 font-semibold">Juros (a.m)</th>
                                    <th className="pb-3 font-semibold text-right">Saldo Devedor</th>
                                    <th className="pb-3 font-semibold text-right">Ação Mês Atual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100 dark:border-slate-700 bg-red-50/50 dark:bg-red-900/10">
                                    <td className="py-4"><div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">1</div></td>
                                    <td className="py-4">
                                        <p className="font-semibold text-sm text-slate-800 dark:text-white">Cartão de Crédito Visa</p>
                                    </td>
                                    <td className="py-4 text-red-600 font-semibold text-sm">12.5%</td>
                                    <td className="py-4 text-right font-bold text-slate-800 dark:text-white text-sm">R$ 1.850,00</td>
                                    <td className="py-4 text-right">
                                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md">Liquidar Total</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="py-4"><div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">2</div></td>
                                    <td className="py-4">
                                        <p className="font-semibold text-sm text-slate-800 dark:text-white">Empréstimo Pessoal Itaú</p>
                                    </td>
                                    <td className="py-4 text-slate-500 font-semibold text-sm">4.2%</td>
                                    <td className="py-4 text-right font-bold text-slate-800 dark:text-white text-sm">R$ 8.380,00</td>
                                    <td className="py-4 text-right">
                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-md">Pagar Mínimo (R$ 450)</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Direita: Metas e Investimentos */}
            <div className="w-full lg:w-80 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Investimentos</h3>
                        <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-200 transition">
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-xs text-slate-500 mb-1">Tesouro Direto</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">R$ 15.000,00</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Metas Financeiras</h3>
                        <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-200 transition">
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-sm">flight_takeoff</span>
                                    <span className="font-semibold text-sm text-slate-800 dark:text-white">Viagem Europa</span>
                                </div>
                                <span className="font-bold text-green-600 text-sm">53%</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">R$ 8.000 de R$ 15.000</p>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '53%' }}></div>
                            </div>
                            <p className="text-[10px] text-right text-slate-400 mt-1">Previsto: Dez/2024</p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">health_and_safety</span>
                                    <span className="font-semibold text-sm text-slate-800 dark:text-white">Reserva de Emergência</span>
                                </div>
                                <span className="font-bold text-primary text-sm">60%</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">R$ 12.000 de R$ 20.000</p>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                            <p className="text-[10px] text-right text-slate-400 mt-1">Previsto: Jul/2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- Componente Principal ---
type TabName = 'dashboard' | 'receitas' | 'despesas' | 'cartoes_bancos' | 'planejamento';

const CentralFinanceiraView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
            {/* Menu Lateral da Central Financeira (Independente) */}
            <aside className="w-[240px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex shrink-0">
                <div className="p-6">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Central Financeira</h1>
                    <div className="flex items-center gap-3 mt-4 mb-6">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-sm text-slate-600">person</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">Gestão Admin</p>
                            <p className="text-[10px] text-slate-500 truncate">Premium Account</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-black text-white rounded-xl py-3 px-4 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mb-8"
                    >
                        <Plus size={18} /> Novo Lançamento
                    </button>

                    <nav className="space-y-1">
                        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <LayoutDashboard size={18} /> Dashboard
                        </button>
                        <button onClick={() => setActiveTab('receitas')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'receitas' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <TrendingDown size={18} className="rotate-180 text-green-500" /> Receitas
                        </button>
                        <button onClick={() => setActiveTab('despesas')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'despesas' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <TrendingDown size={18} className="text-red-500" /> Despesas
                        </button>
                        <button onClick={() => setActiveTab('cartoes_bancos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'cartoes_bancos' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <span className="material-symbols-outlined text-[18px]">credit_card</span> Cartões e Bancos
                        </button>
                        <button onClick={() => setActiveTab('planejamento')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'planejamento' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <span className="material-symbols-outlined text-[18px]">psychology</span> Planejamento
                        </button>
                    </nav>
                </div>
                
                <div className="mt-auto p-6 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <HelpCircle size={18} /> Suporte
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 overflow-y-auto scrollbar-hide relative bg-slate-50 dark:bg-slate-900/50">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'receitas' && <Receitas />}
                {activeTab === 'despesas' && <Despesas />}
                {activeTab === 'cartoes_bancos' && <CartoesBancos />}
                {activeTab === 'planejamento' && <Planejamento />}
                
                {/* Botão Flutuante Mobile */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-95 transition"
                >
                    <Plus size={24} />
                </button>
            </main>

            <LançamentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default CentralFinanceiraView;
