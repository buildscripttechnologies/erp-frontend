import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateBom = (bomData) => {
  const doc = new jsPDF("landscape");
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw BOM Details
  doc.setFontSize(14);
  doc.setTextColor("#d8b76a");
  doc.setFont("helvetica", "bold");
  doc.text("BOM Details", margin, 15);

  doc.setFontSize(10);
  doc.setTextColor("#000");
  doc.setFont("helvetica", "normal");

  const detailRows = [
    ["Party Name", bomData.partyName || ""],
    ["Product Name", bomData.productName || ""],

    ["Order Qty", bomData.orderQty || ""],
    ["BOM No.", bomData.bomNo || ""],
    ["Sample No.", bomData.sampleNo || ""],
    [
      "Date",
      new Date(bomData.date || Date.now()).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ],
  ];

  // Split into two columns
  const leftCol = detailRows.slice(0, 3);
  const rightCol = detailRows.slice(3);

  let y = 22;
  leftCol.forEach(([label, value]) => {
    doc.text(`${label}:`, margin, y);
    doc.text(value.toString(), margin + 40, y);
    y += 7;
  });

  y = 22;
  rightCol.forEach(([label, value]) => {
    doc.text(`${label}:`, pageWidth / 2 + 10, y);
    doc.text(value.toString(), pageWidth / 2 + 50, y);
    y += 7;
  });

  // Product Table Heading
  doc.setTextColor("#d8b76a");
  doc.setFont("helvetica", "bold");
  doc.text("Product Details (Raw Material / SFG)", margin, y + 10);

  // Table
  const tableBody = (bomData.productDetails || []).map((item, index) => [
    index + 1,
    item.skuCode || "",
    item.itemName || "",
    item.type || "",
    item.height || "",
    item.width || "",
    item.depth || "",
    item.qty || "",
  ]);

  autoTable(doc, {
    startY: y + 14,
    head: [
      [
        "S. No.",
        "Sku Code",
        "Item Name",
        "Type",
        "Height(cm)",
        "Width(cm)",
        "Depth(cm)",
        "Quantity",
      ],
    ],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [216, 183, 106],
      textColor: "#292926",
      halign: "center",
    },
    bodyStyles: {
      halign: "center",
    },
    styles: {
      fontSize: 9,
    },
    margin: { left: margin, right: margin },
  });

  doc.save(`BOM-${bomData.sampleNo || "Details"}.pdf`);
};
