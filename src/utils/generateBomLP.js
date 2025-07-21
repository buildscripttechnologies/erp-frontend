import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBase64ImageFromPDF } from "./convertPDFPageToImage"; // You need this util

export const generateBomLP = async (bomData) => {
  const doc = new jsPDF("portrait", "mm", "a4");
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Convert the letterpad PDF to base64 image
  const backgroundBase64 = await getBase64ImageFromPDF("/lp.pdf", 0);

  // 2. Draw letterpad image as full-page background
  doc.addImage(backgroundBase64, "PNG", 0, 0, pageWidth, pageHeight);

  doc.setTextColor("white");
  doc.setFont("helvetica", "bold");
  doc.text(`${bomData.bomNo + " Details"}`, pageWidth / 2, 47, {
    align: "center",
  });

  let y = 54; // adjust according to letterpad
  // 3. Add BOM Details
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(12);
  //   doc.setTextColor("#d8b76a");
  //   doc.text("BOM Details", doc.internal.pageSize.getWidth() / 2, y, {
  //     align: "center",
  //   });

  const details = [
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

  doc.setFontSize(10);
  doc.setTextColor("#292926");

  // Split the array into two columns
  const leftDetails = details.slice(0, Math.ceil(details.length / 2));
  const rightDetails = details.slice(Math.ceil(details.length / 2));

  let leftX = margin;
  let rightX = doc.internal.pageSize.getWidth() / 2 + margin + 24;
  let startY = y + 6; // your previous y value

  let maxLength = Math.max(leftDetails.length, rightDetails.length);

  // Loop for maximum length to keep rows aligned
  for (let i = 0; i < maxLength; i++) {
    if (leftDetails[i]) {
      doc.setFont("helvetica", "bold");
      doc.text(`${leftDetails[i][0]}:`, leftX, startY);
      doc.setFont("helvetica", "normal");
      doc.text(`${leftDetails[i][1]}`, leftX + 27, startY);
    }

    if (rightDetails[i]) {
      doc.setFont("helvetica", "bold");
      doc.text(`${rightDetails[i][0]}:`, rightX + 10, startY);
      doc.setFont("helvetica", "normal");
      doc.text(`${rightDetails[i][1]}`, rightX + 50, startY, {
        align: "right",
      });
    }

    startY += 6;
  }

  // 4. Product Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize("12");
  doc.setTextColor("#d8b76a");
  doc.text("Product Details", margin, y + 27);

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
    startY: y + 30,
    head: [
      [
        "S. No.",
        "SKU Code",
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
    styles: {
      fontSize: 9,
      textColor: "#292926",
      fillColor: false,
      halign: "left",
    },
    headStyles: {
      fillColor: [216, 183, 106], // background color
      textColor: [41, 41, 38], // dark text color (converted from "#292926")
      halign: "left", // horizontal alignment
      fontStyle: "bold", // bold header
      lineColor: [216, 183, 106], // border color for grid lines
      lineWidth: 0.1, // border thickness
    },
    margin: { left: margin, right: margin },
  });

  // Save or print
  //   doc.save(`BOM-${bomData.sampleNo || "Details"}.pdf`);
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  return blobUrl;
};
