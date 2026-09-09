import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Sale, Expense, ClosedConsoleSession, CashWithdrawal } from '../types';
import { formatCOP, BANK_ACCOUNT_NOTICE } from './formatters';

export interface ExportDataParams {
  periodLabel: string;
  startDate: string;
  endDate: string;
  sales: Sale[];
  expenses: Expense[];
  closedSessions: ClosedConsoleSession[];
  initialCash: number;
  countedCash?: number;
  cashWithdrawals?: CashWithdrawal[];
  closureNotes?: string;
  operatorName?: string;
}

export function exportToExcel({
  periodLabel,
  startDate,
  endDate,
  sales,
  expenses,
  closedSessions,
  initialCash,
  countedCash = 0,
  cashWithdrawals = [],
  operatorName = 'Operador General',
}: ExportDataParams) {
  const wb = XLSX.utils.book_new();

  // Financial calculations
  const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
  const cashSales = sales.filter(s => s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const transferSales = sales.filter(s => s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const cashExpenses = expenses.filter(e => e.paymentMethod === 'efectivo').reduce((acc, e) => acc + e.amount, 0);
  const transferExpenses = expenses.filter(e => e.paymentMethod === 'transferencia').reduce((acc, e) => acc + e.amount, 0);

  const totalWithdrawals = cashWithdrawals.reduce((acc, w) => acc + w.amount, 0);
  const expectedCash = initialCash + cashSales - cashExpenses - totalWithdrawals;
  const difference = countedCash > 0 ? countedCash - expectedCash : 0;

  // Breakdown by origin
  const gargueriaCash = sales.filter(s => s.area === 'gargueria' && s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const gargueriaTransfer = sales.filter(s => s.area === 'gargueria' && s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);
  const gargueriaTotal = gargueriaCash + gargueriaTransfer;

  const papeleriaCash = sales.filter(s => s.area === 'papeleria' && s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const papeleriaTransfer = sales.filter(s => s.area === 'papeleria' && s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);
  const papeleriaTotal = papeleriaCash + papeleriaTransfer;

  const xboxCash = sales.filter(s => s.area === 'xbox' && s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const xboxTransfer = sales.filter(s => s.area === 'xbox' && s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);
  const xboxTotal = xboxCash + xboxTransfer;

  // Breakdown by transfer method
  const nequiSales = sales.filter(s => s.paymentMethod === 'transferencia' && (s.transferProvider === 'Nequi' || !s.transferProvider)).reduce((acc, s) => acc + s.total, 0);
  const daviplataSales = sales.filter(s => s.paymentMethod === 'transferencia' && s.transferProvider === 'Daviplata').reduce((acc, s) => acc + s.total, 0);
  const bancolombiaSales = sales.filter(s => s.paymentMethod === 'transferencia' && s.transferProvider === 'Bancolombia').reduce((acc, s) => acc + s.total, 0);
  const otrosTransfer = sales.filter(s => s.paymentMethod === 'transferencia' && s.transferProvider === 'Otro').reduce((acc, s) => acc + s.total, 0);

  // 1. Resumen Sheet
  const summaryData = [
    ['REPORTE FINANCIERO Y CIERRE DE CAJA'],
    ['Período:', periodLabel],
    ['Rango de Fechas:', `Desde ${startDate} hasta ${endDate}`],
    ['Operador / Responsable:', operatorName],
    ['Generado el:', new Date().toLocaleString('es-CO')],
    ['INSTRUCCIÓN DE CONSIGNACIÓN:', BANK_ACCOUNT_NOTICE],
    [],
    ['=== CLASIFICACIÓN DE INGRESOS (ORIGEN vs. MÉTODO DE PAGO) ==='],
    ['ORIGEN / CATEGORÍA', 'EFECTIVO (CAJA)', 'NEQUI / TRANSF.', 'TOTAL RECAUDADO', '% PARTICIPACIÓN'],
    ['Garguería (Snacks, Dulces, Bebidas)', gargueriaCash, gargueriaTransfer, gargueriaTotal, totalSales > 0 ? `${Math.round((gargueriaTotal / totalSales) * 100)}%` : '0%'],
    ['Papelería e Impresiones', papeleriaCash, papeleriaTransfer, papeleriaTotal, totalSales > 0 ? `${Math.round((papeleriaTotal / totalSales) * 100)}%` : '0%'],
    ['Tiempo de Xbox / Videojuegos', xboxCash, xboxTransfer, xboxTotal, totalSales > 0 ? `${Math.round((xboxTotal / totalSales) * 100)}%` : '0%'],
    ['TOTAL INGRESOS', cashSales, transferSales, totalSales, '100%'],
    [],
    ['=== DESGLOSE POR MEDIO DE PAGO ==='],
    ['Efectivo en Caja', cashSales],
    ['Transferencias Nequi', nequiSales],
    ['Transferencias Daviplata', daviplataSales],
    ['Transferencias Bancolombia / Otros', bancolombiaSales + otrosTransfer],
    ['TOTAL RECAUDADO', totalSales],
    [],
    ['=== ARQUEO Y CUADRE DE CAJA (EFECTIVO) ==='],
    ['(+) Base Inicial de Caja', initialCash],
    ['(+) Ventas en Efectivo', cashSales],
    ['(-) Gastos en Efectivo', cashExpenses],
    ['(-) Retiros de Efectivo', totalWithdrawals],
    ['(=) Efectivo Esperado en Caja', expectedCash],
    ['Efectivo Contado (Arqueo Físico)', countedCash],
    ['Diferencia de Caja', difference],
    [],
    ['NOTA FIJA:', BANK_ACCOUNT_NOTICE],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Cierre y Resumen');

  // 2. Detalle de Ventas Sheet
  const salesRows: (string | number)[][] = [
    ['Fecha', 'Hora', 'Origen / Categoría', 'Producto / Detalle', 'Cantidad', 'Precio Unitario', 'Subtotal', 'Medio de Pago', 'Entidad / Ref', 'Extemporáneo']
  ];
  sales.forEach(sale => {
    sale.items.forEach(item => {
      salesRows.push([
        sale.date,
        sale.time,
        sale.area === 'gargueria' ? 'Garguería' : sale.area === 'papeleria' ? 'Papelería' : 'Xbox',
        item.name,
        item.quantity,
        item.unitPrice,
        item.subtotal,
        sale.paymentMethod === 'efectivo' ? 'Efectivo' : 'Nequi / Transf.',
        sale.transferProvider ? `${sale.transferProvider} ${sale.transferReference || ''}` : '-',
        sale.isExtemporaneous ? 'SÍ (Fecha anterior)' : 'NO'
      ]);
    });
  });
  const salesWs = XLSX.utils.aoa_to_sheet(salesRows);
  XLSX.utils.book_append_sheet(wb, salesWs, 'Detalle de Ventas');

  // 3. Gastos Sheet
  const expenseRows: (string | number)[][] = [
    ['Fecha', 'Hora', 'Concepto', 'Valor', 'Medio de Pago', 'Observaciones']
  ];
  expenses.forEach(exp => {
    expenseRows.push([
      exp.date,
      exp.time,
      exp.concept,
      exp.amount,
      exp.paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia',
      exp.notes || exp.transferReference || '-'
    ]);
  });
  const expenseWs = XLSX.utils.aoa_to_sheet(expenseRows);
  XLSX.utils.book_append_sheet(wb, expenseWs, 'Gastos');

  // Write file
  const fileName = `Cierre_Caja_${periodLabel.replace(/\s+/g, '_')}_${startDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportToPDF({
  periodLabel,
  startDate,
  endDate,
  sales,
  expenses,
  closedSessions,
  initialCash,
  countedCash = 0,
  cashWithdrawals = [],
  closureNotes = '',
  operatorName = 'Operador de Turno',
}: ExportDataParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  // Financial calculations
  const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
  const cashSales = sales.filter(s => s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const transferSales = sales.filter(s => s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const cashExpenses = expenses.filter(e => e.paymentMethod === 'efectivo').reduce((acc, e) => acc + e.amount, 0);
  const totalWithdrawals = cashWithdrawals.reduce((acc, w) => acc + w.amount, 0);

  const expectedCash = initialCash + cashSales - cashExpenses - totalWithdrawals;
  const difference = countedCash > 0 ? countedCash - expectedCash : 0;

  // Breakdown by origin (Garguería, Papelería, Tiempo de Xbox)
  const gargueriaCash = sales.filter(s => s.area === 'gargueria' && s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const gargueriaTransfer = sales.filter(s => s.area === 'gargueria' && s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);
  const gargueriaTotal = gargueriaCash + gargueriaTransfer;

  const papeleriaCash = sales.filter(s => s.area === 'papeleria' && s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const papeleriaTransfer = sales.filter(s => s.area === 'papeleria' && s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);
  const papeleriaTotal = papeleriaCash + papeleriaTransfer;

  const xboxCash = sales.filter(s => s.area === 'xbox' && s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const xboxTransfer = sales.filter(s => s.area === 'xbox' && s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);
  const xboxTotal = xboxCash + xboxTransfer;

  // Breakdown by transfer method (Nequi, etc.)
  const nequiSales = sales.filter(s => s.paymentMethod === 'transferencia' && (s.transferProvider === 'Nequi' || !s.transferProvider)).reduce((acc, s) => acc + s.total, 0);
  const otherTransfers = transferSales - nequiSales;

  let y = 14;

  // -------------------------------------------------------------
  // Header Box
  // -------------------------------------------------------------
  doc.setFillColor(15, 23, 42); // Deep Slate
  doc.roundedRect(marginX, y, contentWidth, 22, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CIERRE DIARIO DE CAJA Y CONTROL OPERATIVO', marginX + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  const dateSub = startDate === endDate ? `Fecha de Corte: ${startDate}` : `Rango: ${startDate} al ${endDate}`;
  doc.text(`${dateSub}  |  Período: ${periodLabel}  |  Operador: ${operatorName}`, marginX + 6, y + 14);
  doc.text(`Fecha y hora de emisión: ${new Date().toLocaleString('es-CO')}`, marginX + 6, y + 19);

  y += 26;

  // -------------------------------------------------------------
  // 1. Matriz de Clasificación de Ingresos (Origen vs. Medio de Pago)
  // -------------------------------------------------------------
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. CLASIFICACIÓN DE INGRESOS (ORIGEN DEL DINERO vs. MÉTODO DE PAGO)', marginX, y);
  y += 4;

  // Table header
  const tableX = marginX;
  const colWidths = [62, 38, 38, 44]; // Sums to 182mm
  const thHeight = 6.5;

  doc.setFillColor(241, 245, 249);
  doc.rect(tableX, y, contentWidth, thHeight, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(tableX, y, contentWidth, thHeight, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('ORIGEN / CATEGORÍA', tableX + 3, y + 4.5);
  doc.text('EFECTIVO (CAJA)', tableX + colWidths[0] + 3, y + 4.5);
  doc.text('NEQUI / TRANSF.', tableX + colWidths[0] + colWidths[1] + 3, y + 4.5);
  doc.text('TOTAL RECAUDADO', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 3, y + 4.5);

  y += thHeight;

  // Data rows
  const originRows = [
    { label: 'Garguería (Snacks, Dulces, Bebidas)', cash: gargueriaCash, transfer: gargueriaTransfer, total: gargueriaTotal },
    { label: 'Papelería e Impresiones', cash: papeleriaCash, transfer: papeleriaTransfer, total: papeleriaTotal },
    { label: 'Tiempo de Xbox (Consolas de Videojuegos)', cash: xboxCash, transfer: xboxTransfer, total: xboxTotal },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  originRows.forEach((row, idx) => {
    const rowH = 6;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(tableX, y, contentWidth, rowH, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(tableX, y, contentWidth, rowH, 'S');

    const pct = totalSales > 0 ? ` (${Math.round((row.total / totalSales) * 100)}%)` : '';

    doc.text(row.label, tableX + 3, y + 4.2);
    doc.text(formatCOP(row.cash), tableX + colWidths[0] + 3, y + 4.2);
    doc.text(formatCOP(row.transfer), tableX + colWidths[0] + colWidths[1] + 3, y + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatCOP(row.total)}${pct}`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 3, y + 4.2);
    doc.setFont('helvetica', 'normal');

    y += rowH;
  });

  // Total Row
  const totalRowH = 7;
  doc.setFillColor(236, 253, 245); // Emerald light
  doc.rect(tableX, y, contentWidth, totalRowH, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.rect(tableX, y, contentWidth, totalRowH, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('TOTAL GENERAL DE INGRESOS', tableX + 3, y + 4.8);
  doc.text(formatCOP(cashSales), tableX + colWidths[0] + 3, y + 4.8);
  doc.text(formatCOP(transferSales), tableX + colWidths[0] + colWidths[1] + 3, y + 4.8);
  doc.text(`${formatCOP(totalSales)} (100%)`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 3, y + 4.8);

  y += totalRowH + 6;

  // -------------------------------------------------------------
  // 2. Desglose Específico de Métodos de Pago y Arqueo Físico
  // -------------------------------------------------------------
  const splitColW = (contentWidth - 6) / 2; // 88mm each

  // Left Box: Métodos de Pago
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX, y, splitColW, 44, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, y, splitColW, 44, 1.5, 1.5, 'S');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. DESGLOSE DE MÉTODOS DE PAGO', marginX + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  let leftY = y + 12;
  doc.text(`• Efectivo en Mano / Caja:`, marginX + 4, leftY);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCOP(cashSales), marginX + splitColW - 4, leftY, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  leftY += 6;
  doc.text(`• Transferencias Nequi:`, marginX + 4, leftY);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCOP(nequiSales), marginX + splitColW - 4, leftY, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  leftY += 6;
  doc.text(`• Daviplata / Bancolombia / Otros:`, marginX + 4, leftY);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCOP(otherTransfers), marginX + splitColW - 4, leftY, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  leftY += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(marginX + 4, leftY - 1, marginX + splitColW - 4, leftY - 1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`TOTAL RECAUDADO:`, marginX + 4, leftY + 4);
  doc.text(formatCOP(totalSales), marginX + splitColW - 4, leftY + 4, { align: 'right' });

  // Right Box: Arqueo y Cuadre de Caja
  const rightX = marginX + splitColW + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, y, splitColW, 44, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightX, y, splitColW, 44, 1.5, 1.5, 'S');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. CUADRE Y ARQUEO DE CAJA', rightX + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  let rightY = y + 12;

  doc.text(`(+) Base Inicial de Caja:`, rightX + 4, rightY);
  doc.text(formatCOP(initialCash), rightX + splitColW - 4, rightY, { align: 'right' });

  rightY += 5.5;
  doc.text(`(+) Ventas en Efectivo:`, rightX + 4, rightY);
  doc.text(formatCOP(cashSales), rightX + splitColW - 4, rightY, { align: 'right' });

  rightY += 5.5;
  doc.text(`(-) Gastos en Efectivo:`, rightX + 4, rightY);
  doc.text(`-${formatCOP(cashExpenses)}`, rightX + splitColW - 4, rightY, { align: 'right' });

  if (totalWithdrawals > 0) {
    rightY += 5.5;
    doc.text(`(-) Retiros de Efectivo:`, rightX + 4, rightY);
    doc.text(`-${formatCOP(totalWithdrawals)}`, rightX + splitColW - 4, rightY, { align: 'right' });
  }

  rightY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.text(`(=) Efectivo Esperado en Caja:`, rightX + 4, rightY);
  doc.text(formatCOP(expectedCash), rightX + splitColW - 4, rightY, { align: 'right' });

  rightY += 5.5;
  doc.text(`Efectivo Físico Contado:`, rightX + 4, rightY);
  doc.text(formatCOP(countedCash), rightX + splitColW - 4, rightY, { align: 'right' });

  rightY += 5.5;
  const diffColor = difference === 0 ? [16, 185, 129] : difference > 0 ? [37, 99, 235] : [220, 38, 38];
  doc.setTextColor(diffColor[0], diffColor[1], diffColor[2]);
  const diffLabel = difference === 0 ? 'Caja Cuadrada ($0)' : difference > 0 ? `Sobrante: +${formatCOP(difference)}` : `Faltante: ${formatCOP(difference)}`;
  doc.text(`Diferencia de Arqueo:`, rightX + 4, rightY);
  doc.text(diffLabel, rightX + splitColW - 4, rightY, { align: 'right' });

  y += 50;

  // -------------------------------------------------------------
  // 3. Resumen Operativo y Gastos
  // -------------------------------------------------------------
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('4. RESUMEN OPERATIVO DEL TURNO', marginX, y);
  y += 4;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginX, y, contentWidth, 14, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const statColW = contentWidth / 4;
  doc.text(`Transacciones de Venta:`, marginX + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sales.length} registros`, marginX + 4, y + 10);
  doc.setFont('helvetica', 'normal');

  doc.text(`Sesiones Xbox / Play:`, marginX + statColW + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${closedSessions.length} cuentas`, marginX + statColW + 4, y + 10);
  doc.setFont('helvetica', 'normal');

  doc.text(`Gastos Operativos:`, marginX + statColW * 2 + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatCOP(totalExpenses)} (${expenses.length})`, marginX + statColW * 2 + 4, y + 10);
  doc.setFont('helvetica', 'normal');

  doc.text(`Total Recaudado Día:`, marginX + statColW * 3 + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`${formatCOP(totalSales)}`, marginX + statColW * 3 + 4, y + 10);
  doc.setTextColor(51, 65, 85);

  y += 18;

  // Gastos del día si hay
  if (expenses.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`DETALLE DE GASTOS Y SALIDAS (${expenses.length})`, marginX, y);
    y += 4;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    expenses.slice(0, 4).forEach(exp => {
      doc.text(`• ${exp.time} | ${exp.concept}: ${formatCOP(exp.amount)} [${exp.paymentMethod.toUpperCase()}] ${exp.notes ? `(${exp.notes})` : ''}`, marginX + 3, y);
      y += 4;
    });
    y += 2;
  }

  // -------------------------------------------------------------
  // PIE DE PÁGINA FIJO OBLIGATORIO: Cuenta Bancaria y Firmas
  // -------------------------------------------------------------
  const footerH = 34;
  const footerY = pageHeight - footerH - 10; // At the bottom of the page

  // Bank notice box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.roundedRect(marginX, footerY, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11); // Amber 500
  doc.setLineWidth(0.6);
  doc.roundedRect(marginX, footerY, contentWidth, 14, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('INSTRUCCIÓN OBLIGATORIA DE TRANSFERENCIA / CONSIGNACIÓN:', marginX + 4, footerY + 5.5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text(`"${BANK_ACCOUNT_NOTICE}"`, marginX + 4, footerY + 10.5);

  // Signatures
  const sigY = footerY + 22;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);

  const sigColW = (contentWidth - 20) / 2;
  doc.line(marginX + 6, sigY, marginX + 6 + sigColW, sigY);
  doc.line(marginX + sigColW + 20, sigY, marginX + sigColW * 2 + 20, sigY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Firma Cajero/Operador: ${operatorName}`, marginX + 6, sigY + 4);
  doc.text('Firma Administrador / Supervisor', marginX + sigColW + 20, sigY + 4);

  // Save PDF
  const safeDate = startDate.replace(/[^a-zA-Z0-9-]/g, '_');
  const fileName = `Cierre_Diario_Caja_${safeDate}.pdf`;
  doc.save(fileName);
}

// Dedicated helper to export a daily cash closure
export function exportDailyClosurePDF(closure: {
  date: string;
  openedAt: number;
  closedAt: number;
  initialCash: number;
  countedCash: number;
  difference: number;
  totalSales: number;
  cashSales: number;
  transferSales: number;
  totalExpenses: number;
  cashExpenses: number;
  transferExpenses: number;
  salesBreakdown?: {
    gargueria: number;
    xbox: number;
    papeleria: number;
  };
  sales?: Sale[];
  expenses?: Expense[];
  closedSessions?: ClosedConsoleSession[];
  withdrawals?: CashWithdrawal[];
  notes?: string;
  closedBy?: string;
}) {
  const sales = closure.sales || [];
  const expenses = closure.expenses || [];
  const closedSessions = closure.closedSessions || [];
  const cashWithdrawals = closure.withdrawals || [];

  exportToPDF({
    periodLabel: `Cierre Diario - ${closure.date}`,
    startDate: closure.date,
    endDate: closure.date,
    sales,
    expenses,
    closedSessions,
    initialCash: closure.initialCash,
    countedCash: closure.countedCash,
    cashWithdrawals,
    closureNotes: closure.notes,
    operatorName: closure.closedBy || 'Operador de Turno',
  });
}
