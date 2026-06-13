import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Debt, DebtStatus } from '../../types';
import { calculateInterest } from './finance';

export const exportDebtsToPDF = (debts: Debt[]) => {
    // Filter only active debts
    const activeDebts = debts.filter(d => d.status !== DebtStatus.PAID);

    if (activeDebts.length === 0) {
        alert('Não há dívidas ativas para exportar.');
        return;
    }

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('GRUPO 3A', 105, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório de Dívidas Ativas', 105, 23, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Gerado em: ${currentDate}`, 105, 30, { align: 'center' });

    // Prepare table data
    const tableData = activeDebts.map(debt => {
        const interest = calculateInterest(debt);

        return [
            debt.customerName,
            debt.customerCode,
            new Date(debt.dueDate).toLocaleDateString('pt-BR'),
            `R$ ${debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            `R$ ${interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ];
    });

    // Calculate totals
    const totalPrincipal = activeDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalInterest = activeDebts.reduce((sum, d) => sum + calculateInterest(d), 0);

    // Add table
    autoTable(doc, {
        startY: 40,
        head: [['Cliente', 'Código', 'Vencimento', 'Principal', 'Juros']],
        body: tableData,
        foot: [[
            { content: 'TOTAL GERAL', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: `R$ ${totalPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } },
            { content: `R$ ${totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }
        ]],
        theme: 'grid',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        footStyles: {
            fillColor: [236, 240, 241],
            textColor: 0,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 35, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' }
        }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Página ${i} de ${pageCount}`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    // Save the PDF
    const fileName = `dividas-ativas-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};
