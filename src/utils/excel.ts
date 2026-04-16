import * as XLSX from 'xlsx';
import { Debt, DebtStatus } from '../../types';

const mapStatusToPT = (status: DebtStatus): string => {
  switch (status) {
    case DebtStatus.PENDING: return 'Pendente';
    case DebtStatus.PAID: return 'Pago';
    case DebtStatus.OVERDUE: return 'Atrasado';
    case DebtStatus.UP_TO_DATE: return 'Em Dia';
    case DebtStatus.SPC: return 'No SPC';
    default: return status;
  }
};

export const exportDebtsToExcel = (debts: Debt[]) => {
  const data = debts.map(debt => {
    let parsedDueDate: any = debt.dueDate;
    if (debt.dueDate && typeof debt.dueDate === 'string' && debt.dueDate.includes('-')) {
      const parts = debt.dueDate.split('T')[0].split('-');
      if (parts.length === 3) {
        // Usa hora 12 local para evitar que o fuso horário mude o dia
        parsedDueDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      }
    }

    let parsedRegDate: any = debt.registrationDate;
    if (debt.registrationDate && typeof debt.registrationDate === 'string' && debt.registrationDate.includes('-')) {
      const parts = debt.registrationDate.split('T')[0].split('-');
      if (parts.length === 3) {
        parsedRegDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      }
    }

    return {
      'ID': debt.id,
      'Código do Cliente': debt.customerCode,
      'Nome do Cliente': debt.customerName,
      'CPF/CNPJ': debt.customerDocument || '',
      'WhatsApp': debt.whatsapp || '',
      'Valor Principal (R$)': Number(debt.amount) || 0,
      'Valor Original (R$)': Number(debt.originalAmount) || 0,
      'Data de Vencimento': parsedDueDate,
      'Data de Registro': parsedRegDate,
      'Status': mapStatusToPT(debt.status),
      'Categoria': debt.category || '',
      'Descrição': debt.description || '',
      'Recorrente': debt.isRecurring ? 'Sim' : 'Não'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Débitos Vigentes');

  // Add some formatting/column widths
  const wscols = [
    { wch: 36 }, // ID
    { wch: 15 }, // Código
    { wch: 30 }, // Nome
    { wch: 20 }, // CPF/CNPJ
    { wch: 20 }, // WhatsApp
    { wch: 15 }, // Valor Principal
    { wch: 15 }, // Valor Original
    { wch: 15 }, // Vencimento
    { wch: 15 }, // Registro
    { wch: 15 }, // Status
    { wch: 20 }, // Categoria
    { wch: 40 }, // Descrição
    { wch: 10 }  // Recorrente
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `debitos_vigentes_${new Date().toISOString().split('T')[0]}.xlsx`, { cellDates: true });
};

export interface ImportPreviewRow {
  index: number;
  id: string;
  newName: string;
  newAmount: number;
  newDueDate: string;
  newWhatsapp: string;
  oldData?: {
    customerName: string;
    amount: number;
    dueDate: string;
    whatsapp: string;
  };
  hasChanges: boolean;
  errors: string[];
}

// Function to convert possible Brazilian date DD/MM/YYYY or excel float date to YYYY-MM-DD
const parseExcelDate = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel date (number of days since 1900)
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    const tzOffset = d.getTimezoneOffset() * 60000;
    const finalDate = new Date(d.getTime() + tzOffset);
    const yyyy = finalDate.getFullYear();
    const mm = String(finalDate.getMonth() + 1).padStart(2, '0');
    const dd = String(finalDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof val === 'string') {
    // e.g. 15/04/2026
    const parts = val.split('/');
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      if (dd.length <= 2 && mm.length <= 2 && yyyy.length === 4) {
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
    }
    // If it's already YYYY-MM-DD, try to make sure it's valid, otherwise keep as is
    if (val.includes('T')) return val.split('T')[0];
    return val;
  }
  if (val instanceof Date) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const dd = String(val.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return String(val);
};

export const parseExcelForImport = async (file: File, currentDebts: Debt[]): Promise<ImportPreviewRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const previewData: ImportPreviewRow[] = json.map((row, idx) => {
          const errors: string[] = [];
          
          const id = row['ID'] || row['id'];
          if (!id) errors.push('ID ausente.');

          const existingDebt = currentDebts.find(d => d.id === id);
          if (id && !existingDebt) errors.push('Débito não encontrado no sistema.');
          
          const newName = String(row['Nome do Cliente'] || row['customerName'] || '').trim();
          const newWhatsapp = String(row['WhatsApp'] || row['whatsapp'] || '').trim();
          const rawAmount = row['Valor Principal (R$)'] || row['amount'];
          const newAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[R$\s]/g, '').replace(',', '.'));
          
          const rawDueDate = row['Data de Vencimento'] || row['dueDate'];
          const newDueDate = parseExcelDate(rawDueDate);

          if (!newName) errors.push('Nome do cliente não pode estar vazio');
          if (isNaN(newAmount) || newAmount < 0) errors.push('Valor principal inválido');
          if (!newDueDate || isNaN(new Date(newDueDate).getTime())) errors.push('Data de vencimento inválida');

          let hasChanges = false;
          let oldData;

          if (existingDebt) {
            oldData = {
              customerName: existingDebt.customerName,
              amount: existingDebt.amount,
              dueDate: existingDebt.dueDate,
              whatsapp: existingDebt.whatsapp || ''
            };

            if (newName !== oldData.customerName ||
                newAmount !== oldData.amount ||
                newDueDate !== oldData.dueDate ||
                newWhatsapp !== oldData.whatsapp) {
              hasChanges = true;
            }
          }

          return {
            index: idx + 2, // Excel row index (starts at 1, +1 for header)
            id: id || '',
            newName,
            newAmount,
            newDueDate,
            newWhatsapp,
            oldData,
            hasChanges,
            errors
          };
        });

        resolve(previewData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
