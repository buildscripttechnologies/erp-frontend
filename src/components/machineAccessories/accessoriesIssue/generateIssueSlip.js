import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getCompressedImageFromPDF } from "../../../utils/imageCompress";

export const generateIssueSlip = async (
  accessory,
  letterpadUrl,
  companyDetails
) => {
  const doc = new jsPDF("portrait", "mm", "a4");
  const margin = 6;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const lp2Page1 = await getCompressedImageFromPDF(letterpadUrl, 0);
  const lp2Page2 = await getCompressedImageFromPDF(letterpadUrl, 1);

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
  doc.setTextColor("black");
  doc.setFont("helvetica", "bold");
  doc.text(`Accessory Issue Details`, pageWidth / 2, 47, {
    align: "center",
  });

  let y = 54;

  // --- Top Details Table ---
  autoTable(doc, {
    startY: y + 2,
    margin: { left: margin },
    tableWidth: pageWidth - margin * 2, // full width
    theme: "grid",

    body: [
      // Row 1
      [
        { content: "Company Name", styles: { fontStyle: "bold" } },
        companyDetails.companyName || "",
        { content: "Issue No:", styles: { fontStyle: "bold" } },
        accessory.issueNo || "",
      ],
      // Row 2
      [
        { content: "Labour / Employee Name:", styles: { fontStyle: "bold" } },
        accessory.personName || "",
        { content: "Department:", styles: { fontStyle: "bold" } },
        accessory.department || "",
      ],
      // Row 3
      [
        { content: "Date:", styles: { fontStyle: "bold" } },
        new Date(accessory.date || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        { content: "-", styles: { fontStyle: "bold" } },
        "-" || "",
      ],
    ],
    styles: {
      fontSize: 8,
      textColor: "#292926",
      halign: "left",
      valign: "middle",
      fillColor: false,
      lineColor: [0, 0, 0], // border color black
      lineWidth: 0.1,
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
  doc.text("Accessory Details", margin, y + 32);

  const tableBody = (accessory.accessories || []).map((item, index) => [
    index + 1,
    item.accessory?.accessoryName || "N/A",
    item.issueQty || "N/A",
    item.accessory?.UOM?.unitName || "N/A",
    item.remarks || "N/A",
  ]);

  autoTable(doc, {
    startY: y + 34,
    head: [
      [
        "S. No.",
        "Accessory Name",
        "Issue Qty",
        "UOM",
        "Remarks",
        // "H (In)",
        // "W (In)",
        // "Qty",
        // "Weight",
        // "Rate",
      ],
    ],
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 8,
      textColor: "#292926",
      fillColor: false,
      halign: "left",
      lineColor: [0, 0, 0], // border color black
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [216, 183, 106],
      textColor: [41, 41, 38],
      halign: "left",
      fontStyle: "bold",
      lineColor: [0, 0, 0], // border color black
      lineWidth: 0.1,
    },
    margin: { left: margin, right: margin },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 5,
    margin: { left: margin },
    tableWidth: pageWidth - margin * 2, // full width
    theme: "grid",

    body: [
      // Row 1
      [
        { content: "Reason For Issue:", styles: { fontStyle: "bold" } },
        accessory.issueReason || "-",
        { content: "Issued By:", styles: { fontStyle: "bold" } },
        accessory.createdBy?.fullName || "-",
      ],
      // Row 2
      [
        { content: "Received By:", styles: { fontStyle: "bold" } },
        accessory.receivedBy || "",
        { content: " Supervisor:", styles: { fontStyle: "bold" } },
        "" || "",
      ],
    ],
    styles: {
      fontSize: 8,
      textColor: "#292926",
      halign: "left",
      valign: "middle",
      fillColor: false,
      lineColor: [0, 0, 0], // border color black
      lineWidth: 0.1,
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

  // Return blob url
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  return blobUrl;
};
