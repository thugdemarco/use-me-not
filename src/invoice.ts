import type { OrderRecord } from "./order-history";

const amount = (value: number) => `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
export async function downloadInvoice(record: OrderRecord) {
  const { jsPDF } = await import("jspdf");
  const { order, customer, placedAt } = record;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(24, 25, 22);
  pdf.rect(0, 0, width, 48, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("USE-ME-NOT", 18, 19);
  pdf.setFontSize(25);
  pdf.text("Simulated invoice", 18, 34);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("No payment was taken. This is not a tax invoice.", 18, 42);
  pdf.setTextColor(35, 35, 32);
  pdf.setFontSize(10);
  pdf.text(`Order ${order.id}`, 18, 62);
  pdf.text(`Status: ${order.status}`, 18, 69);
  pdf.text(`Placed: ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(placedAt))}`, 18, 76);
  pdf.setFont("helvetica", "bold");
  pdf.text("DELIVER TO", 18, 91);
  pdf.setFont("helvetica", "normal");
  const addressLines = pdf.splitTextToSize(`${customer.name}\n${customer.address}\n${customer.city}, ${customer.postalCode}`, 80);
  pdf.text(addressLines, 18, 98);
  let y = 128;
  pdf.setDrawColor(210, 207, 198);
  pdf.line(18, y, width - 18, y);
  y += 9;
  pdf.setFont("helvetica", "bold");
  pdf.text("ITEM", 18, y);
  pdf.text("QTY", width - 60, y);
  pdf.text("TOTAL", width - 18, y, { align: "right" });
  y += 5;
  pdf.line(18, y, width - 18, y);
  y += 10;
  pdf.setFont("helvetica", "normal");
  for (const item of order.items) {
    const nameLines = pdf.splitTextToSize(item.name, width - 105);
    const rowHeight = Math.max(nameLines.length * 5, 8);
    if (y + rowHeight > 265) { pdf.addPage(); y = 22; }
    pdf.text(nameLines, 18, y);
    pdf.text(String(item.quantity), width - 60, y);
    pdf.text(amount(item.lineTotal), width - 18, y, { align: "right" });
    y += rowHeight + 3;
  }
  y += 3;
  pdf.line(18, y, width - 18, y);
  y += 11;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Order total", width - 80, y);
  pdf.text(amount(order.total), width - 18, y, { align: "right" });
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Estimated delivery: ${order.estimatedDeliveryDate}`, 18, y + 14);
  pdf.setTextColor(110, 108, 101);
  pdf.text("A receipt for a decision you made with complete freedom.", 18, 282);
  pdf.save(`use-me-not-invoice-${order.id.replace(/[^a-z0-9-]/gi, "-")}.pdf`);
}
