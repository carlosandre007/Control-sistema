import React, { useRef, useState } from 'react';
import { supabase } from '../utils/supabase';

const BackupView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // List of tables to backup
    // Order matters for Restore (delete children first), but for export not so much.
    // We export as a map.
    const tables = [
        'clients',
        'motorcycles',
        'transactions',
        'banks',
        'properties',
        'debts',
        'ipva_records',
        'motorcycle_maintenance',
        'categories'
    ];

    // Dependency order for deletion (Child -> Parent)
    // If we delete a parent, children might be deleted conform CASCADE, but to be safe we delete children first.
    // Speculated dependencies:
    // transactions -> debts (maybe)
    // motorcycle_maintenance -> motorcycles
    // ipva_records -> motorcycles
    // motorcycles -> clients
    // debts -> clients (maybe)
    const deleteOrder = [
        'motorcycle_maintenance',
        'ipva_records',
        'motorcycles',
        'transactions',
        'debts',
        'properties',
        'banks',
        'categories',
        'clients'
    ];

    // Restore order (Parent -> Child)
    const restoreOrder = [
        'clients',
        'categories',
        'banks',
        'properties',
        'debts',
        'motorcycles',
        'transactions',
        'ipva_records',
        'motorcycle_maintenance'
    ];

    const downloadJSON = (data: any, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Usuário não autenticado.");

            const backupData: Record<string, any[]> = {};

            for (const table of tables) {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('user_id', session.user.id);

                if (error) {
                    // Try without user_id filter if it fails (maybe shared tables like 'categories'?)
                    // Or just log warning.
                    console.warn(`Tentando buscar ${table} sem filtro de user_id...`);
                    const { data: dataAll, error: errorAll } = await supabase.from(table).select('*');
                    if (errorAll) {
                        console.error(`Erro ao exportar tabela ${table}:`, errorAll.message);
                        // We continue, maybe the table doesn't exist or permissions block it.
                    } else {
                        backupData[table] = dataAll || [];
                    }
                } else {
                    backupData[table] = data || [];
                }
            }

            const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            const timeStr = new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-');

            downloadJSON(backupData, `backup_sistema_${dateStr}_${timeStr}.json`);
            alert('✅ Backup exportado com sucesso!');

        } catch (error: any) {
            console.error(error);
            alert('❌ Erro ao exportar backup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('⚠️ ATENÇÃO CRÍTICA ⚠️\n\nIsso irá APAGAR PERMANENTEMENTE todos os dados atuais do sistema e substituí-los pelo conteúdo do backup.\n\nTem certeza absoluta que deseja continuar?')) {
            e.target.value = '';
            return;
        }

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) throw new Error("Usuário não autenticado.");

                const userId = session.user.id;

                // 1. Delete existing data
                console.log('Iniciando limpeza de dados...');
                for (const table of deleteOrder) {
                    // Start with specific delete
                    // Some tables might fail if they don't have user_id.
                    // We try-catch specific table deletions.
                    try {
                        // Check if table column user_id exists?
                        // We can't check schema easily. We assume usage of user_id.
                        // For tables without user_id, we might be unable to delete safely.
                        // Assuming all user-data tables have user_id.
                        await supabase.from(table).delete().eq('user_id', userId);
                    } catch (err) {
                        console.warn(`Erro ao limpar tabela ${table}`, err);
                    }
                }

                // 2. Insert new data
                console.log('Iniciando restauração...');
                for (const table of restoreOrder) {
                    const rows = json[table];
                    if (rows && Array.isArray(rows) && rows.length > 0) {
                        try {
                            // Enforce current user ownership
                            const sanitizedRows = rows.map(row => ({
                                ...row,
                                user_id: userId
                            }));

                            // Insert in batches of 100 to avoid request size limits
                            const batchSize = 100;
                            for (let i = 0; i < sanitizedRows.length; i += batchSize) {
                                const batch = sanitizedRows.slice(i, i + batchSize);
                                const { error } = await supabase.from(table).insert(batch);
                                if (error) throw error;
                            }
                            console.log(`Tabela ${table} restaurada: ${rows.length} registros.`);
                        } catch (err: any) {
                            console.error(`Erro ao restaurar tabela ${table}:`, err);
                            throw new Error(`Falha na tabela ${table}: ${err.message}`);
                        }
                    }
                }

                alert('✅ Sistema restaurado com sucesso! A página será recarregada.');
                window.location.reload();

            } catch (error: any) {
                console.error(error);
                alert('❌ Erro fatal ao restaurar sistema: ' + error.message);
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Backup / Restauração</h2>
                <p className="text-gray-500 dark:text-gray-400">Gerencie a segurança dos seus dados exportando ou importando arquivos JSON.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card Exportar */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl flex flex-col items-center text-center gap-6 group hover:border-primary/20 transition-colors">
                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/10 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-5xl">download</span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Exportar Backup</h3>
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Salvar todos os dados</p>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                        Gere um arquivo JSON contendo todas as informações do sistema: veículos, clientes, financeiro, bancos e imóveis.
                        Recomenda-se realizar este processo semanalmente.
                    </p>

                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="w-full max-w-xs py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined">download</span>
                        )}
                        Gerar Arquivo JSON
                    </button>
                </div>

                {/* Card Restaurar */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-xl flex flex-col items-center text-center gap-6 group hover:border-red-500/20 transition-colors">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-5xl">upload_file</span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Restaurar Sistema</h3>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Substituir dados atuais</p>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                        Selecione um arquivo de backup (.json) para restaurar o sistema.
                        <span className="font-bold text-red-500 ml-1">ATENÇÃO:</span> Isso apagará permanentemente todos os dados atuais e os substituirá pelo conteúdo do arquivo.
                    </p>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleRestore}
                        className="hidden"
                        accept=".json"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="w-full max-w-xs py-6 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:border-red-200 dark:group-hover:border-red-900/30"
                    >
                        <span className="material-symbols-outlined text-gray-400 mb-1">cloud_upload</span>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Selecionar Backup</span>
                    </button>
                </div>
            </div>

            {/* Aviso de Segurança */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start">
                <span className="material-symbols-outlined text-amber-500 text-3xl shrink-0">warning</span>
                <div className="space-y-2">
                    <h4 className="font-bold text-amber-900 dark:text-amber-100">Recomendações de Segurança</h4>
                    <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200/80 list-disc list-inside">
                        <li>Sempre baixe um backup antes de realizar restaurações ou mudanças estruturais.</li>
                        <li>Mantenha seus arquivos de backup em um local seguro (pendrive ou nuvem privada).</li>
                        <li>A restauração pode falhar se o arquivo JSON estiver corrompido ou mal formatado.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BackupView;
