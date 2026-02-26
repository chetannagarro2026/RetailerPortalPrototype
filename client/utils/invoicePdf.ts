import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "../data/invoices";
import {
  lineBaseTotal,
  lineDiscountAmount,
  discountedLineTotal,
  computeNetSubtotal,
  computeTotalDiscount,
  computeTax,
  computeGrandTotal,
  outstanding,
} from "../data/invoices";

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function downloadInvoicePdf(invoice: Invoice): void {
  const doc = new jsPDF();
  const hasLineDiscounts = invoice.items.some((i) => i.discount);

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice ${invoice.invoiceNumber}`, 14, 22);

  // Meta info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`, 14, 32);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 14, 38);
  doc.text(`Linked PO: ${invoice.linkedPO}`, 14, 44);

  // Table headers
  const headers = hasLineDiscounts
    ? ["Product", "SKU", "Qty", "Unit Price", "Discount", "Line Total"]
    : ["Product", "SKU", "Qty", "Unit Price", "Line Total"];

  // Table rows
  const rows = invoice.items.map((item) => {
    const disc = lineDiscountAmount(item);
    const total = discountedLineTotal(item);
    const discLabel = !item.discount
      ? "—"
      : item.discount.type === "percentage"
        ? `${item.discount.value}%`
        : item.discount.type === "volume"
          ? item.discount.label || "Volume"
          : fmt(item.discount.value);

    const base: string[] = [
      item.productName,
      item.sku,
      String(item.quantity),
      fmt(item.unitPrice),
    ];
    if (hasLineDiscounts) base.push(discLabel);
    base.push(fmt(total));
    return base;
  });

  // Draw table
  autoTable(doc, {
    startY: 52,
    head: [headers],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [27, 42, 74], textColor: 255, fontStyle: "bold" },
    columnStyles: hasLineDiscounts
      ? {
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
        }
      : {
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
    theme: "grid",
  });

  // Summary below table
  const finalY = (doc as any).lastAutoTable?.finalY ?? 120;
  const summaryX = 145;
  const valX = 190;
  let y = finalY + 10;

  doc.setFontSize(9);
  doc.setTextColor(100);

  const netSubtotal = computeNetSubtotal(invoice.items, invoice.orderDiscount);
  const totalDiscount = computeTotalDiscount(invoice.items, invoice.orderDiscount);
  const tax = computeTax(invoice.items, invoice.orderDiscount);
  const grandTotal = computeGrandTotal(invoice.items, invoice.orderDiscount);
  const bal = outstanding(invoice);

  doc.text("Subtotal:", summaryX, y);
  doc.setTextColor(30);
  doc.text(fmt(netSubtotal), valX, y, { align: "right" });
  y += 6;

  if (totalDiscount > 0) {
    doc.setTextColor(100);
    doc.text("Total Discount:", summaryX, y);
    doc.setTextColor(180, 30, 30);
    doc.text(fmt(totalDiscount), valX, y, { align: "right" });
    y += 6;
  }

  doc.setTextColor(100);
  doc.text("Tax:", summaryX, y);
  doc.setTextColor(30);
  doc.text(fmt(tax), valX, y, { align: "right" });
  y += 7;

  // Divider line
  doc.setDrawColor(200);
  doc.line(summaryX, y - 2, valX, y - 2);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 42, 74);
  doc.text("Grand Total:", summaryX, y + 2);
  doc.text(fmt(grandTotal), valX, y + 2, { align: "right" });
  y += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Paid:", summaryX, y);
  doc.setTextColor(22, 163, 74);
  doc.text(fmt(invoice.paid), valX, y, { align: "right" });
  y += 6;

  doc.setTextColor(100);
  doc.text("Outstanding:", summaryX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(bal > 0 ? 180 : 30, bal > 0 ? 30 : 30, bal > 0 ? 30 : 30);
  doc.text(fmt(bal), valX, y, { align: "right" });

  // Save
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
