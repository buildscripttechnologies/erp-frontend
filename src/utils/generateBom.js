import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBase64ImageWithSize } from "./convertImageToBase64";

export const generateBom = async (bomData) => {
  const doc = new jsPDF("portrait");
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ✅ Load logo once
  const {
    base64: logoBase64,
    width: logoW,
    height: logoH,
  } = await getBase64ImageWithSize("/images/logo.png", 60, 60); // watermark + top-right
  const {
    base64: watermarkBase64,
    width: wmWidth,
    height: wmHeight,
  } = await getBase64ImageWithSize("/images/logo.png", 100, 100); // adjust max size as needed

  // ✅ Watermark setup (function to reuse on every page)
  const addWatermark = () => {
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    doc.addImage(
      watermarkBase64,
      "PNG",
      (pageWidth - wmWidth) / 2,
      (pageHeight - wmHeight) / 2,
      wmWidth,
      wmHeight
    );
    doc.setGState(new doc.GState({ opacity: 1 }));
  };

  // First page watermark
  addWatermark();

  // Title
  doc.setFontSize(14);
  doc.setTextColor("#d8b76a");
  doc.setFont("helvetica", "bold");
  doc.text(`${bomData.bomNo + " Details"}`, pageWidth / 2, 20, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setTextColor("#000");

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

  let y = 35;
  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`: ${value}`, margin + 27, y);
    y += 7;
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor("#d8b76a");
  doc.text("Product Details", margin, y + 10);

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

    // ✅ Add watermark to every page
    didDrawPage: () => {
      addWatermark();
      doc.addImage(
        logoBase64,
        "PNG",
        pageWidth - logoW - margin,
        margin + 12,
        logoW,
        logoH
      );
    },
  });

  // doc.save(`${bomData.bomNo + "_" + bomData.partyName || "Details"}.pdf`);

  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  return blobUrl;
};
