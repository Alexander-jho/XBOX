import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Sale, Expense, ClosedConsoleSession, PaymentMethod } from '../types';
import { formatCOP } from './formatters';

export interface ExportDataParams {
  periodLabel: string;
  startDate: string;
  endDate: string;
  sales: Sale[];
  expenses: Expense[];
  closedSessions: ClosedConsoleSession[];
  initialCash: number;
  countedCash?: number;
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
}: ExportDataParams) {
  const wb = XLSX.utils.book_new();

  // Financial calculations
  const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
  const cashSales = sales.filter(s => s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const transferSales = sales.filter(s => s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const cashExpenses = expenses.filter(e => e.paymentMethod === 'efectivo').reduce((acc, e) => acc + e.amount, 0);
  const transferExpenses = expenses.filter(e => e.paymentMethod === 'transferencia').reduce((acc, e) => acc + e.amount, 0);

  const expectedCash = initialCash + cashSales - cashExpenses;
  const difference = countedCash > 0 ? countedCash - expectedCash : 0;

  const gargueriaSales = sales.filter(s => s.area === 'gargueria').reduce((acc, s) => acc + s.total, 0);
  const xboxSales = sales.filter(s => s.area === 'xbox').reduce((acc, s) => acc + s.total, 0);
  const papeleriaSales = sales.filter(s => s.area === 'papeleria').reduce((acc, s) => acc + s.total, 0);

  // 1. Resumen Sheet
  const summaryData = [
    ['REPORTE FINANCIERO Y OPERATIVO - CONTROL DE NEGOCIO'],
    ['Período:', periodLabel],
    ['Desde:', startDate, 'Hasta:', endDate],
    ['Fecha de Generación:', new Date().toLocaleString('es-CO')],
    [],
    ['CONCEPTO', 'VALOR'],
    ['Ventas Totales', totalSales],
    ['Ventas en Efectivo (Caja)', cashSales],
    ['Ventas por Transferencia', transferSales],
    ['Gastos Totales', totalExpenses],
    ['Gastos en Efectivo (Salida de caja)', cashExpenses],
    ['Gastos por Transferencia', transferExpenses],
    ['Base Inicial de Caja', initialCash],
    ['Caja Esperada en Efectivo', expectedCash],
    ['Efectivo Contado (Arqueo)', countedCash],
    ['Diferencia de Caja', difference],
    [],
    ['DESGLOSE POR ÁREAS', 'TOTAL'],
    ['Ventas Garguería', gargueriaSales],
    ['Ventas Xbox / PlayStation', xboxSales],
    ['Ventas Papelería y Bebidas', papeleriaSales],
    ['Sesiones de Consola Cerradas', closedSessions.length],
    ['Transacciones Totales', sales.length],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen Financiero');

  // 2. Detalle de Ventas Sheet
  const salesRows: (string | number)[][] = [
    ['Fecha', 'Hora', 'Área', 'Producto / Detalle', 'Cantidad', 'Precio Unitario', 'Subtotal', 'Medio de Pago', 'Entidad / Ref']
  ];
  sales.forEach(sale => {
    sale.items.forEach(item => {
      salesRows.push([
        sale.date,
        sale.time,
        sale.area.toUpperCase(),
        item.name,
        item.quantity,
        item.unitPrice,
        item.subtotal,
        sale.paymentMethod === 'efectivo' ? 'EFECTIVO' : 'TRANSFERENCIA',
        sale.transferProvider ? `${sale.transferProvider} ${sale.transferReference || ''}` : '-'
      ]);
    });
  });
  const salesWs = XLSX.utils.aoa_to_sheet(salesRows);
  XLSX.utils.book_append_sheet(wb, salesWs, 'Detalle de Ventas');

  // 3. Transferencias Sheet
  const transferSalesList = sales.filter(s => s.paymentMethod === 'transferencia');
  const transferRows: (string | number)[][] = [
    ['Fecha', 'Hora', 'Área', 'Concepto / Items', 'Medio / Entidad', 'Referencia / Comprobante', 'Valor']
  ];
  transferSalesList.forEach(ts => {
    const concept = ts.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    transferRows.push([
      ts.date,
      ts.time,
      ts.area.toUpperCase(),
      concept,
      ts.transferProvider || 'Transferencia',
      ts.transferReference || 'Sin referencia',
      ts.total
    ]);
  });
  const transferWs = XLSX.utils.aoa_to_sheet(transferRows);
  XLSX.utils.book_append_sheet(wb, transferWs, 'Transferencias');

  // 4. Gastos Sheet
  const expenseRows: (string | number)[][] = [
    ['Fecha', 'Hora', 'Concepto', 'Valor', 'Medio de Pago', 'Referencia / Observaciones']
  ];
  expenses.forEach(exp => {
    expenseRows.push([
      exp.date,
      exp.time,
      exp.concept,
      exp.amount,
      exp.paymentMethod === 'efectivo' ? 'EFECTIVO' : 'TRANSFERENCIA',
      exp.notes || exp.transferReference || '-'
    ]);
  });
  const expenseWs = XLSX.utils.aoa_to_sheet(expenseRows);
  XLSX.utils.book_append_sheet(wb, expenseWs, 'Gastos');

  // 5. Sesiones Xbox / PlayStation Sheet
  const consoleRows: (string | number)[][] = [
    ['Cuenta', 'Consola', 'Tipo de Consola', 'Modalidad', 'Hora Inicio', 'Hora Fin', 'Tiempo Inicial', 'Tiempo Adicional', 'Controles Extra', 'Productos Consumidos', 'Total Consola', 'Total Productos', 'Total Cuenta', 'Medio Pago']
  ];
  closedSessions.forEach(cs => {
    const productsStr = cs.products.map(p => `${p.quantity}x ${p.name} ($${p.subtotal})`).join('; ') || 'Ninguno';
    consoleRows.push([
      cs.accountNumber,
      cs.consoleName,
      cs.consoleModel,
      cs.lightMode === 'con_luz' ? 'Con luz' : 'Sin luz',
      new Date(cs.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      new Date(cs.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      `${cs.initialMinutes} min`,
      `${cs.addedMinutes} min`,
      cs.extraControllers > 0 ? `${cs.extraControllers} ctrl ($${cs.extraControllerPrice})` : '0',
      productsStr,
      cs.totalConsoleTimePrice,
      cs.totalProductsPrice,
      cs.totalPrice,
      cs.paymentMethod.toUpperCase()
    ]);
  });
  const consoleWs = XLSX.utils.aoa_to_sheet(consoleRows);
  XLSX.utils.book_append_sheet(wb, consoleWs, 'Xbox y PlayStation');

  // Write file
  const fileName = `Reporte_${periodLabel.replace(/\s+/g, '_')}_${startDate}_a_${endDate}.xlsx`;
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
}: ExportDataParams) {
  const doc = new jsPDF();
  let y = 18;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 32, 47);
  doc.text('CONTROL DEL NEGOCIO - REPORTE', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Período: ${periodLabel} | Rango: ${startDate} al ${endDate}`, 14, y);
  y += 5;
  doc.text(`Generado el: ${new Date().toLocaleString('es-CO')}`, 14, y);
  y += 8;

  // Horizontal line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 7;

  // Calculations
  const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
  const cashSales = sales.filter(s => s.paymentMethod === 'efectivo').reduce((acc, s) => acc + s.total, 0);
  const transferSales = sales.filter(s => s.paymentMethod === 'transferencia').reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const cashExpenses = expenses.filter(e => e.paymentMethod === 'efectivo').reduce((acc, e) => acc + e.amount, 0);
  const expectedCash = initialCash + cashSales - cashExpenses;
  const difference = countedCash > 0 ? countedCash - expectedCash : 0;

  const gargueriaSales = sales.filter(s => s.area === 'gargueria').reduce((acc, s) => acc + s.total, 0);
  const xboxSales = sales.filter(s => s.area === 'xbox').reduce((acc, s) => acc + s.total, 0);
  const papeleriaSales = sales.filter(s => s.area === 'papeleria').reduce((acc, s) => acc + s.total, 0);

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 48, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 48, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RESUMEN FINANCIERO', 18, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const col1X = 18;
  const col2X = 105;
  let summaryY = y + 15;

  doc.text(`• Ventas Totales: ${formatCOP(totalSales)}`, col1X, summaryY);
  doc.text(`• Ventas Efectivo: ${formatCOP(cashSales)}`, col1X, summaryY + 6);
  doc.text(`• Ventas Transferencia: ${formatCOP(transferSales)}`, col1X, summaryY + 12);
  doc.text(`• Gastos Totales: ${formatCOP(totalExpenses)}`, col1X, summaryY + 18);
  doc.text(`• Gastos en Efectivo: ${formatCOP(cashExpenses)}`, col1X, summaryY + 24);

  doc.text(`• Base Inicial: ${formatCOP(initialCash)}`, col2X, summaryY);
  doc.text(`• Caja Esperada: ${formatCOP(expectedCash)}`, col2X, summaryY + 6);
  doc.text(`• Efectivo Contado: ${formatCOP(countedCash)}`, col2X, summaryY + 12);
  doc.text(`• Diferencia: ${formatCOP(difference)}`, col2X, summaryY + 18);
  doc.text(`• Garguería: ${formatCOP(gargueriaSales)} | Xbox: ${formatCOP(xboxSales)}`, col2X, summaryY + 24);

  y += 56;

  // Section: Últimas Ventas
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`DETALLE DE VENTAS (${sales.length} registros)`, 14, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Fecha/Hora', 16, y + 4.5);
  doc.text('Área', 45, y + 4.5);
  doc.text('Detalle de Items', 75, y + 4.5);
  doc.text('Pago', 145, y + 4.5);
  doc.text('Total', 175, y + 4.5);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const displaySales = sales.slice(0, 20); // Top 20 for page 1
  displaySales.forEach((sale) => {
    if (y > 275) {
      doc.addPage();
      y = 15;
    }
    const itemsSummary = sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const truncatedItems = itemsSummary.length > 38 ? itemsSummary.substring(0, 38) + '...' : itemsSummary;

    doc.text(`${sale.date.substring(5)} ${sale.time}`, 16, y);
    doc.text(sale.area.toUpperCase(), 45, y);
    doc.text(truncatedItems, 75, y);
    doc.text(sale.paymentMethod === 'efectivo' ? 'Efectivo' : (sale.transferProvider || 'Transf.'), 145, y);
    doc.text(formatCOP(sale.total), 175, y);
    y += 5;
  });

  if (sales.length > 20) {
    doc.setFont('helvetica', 'italic');
    doc.text(`... y ${sales.length - 20} ventas adicionales (ver archivo Excel para el desglose completo).`, 16, y + 2);
    y += 8;
  }

  // Next page for Transfers and Consoles if needed
  if (closedSessions.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 18;
    } else {
      y += 6;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`SESIONES XBOX & PLAYSTATION CERRADAS (${closedSessions.length})`, 14, y);
    y += 5;

    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Cuenta', 16, y + 4.5);
    doc.text('Consola', 45, y + 4.5);
    doc.text('Modalidad / Tiempo', 80, y + 4.5);
    doc.text('Productos', 130, y + 4.5);
    doc.text('Total', 175, y + 4.5);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    closedSessions.slice(0, 15).forEach((cs) => {
      if (y > 275) {
        doc.addPage();
        y = 15;
      }
      const prodStr = cs.products.length > 0 ? `${cs.products.length} agregados` : 'Ninguno';
      doc.text(cs.accountNumber, 16, y);
      doc.text(`${cs.consoleName} (${cs.consoleModel})`, 45, y);
      doc.text(`${cs.lightMode === 'con_luz' ? 'Con luz' : 'Sin luz'} - ${cs.totalMinutes} min`, 80, y);
      doc.text(prodStr, 130, y);
      doc.text(formatCOP(cs.totalPrice), 175, y);
      y += 5;
    });
  }

  // Save PDF
  const fileName = `Reporte_${periodLabel.replace(/\s+/g, '_')}_${startDate}_a_${endDate}.pdf`;
  doc.save(fileName);
}
