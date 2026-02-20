import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Debt, DebtStatus, DashboardStats, Transaction } from './types';
import { INITIAL_DEBTS } from './constants';

// Layout Components
import Sidebar from './src/layout/Sidebar';
import Header from './src/layout/Header';

// View Components
import DashboardView from './src/views/DashboardView';
import AlertsView from './src/views/AlertsView';
import ClientsView from './src/views/ClientsView';
import DebtFormModal from './src/components/DebtFormModal';
import WhatsAppMessageModal from './src/components/WhatsAppMessageModal';

// Utils
import { calculateInterest } from './src/utils/finance';
import { supabase } from './src/utils/supabase';
import { calculateDaysOverdue, isOverdue } from './src/utils/status';
import { formatDateToISO } from './src/utils/date';
import AuthView from './src/views/AuthView';
import TransactionsView from './src/views/TransactionsView';
import ActiveDebtsView from './src/views/ActiveDebtsView';
import SpcDebtsView from './src/views/SpcDebtsView';
import CustomerPanelView from './src/views/CustomerPanelView';
import BackupView from './src/views/BackupView';
import { Session } from '@supabase/supabase-js';
import { registerPayment } from './src/utils/finance';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'clients' | 'transactions' | 'active_debts' | 'spc_debts' | 'backup'>('dashboard');
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [annualTransactions, setAnnualTransactions] = useState<Transaction[]>([]); // For timeline chart
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);
  const [selectedCustomerCodeForPanel, setSelectedCustomerCodeForPanel] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerCode, setSelectedCustomerCode] = useState<string | null>(null);
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
  const [sortOption, setSortOption] = useState<'none' | 'days-vencido' | 'alphabetical'>('none');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [debtForWhatsApp, setDebtForWhatsApp] = useState<Debt | null>(null);

  const handleWhatsAppClick = (debt: Debt) => {
    setDebtForWhatsApp(debt);
    setShowWhatsAppModal(true);
  };

  // Reset overdue filter when changing tabs or selecting a customer
  React.useEffect(() => {
    if (activeTab !== 'alerts' || selectedCustomerCode) {
      setShowOnlyOverdue(false);
    }
    // Auto-set sorting to 'days-vencido' when entering alerts tab
    if (activeTab === 'alerts' && sortOption === 'none') {
      setSortOption('days-vencido');
    }
  }, [activeTab, selectedCustomerCode, sortOption]);

  // ======================
  // FETCH DEBTS
  // ======================
  const fetchDebts = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching debts:', error);
    } else {
      setDebts(data.map((d: any) => ({
        id: d.id,
        sequenceNumber: d.sequence_number,
        customerName: d.customer_name || 'Credor sem Nome',
        customerCode: d.customer_code || '',
        customerDocument: d.customer_document || '',
        whatsapp: d.whatsapp || '',
        amount: Number(d.amount || 0),
        originalAmount: Number(d.original_amount || d.amount || 0),
        dueDate: d.due_date || '',
        registrationDate: d.registration_date,
        interestRate: Number(d.interest_rate || 0.30),
        interestAmount: Number(d.interest_amount || 0),
        status: d.status as DebtStatus,
        isRecurring: d.is_recurring,
        avatarColor: d.avatar_color || 'bg-slate-100',
        paymentDate: d.payment_date,
        category: d.category || 'Geral',
        description: d.description || ''
      })));
    }
    setLoading(false);
  }, [session]);

  // ======================
  // AUTH SESSION
  // ======================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Auto sign-out unauthorized users
      if (session?.user?.email && session.user.email.toLowerCase() !== 'aandreandre2@hotmail.com') {
        supabase.auth.signOut();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ======================
  // STATS CALCULATION
  // ======================
  const stats = useMemo((): DashboardStats => {
    const monthPrefix = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`;

    const monthDebts = debts.filter(d => d.dueDate && d.dueDate.startsWith(monthPrefix));
    const activeMonthDebts = monthDebts.filter(d => d.status !== DebtStatus.PAID && d.status !== DebtStatus.SPC);

    const totalReceived = annualTransactions
      .filter(t => t.transactionDate && t.transactionDate.startsWith(monthPrefix))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const toReceive = activeMonthDebts.reduce((sum, d) => sum + d.amount, 0);

    // Rules for Overdue: status != PAID AND due_date < today
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueDebtsList = debts.filter(d =>
      d.status !== DebtStatus.PAID &&
      d.status !== DebtStatus.SPC &&
      d.dueDate && d.dueDate < todayStr
    );

    const totalOverdue = overdueDebtsList.reduce((sum, d) => sum + d.amount, 0);

    const totalDelayedDays = overdueDebtsList.reduce((sum, d) => sum + calculateDaysOverdue(d.dueDate), 0);
    const averageDelayDays = overdueDebtsList.length > 0 ? Math.round(totalDelayedDays / overdueDebtsList.length) : 0;

    const totalPortfolio = debts.reduce((sum, d) => sum + d.amount, 0);
    const totalClients = new Set(debts.map(d => d.customerCode)).size;

    const interestReceived = annualTransactions
      .filter(t => t.transactionDate && t.transactionDate.startsWith(monthPrefix) && t.type === 'interest_payment')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const collectionEfficiency = (totalReceived + toReceive) > 0
      ? (totalReceived / (totalReceived + toReceive)) * 100
      : 0;

    return {
      totalOverdue,
      overdueCount: overdueDebtsList.length,
      receivedThisMonth: totalReceived,
      toReceive,
      averageDelayDays,
      totalPortfolio,
      totalClients,
      collectionEfficiency,
      activeCount: debts.filter(d => d.status !== DebtStatus.PAID && d.status !== DebtStatus.SPC).length,
      interestReceived // Pass this new field
    };
  }, [debts, annualTransactions, selectedMonth, selectedYear]);

  // ======================
  // FETCH ANNUAL STATS
  // ======================
  const fetchAnnualStats = useCallback(async () => {
    if (!session?.user) return;

    const startOfYear = `${selectedYear}-01-01`;
    const endOfYear = `${selectedYear}-12-31`;

    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, type, transaction_date, customer_name, category')
      .eq('user_id', session.user.id)
      .gte('transaction_date', startOfYear)
      .lte('transaction_date', endOfYear)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching annual stats:', error);
      return;
    }

    const transactions = (data || []).map(t => ({
      id: t.id,
      amount: Number(t.amount || 0),
      type: t.type,
      transactionDate: t.transaction_date || '',
      customerName: t.customer_name || 'Desconhecido',
      category: t.category || 'Geral'
    }));

    setAnnualTransactions(transactions);
  }, [session, selectedYear]);

  // ======================
  // EFFECT PRINCIPAL
  // ======================
  useEffect(() => {
    if (session) {
      fetchDebts();
      fetchAnnualStats();
    }
  }, [session, fetchDebts, fetchAnnualStats]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePay = useCallback(async (id: string) => {
    if (!session?.user || isSaving) return;
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    setIsSaving(true);

    const interest = calculateInterest(debt);
    const totalAmount = debt.amount + interest;

    const paidAmountStr = prompt(
      `REGISTRO DE RECEBIMENTO TOTAL\n\n` +
      `Dívida: ${debt.customerName}\n` +
      `Valor Principal: R$ ${debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Juros Registrados: R$ ${interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Total Esperado: R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
      `CONFIRME O VALOR REAL RECEBIDO:`,
      totalAmount.toFixed(2).replace('.', ',')
    );

    if (!paidAmountStr) return;

    const paidAmount = parseFloat(paidAmountStr.replace(',', '.'));

    if (isNaN(paidAmount) || paidAmount <= 0) {
      alert('Valor inválido!');
      return;
    }

    try {
      // Always register as TOTAL payment when Total button is clicked
      await registerPayment(debt, 'total', paidAmount, session.user.id);
      alert(`Pagamento TOTAL de R$ ${paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado com sucesso!`);
      fetchDebts();
      fetchAnnualStats();
    } catch (error: any) {
      alert('Erro ao processar pagamento: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  }, [fetchDebts, fetchAnnualStats, debts, session, isSaving]);

  const handleDelete = useCallback(async (id: string) => {
    const password = prompt('Digite a senha para confirmar a exclusão:');
    if (password !== '4859') {
      alert('Senha incorreta! Operação cancelada.');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta dívida?')) return;

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchDebts();
      if (debts.find(d => d.id === id)?.customerCode === selectedCustomerCode) {
        const remainingForCustomer = debts.filter(d => d.customerCode === selectedCustomerCode && d.id !== id);
        if (remainingForCustomer.length === 0) setSelectedCustomerCode(null);
      }
    }
  }, [fetchDebts, debts, selectedCustomerCode]);

  const handleSpc = useCallback(async (id: string) => {
    if (!session?.user) return;
    if (!confirm('Deseja mover este débito para SPC Sumidos?')) return;

    const { error } = await supabase
      .from('debts')
      .update({ status: DebtStatus.SPC })
      .eq('id', id);

    if (error) {
      alert('Erro ao mover para SPC: ' + error.message);
    } else {
      fetchDebts();
    }
  }, [session, fetchDebts]);

  const handleRemoveSpc = useCallback(async (id: string) => {
    if (!session?.user) return;
    if (!confirm('Deseja remover este débito do SPC e restaurar para Débitos Vigentes?')) return;

    const { error } = await supabase
      .from('debts')
      .update({ status: DebtStatus.PENDING })
      .eq('id', id);

    if (error) {
      alert('Erro ao remover do SPC: ' + error.message);
    } else {
      fetchDebts();
    }
  }, [session, fetchDebts]);

  const handlePayInterest = useCallback(async (id: string) => {
    if (!session?.user || isSaving) return;
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const interest = calculateInterest(debt);
    if (interest <= 0) {
      alert('Esta dívida não possui juros a pagar.');
      return;
    }

    const paidAmountStr = prompt(
      `REGISTRO DE RECEBIMENTO DE JUROS\n\n` +
      `Dívida: ${debt.customerName}\n` +
      `Valor Principal: R$ ${debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Juros Registrados: R$ ${interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
      `CONFIRME O VALOR REAL RECEBIDO (Juros):`,
      interest.toFixed(2).replace('.', ',')
    );

    if (!paidAmountStr) return;

    const paidAmount = parseFloat(paidAmountStr.replace(',', '.'));

    if (isNaN(paidAmount) || paidAmount <= 0) {
      alert('Valor inválido!');
      return;
    }

    setIsSaving(true);
    try {
      await registerPayment(debt, 'interest', paidAmount, session.user.id);
      alert(`Juros de R$ ${paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrados com sucesso!`);
      fetchDebts();
      fetchAnnualStats();
    } catch (error: any) {
      console.error('Erro ao processar pagamento de juros:', error);
      alert('Erro ao processar pagamento de juros: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  }, [debts, session, fetchDebts, isSaving]);

  const handleDeleteClient = useCallback(async (customerCode: string) => {
    const password = prompt('Digite a senha para confirmar a exclusão do CLIENTE e todas as suas dívidas:');
    if (password !== '4859') {
      alert('Senha incorreta! Operação cancelada.');
      return;
    }

    const clientDebts = debts.filter(d => d.customerCode === customerCode);
    const clientName = clientDebts[0]?.customerName || 'este cliente';
    const debtCount = clientDebts.length;

    if (!confirm(
      `Tem certeza que deseja excluir ${clientName}?\n\n` +
      `Isso irá remover ${debtCount} dívida(s) associada(s) a este cliente.\n\n` +
      `Esta ação não pode ser desfeita!`
    )) {
      return;
    }

    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('customer_code', customerCode)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      alert(`Cliente ${clientName} e suas ${debtCount} dívida(s) foram excluídos com sucesso!`);
      fetchDebts();

      // Limpar seleção se estava visualizando este cliente
      if (selectedCustomerCode === customerCode) {
        setSelectedCustomerCode(null);
      }
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente: ' + error.message);
    }
  }, [debts, session, fetchDebts, selectedCustomerCode]);

  const handleEditClient = useCallback((customerCode: string) => {
    const clientDebts = debts.filter(d => d.customerCode === customerCode);
    if (clientDebts.length > 0) {
      // Open the form with the first debt to allow editing client info
      setEditingDebt(clientDebts[0]);
      setShowForm(true);
    }
  }, [debts]);

  const handleViewOverdue = useCallback(() => {
    setShowOnlyOverdue(true);
    setActiveTab('alerts');
    setSelectedCustomerCode(null);
  }, []);

  const handleBackupExport = useCallback(() => {
    if (debts.length === 0) {
      alert('Não há cobranças para exportar!');
      return;
    }

    // Prepare data for export
    const exportData = debts.map(debt => ({
      'Número Sequencial': debt.sequenceNumber || '',
      'Código Cliente': debt.customerCode,
      'Nome Cliente': debt.customerName,
      'WhatsApp': debt.whatsapp || '',
      'Valor Principal': debt.amount,
      'Juros': calculateInterest(debt),
      'Data Registro': debt.registrationDate,
      'Data Vencimento': debt.dueDate,
      'Status': debt.status === DebtStatus.PAID ? 'Pago' :
        (() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(debt.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate <= today ? 'Atrasado' : 'Em Dia';
        })(),
      'Data Pagamento': debt.paymentDate || '',
      'Recorrente': debt.isRecurring ? 'Sim' : 'Não'
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + headers.join(",") + "\n"
      + exportData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(",")
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `backup_cobrancas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ Backup exportado com sucesso!\n\nTotal de ${debts.length} cobrança(s) exportada(s).`);
  }, [debts]);

  const handleExcelDemo = () => {
    const headers = ["Nome do Cliente", "WhatsApp"];
    const rows = [
      ["João Silva", "(11) 98765-4321"],
      ["Maria Santos", "(21) 99876-5432"],
      ["Carlos Oliveira", "(31) 97654-3210"]
    ];

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_clientes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExcelUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          alert('Arquivo vazio ou inválido!');
          return;
        }

        // Skip header
        const dataLines = lines.slice(1);
        let successCount = 0;
        let errorCount = 0;

        for (const line of dataLines) {
          const [name, whatsapp] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));

          if (!name) {
            errorCount++;
            continue;
          }

          // Check if client already exists
          const { data: existing } = await supabase
            .from('debts')
            .select('customer_code')
            .eq('user_id', session?.user?.id)
            .ilike('customer_name', name)
            .limit(1);

          if (existing && existing.length > 0) {
            console.log(`Cliente ${name} já existe, pulando...`);
            continue;
          }

          // Generate new customer code
          const { data: allCodes } = await supabase
            .from('debts')
            .select('customer_code')
            .eq('user_id', session?.user?.id);

          const uniqueCodes = Array.from(new Set((allCodes || []).map(d => {
            const match = d.customer_code.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          })));
          const maxCode = uniqueCodes.length > 0 ? Math.max(...uniqueCodes) : 0;
          const newCode = `#${(maxCode + successCount + 1).toString().padStart(4, '0')}`;

          // Random avatar color
          const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-purple-500', 'bg-pink-500'];
          const avatarColor = colors[Math.floor(Math.random() * colors.length)];

          // Create a placeholder debt for this client
          const { error } = await supabase
            .from('debts')
            .insert([{
              customer_name: name,
              customer_code: newCode,
              whatsapp: whatsapp || null,
              amount: 0,
              registration_date: new Date().toISOString().split('T')[0],
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: DebtStatus.PAID,
              interest_amount: 0,
              avatar_color: avatarColor,
              is_recurring: false,
              user_id: session?.user?.id
            }]);

          if (error) {
            console.error(`Erro ao importar ${name}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        }

        alert(
          `Importação concluída!\n\n` +
          `✅ ${successCount} cliente(s) importado(s)\n` +
          `❌ ${errorCount} erro(s)`
        );

        fetchDebts();
        fetchAnnualStats();
      } catch (error: any) {
        console.error('Erro ao processar arquivo:', error);
        alert('Erro ao processar arquivo: ' + error.message);
      }
    };

    reader.readAsText(file);
  };


  const filteredDebts = debts.filter(d =>
    d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customerCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedDebts = useMemo(() => {
    const groups: Record<string, Debt[]> = {};
    filteredDebts.forEach(debt => {
      if (!groups[debt.customerCode]) groups[debt.customerCode] = [];
      groups[debt.customerCode].push(debt);
    });
    return groups;
  }, [filteredDebts]);

  // Apply sorting to grouped debts
  const sortedGroupedDebts = useMemo(() => {
    const entries = Object.entries(groupedDebts) as [string, Debt[]][];

    if (sortOption === 'days-vencido') {
      // Sort by most days vencido (descending)
      return entries.sort(([, debtsA], [, debtsB]) => {
        const getMaxDaysVencido = (debts: Debt[]) => {
          const unpaidDebts = debts.filter(d => d.status !== DebtStatus.PAID);
          if (unpaidDebts.length === 0) return -Infinity;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const daysOverdueList = unpaidDebts.map(d => calculateDaysOverdue(d.dueDate));

          return Math.max(...daysOverdueList);
        };

        const maxDelayA = getMaxDaysVencido(debtsA);
        const maxDelayB = getMaxDaysVencido(debtsB);

        if (maxDelayA !== maxDelayB) {
          return maxDelayB - maxDelayA;
        }

        // Tie-breaker: total overdue amount
        const amountA = (debtsA as Debt[]).filter(d => d.status !== DebtStatus.PAID).reduce((acc, d) => acc + d.amount, 0);
        const amountB = (debtsB as Debt[]).filter(d => d.status !== DebtStatus.PAID).reduce((acc, d) => acc + d.amount, 0);
        return amountB - amountA;
      }).reduce((acc, [code, debts]) => ({ ...acc, [code]: debts }), {});
    } else if (sortOption === 'alphabetical') {
      // Sort by customer name (A → Z)
      return entries.sort(([, debtsA], [, debtsB]) => {
        const nameA = debtsA[0]?.customerName.toLowerCase() || '';
        const nameB = debtsB[0]?.customerName.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      }).reduce((acc, [code, debts]) => ({ ...acc, [code]: debts }), {});
    }

    // Default: no sorting
    return groupedDebts;
  }, [groupedDebts, sortOption]);

  if (!session) {
    return <AuthView />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overdueCount={stats.overdueCount}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto relative scrollbar-hide">
        <Header
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onNewDebt={() => setShowForm(true)}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              overdueDebts={stats.overdueCount}
              averageDelayDays={stats.averageDelayDays}
              onViewOverdue={handleViewOverdue}
              annualTransactions={annualTransactions}
              debts={debts}
              selectedYear={selectedYear}
              onWhatsApp={handleWhatsAppClick}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'active_debts' && (
            <ActiveDebtsView
              debts={debts}
              onPay={handlePay}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPayInterest={handlePayInterest}
              onWhatsApp={handleWhatsAppClick}
              onSpc={handleSpc}
              selectedCustomerCode={selectedCustomerCode}
              setSelectedCustomerCode={setSelectedCustomerCode}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'spc_debts' && (
            <SpcDebtsView
              debts={debts}
              onPay={handlePay}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPayInterest={handlePayInterest}
              onWhatsApp={handleWhatsAppClick}
              onRemoveSpc={handleRemoveSpc}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              groupedDebts={sortedGroupedDebts}
              selectedCustomerCode={selectedCustomerCode}
              setSelectedCustomerCode={setSelectedCustomerCode}
              handlePay={handlePay}
              handleDelete={handleDelete}
              handlePayInterest={handlePayInterest}
              onEdit={handleEdit}
              showOnlyOverdue={showOnlyOverdue}
              sortOption={sortOption}
              setSortOption={setSortOption}
              onWhatsAppClick={handleWhatsAppClick}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onTransactionChange={() => {
                fetchDebts();
                fetchAnnualStats();
              }}
              userId={session.user.id}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              groupedDebts={groupedDebts}
              handleExcelUpload={handleExcelUpload}
              handleExcelDemo={handleExcelDemo}
              setActiveTab={setActiveTab}
              setSelectedCustomerCode={setSelectedCustomerCode}
              onNewDebt={() => { setEditingDebt(null); setShowForm(true); }}
              onDeleteClient={handleDeleteClient}
              onBackupExport={handleBackupExport}
              onEditClient={handleEditClient}
              onOpenPanel={(code) => {
                setSelectedCustomerCodeForPanel(code);
                setShowCustomerPanel(true);
              }}
            />
          )}

          {activeTab === 'backup' && (
            <BackupView />
          )}
        </div>
      </main>

      {showForm && session?.user && (
        <DebtFormModal
          userId={session.user.id}
          editingDebt={editingDebt}
          onClose={() => { setShowForm(false); setEditingDebt(null); }}
          onSuccess={fetchDebts}
        />
      )}

      {showWhatsAppModal && debtForWhatsApp && (
        <WhatsAppMessageModal
          debt={debtForWhatsApp}
          onClose={() => { setShowWhatsAppModal(false); setDebtForWhatsApp(null); }}
        />
      )}

      {showCustomerPanel && selectedCustomerCodeForPanel && (
        <CustomerPanelView
          customerCode={selectedCustomerCodeForPanel}
          debts={debts}
          transactions={annualTransactions}
          onClose={() => setShowCustomerPanel(false)}
          onPay={handlePay}
          onEdit={handleEdit}
          onPayInterest={handlePayInterest}
          onWhatsApp={handleWhatsAppClick}
        />
      )}
      <SpeedInsights />
    </div>
  );
};

export default App;