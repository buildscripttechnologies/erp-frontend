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
    "Category",
    "Color",
    "HSN/SAC",
    "Type",
    "Location",
    "MOQ",
    "Panno",
    "SI Rate",
    "Rate",
    "GST",
    "S Qty",
    "B Qty",
    "P Qty",
    "P UOM",
    "S UOM",
    "Q. Insp.",
    "T Rate",
  ];

  const data = rawMaterials.map((e) => [
    e.skuCode,
    e.itemName,
    e.description,
    e.itemCategory,
    e.itemColor,
    e.hsnOrSac,
    e.type,
    e.location,
    e.moq,
    e.panno,
    e.sqInchRate,
    e.rate,
    e.gst,
    e.stockQty,
    e.baseQty,
    e.pkgQty,
    e.purchaseUOM,
    e.stockUOM,
    (e.qualityInspectionNeeded =
      e.qualityInspectionNeeded == "Required" ? "Yes" : "No"),
    e.totalRate,
  ]);

  autoTable(doc, {
    head: [headers],
    body: data,
    styles: {
      fontSize: 6,
      cellWidth: "wrap",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [216, 183, 106], // RGB for #d8b76a
      textColor: [41, 41, 38], // Optional: your custom text color (near black)
      fontStyle: "bold",
    },
    columnStyles: {
      //   0: { cellWidth: 17 }, // SKU
      1: { cellWidth: 30 }, // Item Name
      2: { cellWidth: 30 }, // Description
      //   5: { cellWidth: 15 }, // Location
      //   12: { cellWidth: 14 }, // Qual. Insp.
      //   13: { cellWidth: 14 }, // Qual. Insp.
      //   14: { cellWidth: 18 }, // Qual. Insp.
      //   // 15: { cellWidth: 80 }, // Attachments
    },
    margin: { top: 5, left: 5, right: 5, bottom: 5 }, // 🔑 super small margins
    startY: 5,
    theme: "grid",
    // tableWidth: "auto",
    // ensures table isn't forced to page width
  });

  doc.save("RawMaterials.pdf");
};
