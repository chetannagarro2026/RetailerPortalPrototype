import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReturnClaim } from "../data/returns";

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function downloadCreditNotePdf(claim: ReturnClaim): void {
  if (!claim.creditNoteNumber) return;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`Credit Note ${claim.creditNoteNumber}`, 14, 22);

  // Meta info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const meta = [
    `Claim ID: ${claim.claimId}`,
    `Invoice: ${claim.invoiceNumber}`,
    `Date: ${formatDate(claim.reviewedAt || claim.createdAt)}`,
    `Status: ${claim.status}`,
  ];
  meta.forEach((line, i) => doc.text(line, 14, 32 + i * 6));

  // Items table
  const hasApproval = claim.items.some((i) => i.approvedQty !== undefined);
  const head = hasApproval
    ? [["Product", "SKU", "Claimed Qty", "Approved Qty", "Unit Price", "Approved Amt"]]
    : [["Product", "SKU", "Return Qty", "Unit Price", "Amount"]];

  const body = claim.items.map((item) => {
    if (hasApproval) {
      return [
        item.productName,
        item.sku,
        String(item.returnQty),
        String(item.approvedQty ?? 0),
        fmt(item.unitPrice),
        fmt((item.approvedQty ?? 0) * item.unitPrice),
      ];
    }
    return [
      item.productName,
      item.sku,
      String(item.returnQty),
      fmt(item.unitPrice),
      fmt(item.returnQty * item.unitPrice),
    ];
  });

  autoTable(doc, {
    startY: 58,
    head,
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 60, 100], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable?.finalY || 100;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Claimed Amount: ${fmt(claim.claimedAmount)}`, 14, finalY + 12);

  if (claim.approvedAmount !== undefined) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(`Approved Credit: ${fmt(claim.approvedAmount)}`, 14, finalY + 20);
  }

  doc.save(`${claim.creditNoteNumber}.pdf`);
}
