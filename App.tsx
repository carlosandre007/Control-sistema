import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Debt, DebtStatus, DashboardStats } from './types';
import { INITIAL_DEBTS } from './constants';

// Layout Components
import Sidebar from './src/layout/Sidebar';
import Header from './src/layout/Header';

// View Components
import DashboardView from './src/views/DashboardView';
import AlertsView from './src/views/AlertsView';
import ClientsView from './src/views/ClientsView';
import DebtFormModal from './src/components/DebtFormModal';

// Utils
import { calculateInterest } from './src/utils/finance';
import { supabase } from './src/utils/supabase';
import AuthView from './src/views/AuthView';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'clients'>('dashboard');
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerCode, setSelectedCustomerCode] = useState<string | null>(null);

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
        customerName: d.customer_name,
        customerCode: d.customer_code,
        whatsapp: d.whatsapp,
        amount: Number(d.amount),
        dueDate: d.due_date,
        registrationDate: d.registration_date,
        interestRate: Number(d.interest_rate),
        interestAmount: Number(d.interest_amount),
        status: d.status as DebtStatus,
        isRecurring: d.is_recurring,
        avatarColor: d.avatar_color,
        paymentDate: d.payment_date
      })));
    }
    setLoading(false);
  }, [session]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    if (session) {
      fetchDebts();
    }
  }, [session, fetchDebts]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePay = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('debts')
      .update({ status: DebtStatus.PAID, payment_date: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      alert('Erro ao processar pagamento: ' + error.message);
    } else {
      fetchDebts();
    }
  }, [fetchDebts]);

  const handleDelete = useCallback(async (id: string) => {
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

  const handleExcelDemo = () => {
    const headers = ["Código do Cliente", "Nome", "Valor Total Devido", "Mês/Ano de Vencimento", "Juros a Pagar"];
    const rows = [
      ["#0001", "Exemplo Cliente", "1500.00", "12/2024", "35.50"],
      ["#0002", "Empresa ABC", "850.25", "11/2024", "12.00"]
    ];

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_planilha_cobranca.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExcelUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Processando arquivo: ${file.name}\nDados serão importados para a base de clientes conforme a ordem solicitada.`);
    }
  };

  // Stats Calculations
  const stats = useMemo<DashboardStats>(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const overdue = debts.filter(d => d.status === DebtStatus.OVERDUE);
    const paidThisMonth = debts.filter(d =>
      d.status === DebtStatus.PAID &&
      d.paymentDate &&
      new Date(d.paymentDate).getMonth() === currentMonth &&
      new Date(d.paymentDate).getFullYear() === currentYear
    );
    const toReceiveCurrent = debts.filter(d => {
      const dDate = new Date(d.dueDate);
      return d.status === DebtStatus.PENDING && dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
    });

    return {
      totalOverdue: overdue.reduce((acc, curr) => acc + curr.amount + calculateInterest(curr), 0),
      overdueCount: overdue.length,
      receivedThisMonth: paidThisMonth.reduce((acc, curr) => acc + curr.amount, 0),
      toReceive: toReceiveCurrent.reduce((acc, curr) => acc + curr.amount, 0),
      averageDelayDays: 12
    };
  }, [debts]);

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
        />

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView stats={stats} />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              groupedDebts={groupedDebts}
              selectedCustomerCode={selectedCustomerCode}
              setSelectedCustomerCode={setSelectedCustomerCode}
              handlePay={handlePay}
              handleDelete={handleDelete}
              onEdit={handleEdit}
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
            />
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
    </div>
  );
};

export default App;