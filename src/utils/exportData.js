import * as XLSX from "xlsx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "RawMaterials");
  XLSX.writeFile(workbook, "RawMaterials.xlsx");
};

export const exportToPDF = (rawMaterials) => {
  const doc = new jsPDF("l"); // landscape mode

  console.log("raw materials", rawMaterials);

  const headers = [
    "SKU Code",
    "Item Name",
    "Description",
    "HSN/SAC",
    "Type",
    "Location",
    "MOQ",
    "GST(%)",
    "Stock Qty",
    "Base Qty",
    "Pkg Qty",
    "Purchase UOM",
    "Stock UOM",
    "Quality Inspection",
  ];

  const data = rawMaterials.map((e) => [
    e.skuCode,
    e.itemName,
    e.description,
    e.hsnOrSac,
    e.type,
    e.location,
    e.moq,
    e.gst,
    e.stockQty,
    e.baseQty,
    e.pkgQty,
    e.purchaseUOM,
    e.stockUOM,
    e.qualityInspectionNeeded,
  ]);

  autoTable(doc, {
    head: [headers],
    body: data,
    styles: {
      fontSize: 8,
      cellWidth: "wrap",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [216, 183, 106], // RGB for #d8b76a
      textColor: [41, 41, 38], // Optional: your custom text color (near black)
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 20 }, // SKU
      1: { cellWidth: 30 }, // Item Name
      2: { cellWidth: 30 }, // Description
      14: { cellWidth: 80 }, // Attachments
    },
    startY: 20,
    theme: "grid",
    // ensures table isn't forced to page width
  });

  doc.save("RawMaterials.pdf");
};
