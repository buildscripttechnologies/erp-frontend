import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePOPdf = (po) => {
  const doc = new jsPDF("l"); // landscape

  // --- Header Info ---
  doc.setFontSize(14);
  doc.text("Purchase Order", 14, 15);

  doc.setFontSize(10);
  doc.text(`PO No: ${po.poNo || ""}`, 14, 28);
  doc.text(`Date: ${new Date(po.date).toLocaleDateString()}`, 14, 34);
  doc.text(`Vendor: ${po.vendor?.vendorName || ""}`, 14, 40);
  doc.text(`Total Amount: ${po.totalAmount || 0}`, 14, 46);

  // --- Table Headers ---
  const headers = [
    "S.No",
    "SKU Code",
    "Item Name",
    "Item Description",
    "Item Category",
    "Item Color",
    "HSN",
    "GST",
    "Order Qty",
    "Pur. UOM",
    "Rate",
    "Amount",
  ];

  // --- Table Body ---
  const data = po.items?.map((item, idx) => [
    idx + 1,
    item.item?.skuCode || "",
    item.item?.itemName || "",
    item.item?.description || "",
    item.item?.itemCategory || "",
    item.item?.itemColor || "",
    item.item?.hsnOrSac || "",
    item.item?.gst ? `${item.item.gst}%` : "",
    item.orderQty || 0,
    item.item?.purchaseUOM?.unitName || "",
    item.rate || 0,
    item.amount || 0,
  ]);

  // --- Table ---
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 50,
    styles: {
      fontSize: 8,
      cellWidth: "wrap",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: "#d8b76a", // Blue
      textColor: "#292926",
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 12 }, // S.No
      1: { cellWidth: 30 }, // SKU
      2: { cellWidth: 35 }, // Item Name
      3: { cellWidth: 50 }, // Description
      //   4: { cellWidth: 25 }, // HSN
      //   5: { cellWidth: 20 }, // GST
      //   6: { cellWidth: 25 }, // Qty
      //   7: { cellWidth: 25 }, // UOM
      //   8: { cellWidth: 25 }, // Rate
      //   9: { cellWidth: 30 }, // Amount
    },
    theme: "grid",
  });

  // --- Save / Download ---
  //   doc.save(`PO-${po.poNo || "Order"}.pdf`);

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  //   window.open(pdfUrl, "_blank");
  return pdfUrl;
};
