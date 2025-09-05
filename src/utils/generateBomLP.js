import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBase64ImageFromPDF } from "./convertPDFPageToImage"; // You need this util
import { calculateRate } from "./calc";

export const generateBomLP = async (bomData) => {
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
  doc.setTextColor("black");
  doc.setFont("helvetica", "bold");
  doc.text(`${bomData.bomNo + " Details"}`, pageWidth / 2, 47, {
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
        bomData.partyName || "",
        { content: "Product Name:", styles: { fontStyle: "bold" } },
        bomData.productName || "",
      ],
      // Row 2
      [
        { content: "Order Qty:", styles: { fontStyle: "bold" } },
        bomData.orderQty || "",
        { content: "Product Size:", styles: { fontStyle: "bold" } },
        `${bomData.height ?? 0}  x ${bomData.width ?? 0} x ${
          bomData.depth ?? 0
        } (In)` || "",
      ],
      // Row 3
      [
        { content: "SMP / FG No.:", styles: { fontStyle: "bold" } },
        bomData.sampleNo || "",
        { content: "Date:", styles: { fontStyle: "bold" } },
        new Date(bomData.date || Date.now()).toLocaleDateString("en-GB", {
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
  doc.text("Product Details", margin, y + 30);

  const tableBody = (bomData.productDetails || []).map((item, index) => [
    index + 1,
    item.skuCode || "N/A",
    item.itemName || "N/A",
    item.category || "N/A",
    item.partName || "N/A",
    item.height || "N/A",
    item.width || "N/A",
    item.qty || "N/A",
    item.grams ? `${item.grams / 1000} kg` : "N/A",
    // item.rate || "N/A",
  ]);

  autoTable(doc, {
    startY: y + 32,
    head: [
      [
        "S. No.",
        "SKU Code",
        "Item Name",
        "Category",
        "Part Name",
        "H (In)",
        "W (In)",
        "Qty",
        "Weight",
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

  // --- Raw Material Conjunction Table ---
  // --- Consumption Table ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#d8b76a");
  doc.text(
    "Raw Material Conjunction Table",
    margin,
    doc.lastAutoTable.finalY + 10
  );

  const consumptionBody = (bomData.consumptionTable || []).map(
    (item, index) => [
      index + 1,
      item.skuCode || "N/A",
      item.itemName || "N/A",
      item.category || "N/A",
      item.weight || "N/A",
      item.qty || "N/A",
    ]
  );

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    head: [["S. No.", "SKU Code", "Item Name", "Category", "Weight", "Qty"]],
    body: consumptionBody,
    theme: "grid",
    styles: {
      fontSize: 8,
      textColor: "#292926",
      fillColor: false,
      halign: "left",
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [216, 183, 106],
      textColor: [41, 41, 38],
      halign: "left",
      fontStyle: "bold",
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    margin: { left: margin, right: margin },
  });

  // --- Always Last Page for Images + BOM No ---
  doc.addPage();
  addBackground("last"); // background for last page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#d8b76a");
  doc.text("Material Images", pageWidth / 2, 10, { align: "center" });

  const imageSize = 55; // square size in mm
  const padding = 15;
  const startX = margin;
  const startY = 15;
  let x = startX;
  y = startY;

  // Build a map of skuCode → attachments from productDetails
  const attachmentMap = new Map();
  (bomData.productDetails || []).forEach((pd) => {
    if (pd.skuCode && pd.attachments && pd.attachments.length > 0) {
      attachmentMap.set(pd.skuCode, pd.attachments);
    }
  });

  // Ensure unique SKUs from consumption table
  const uniqueItems = [];
  const seen = new Set();
  (bomData.consumptionTable || []).forEach((item) => {
    if (!seen.has(item.skuCode)) {
      seen.add(item.skuCode);
      uniqueItems.push(item);
    }
  });

  // Render images
  for (const item of uniqueItems) {
    const attachments = attachmentMap.get(item.skuCode) || [];
    if (attachments.length > 0) {
      const att = attachments[0]; // pick first attachment
      try {
        const img = await fetch(att.fileUrl)
          .then((res) => res.blob())
          .then(
            (blob) =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              })
          );

        // Function to add image in "contain" style
        const addContainImage = (doc, img, x, y, boxSize) => {
          return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
              const ratio = Math.min(
                boxSize / image.width,
                boxSize / image.height
              );
              const displayWidth = image.width * ratio;
              const displayHeight = image.height * ratio;

              const offsetX = x + (boxSize - displayWidth) / 2;
              const offsetY = y + (boxSize - displayHeight) / 2;

              doc.addImage(
                img,
                "PNG",
                offsetX,
                offsetY,
                displayWidth,
                displayHeight
              );
              resolve();
            };
            image.src = img;
          });
        };

        // Add image
        await addContainImage(doc, img, x, y, imageSize);

        // Add SKU Code below image
        doc.setFontSize(8);
        doc.setTextColor("#000000");
        doc.text(item.skuCode || "N/A", x + imageSize / 2, y + imageSize + 5, {
          align: "center",
        });

        // Update cursor
        x += imageSize + padding;
        if (x + imageSize > pageWidth - margin) {
          x = startX;
          y += imageSize + 20; // move to next row
        }

        // If row doesn't fit on page → add new page
        if (y + imageSize > pageHeight - margin) {
          doc.addPage();
          addBackground("last");
          doc.setTextColor("white");
          doc.text(`${bomData.bomNo}`, pageWidth / 2, 47, { align: "center" });

          // reset cursor
          x = startX;
          y = startY;
        }
      } catch (err) {
        console.error("Image load error:", att.fileUrl, err);
      }
    }
  }

  // Return blob url
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  return blobUrl;
};
