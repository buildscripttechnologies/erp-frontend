import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBase64ImageFromPDF } from "./convertPDFPageToImage"; // You need this util

export const generateSample = async (SampleData) => {
  const doc = new jsPDF("portrait", "mm", "a4");
  const margin = 6;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load both pages of lp2.pdf
  const lp2Page1 = await getBase64ImageFromPDF("/lp2.pdf", 0);
  const lp2Page2 = await getBase64ImageFromPDF("/lp2.pdf", 1);

  // Helper to draw lp2 background
  const addBackground = (pageNo) => {
    if (pageNo === "first") {
      doc.addImage(lp2Page1, "PNG", 0, 0, pageWidth, pageHeight);
    } else if (pageNo === "last") {
      doc.addImage(lp2Page2, "PNG", 0, 0, pageWidth, pageHeight);
    } else {
      doc.addImage(lp2Page1, "PNG", 0, 0, pageWidth, pageHeight);
    }
  };

  // --- Page 1 ---
  addBackground("first");
  doc.setTextColor("white");
  doc.setFont("helvetica", "bold");
  doc.text(`${SampleData.sampleNo + " Details"}`, pageWidth / 2, 47, {
    align: "center",
  });

  let y = 54;

  // --- Top Details Table ---
  autoTable(doc, {
    startY: y + 2,
    margin: { left: margin },
    tableWidth: pageWidth - margin * 2, // full width
    theme: "grid",
    // head: [
    //   [
    //     {
    //       content: "BOM Details",
    //       colSpan: 4,
    //       styles: { fontStyle: "bold", halign: "center" },
    //     },
    //   ],
    // ],
    body: [
      // Row 1
      [
        { content: "Party Name:", styles: { fontStyle: "bold" } },
        SampleData.partyName || "-",
        { content: "Sample No.:", styles: { fontStyle: "bold" } },
        SampleData.sampleNo || "-",
      ],
      // Row 2
      [
        { content: "Product Name:", styles: { fontStyle: "bold" } },
        SampleData.product?.name || "-",
        { content: "Date:", styles: { fontStyle: "bold" } },
        new Date(SampleData.date || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      ],
    ],
    styles: {
      fontSize: 8,
      textColor: "#292926",
      halign: "left",
      valign: "middle",
      fillColor: false,
    },
    headStyles: {
      fillColor: [216, 183, 106], // gold
      textColor: [41, 41, 38], // dark text
      fontStyle: "bold",
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 28 }, // Label
      1: { cellWidth: 71 }, // Value
      2: { cellWidth: 28 }, // Label
      3: { cellWidth: 71 }, // Value
    },
  });

  // --- Product Table ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize("12");
  doc.setTextColor("#d8b76a");
  doc.text("Product Details", margin, y + 23);

  const tableBody = (SampleData.productDetails || []).map((item, index) => [
    index + 1,
    item.skuCode || "-",
    item.itemName || "-",
    item.type || "-",
    item.height || "-",
    item.width || "-",
    item.grams ? `${item.grams / 1000} kg` : item.qty || "",
    item.rate || "-",
  ]);

  autoTable(doc, {
    startY: y + 25,
    head: [
      [
        "S. No.",
        "SKU Code",
        "Item Name",
        "Type",
        "Height (Inch)",
        "Width (Inch)",
        "Quantity",
        "Rate",
      ],
    ],
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 8,
      textColor: "#292926",
      fillColor: false,
      halign: "left",
    },
    headStyles: {
      fillColor: [216, 183, 106],
      textColor: [41, 41, 38],
      halign: "left",
      fontStyle: "bold",
      lineColor: [216, 183, 106],
      lineWidth: 0.1,
    },
    margin: { left: margin, right: margin },
  });

  // --- Last Page (always lp2 second page) ---
  doc.addPage();
  addBackground("last");
  doc.setTextColor("white");
  doc.setFont("helvetica", "bold");
  doc.text(`${SampleData.bomNo}`, pageWidth / 2, 47, { align: "center" });

  // Return blob url
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  return blobUrl;
};
