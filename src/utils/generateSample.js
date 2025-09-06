import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBase64ImageFromPDF } from "./convertPDFPageToImage"; // You need this util
import { calculateRate } from "./calc";
import { capitalize } from "lodash";

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
  doc.setTextColor("black");
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
        capitalize(SampleData.partyName) || "",
        { content: "Product Name:", styles: { fontStyle: "bold" } },
        capitalize(SampleData.product.name) || "",
      ],
      // Row 2
      [
        { content: "Order Qty:", styles: { fontStyle: "bold" } },
        SampleData.orderQty || "",
        { content: "Product Size:", styles: { fontStyle: "bold" } },
        `${SampleData.height ?? 0}  x ${SampleData.width ?? 0} x ${
          SampleData.depth ?? 0
        } (In)` || "",
      ],
      // Row 3
      [
        { content: "Sample No.:", styles: { fontStyle: "bold" } },
        SampleData.sampleNo || "",
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

  const tableBody = (SampleData.productDetails || []).map((item, index) => [
    index + 1,
    item.skuCode || "N/A",
    item.itemName || "N/A",
    capitalize(item.category) || "N/A",
    capitalize(item.partName) || "N/A",
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
  // --- Raw Material Conjunction Table ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize("12");
  doc.setTextColor("#d8b76a");
  doc.text("Raw Material Consumption", margin, doc.lastAutoTable.finalY + 10);

  const mergedRawMaterials = {};
  (SampleData.productDetails || []).forEach((item) => {
    const sku = item.skuCode || "N/A";
    const category = (item.category || "N/A").toLowerCase();
    const qty = Number(item.qty) || 0;
    const width = Number(item.width) || 0;
    const height = Number(item.height) || 0;
    const grams = Number(item.grams) || 0;

    if (!mergedRawMaterials[sku]) {
      mergedRawMaterials[sku] = {
        skuCode: sku,
        itemName: item.itemName || "N/A",
        category: category,
        qty: 0,
        weight: 0,
        attachments: item.attachments || [],
      };
    }

    if (category === "zipper") {
      // total inches = width * qty
      const totalInches = width * qty;
      const totalMeters = totalInches / 39.37;
      mergedRawMaterials[sku].qty += totalMeters; // save in meters
      // mergedRawMaterials[sku].qty += qty;
    } else if (category === "fabric") {
      const pieceWidth = Number(item.width) || 0;
      const pieceHeight = Number(item.height) || 0;
      const qty = Number(item.qty) || 0;
      const panno = Number(item.panno) || 0;

      if (pieceWidth && pieceHeight && qty && panno) {
        // --- Orientation A ---
        const perRowA = Math.floor(panno / pieceWidth);
        const rowsA = perRowA > 0 ? Math.ceil(qty / perRowA) : Infinity;
        const totalInchesA = rowsA * pieceHeight;

        // --- Orientation B (rotated) ---
        const perRowB = Math.floor(panno / pieceHeight);
        const rowsB = perRowB > 0 ? Math.ceil(qty / perRowB) : Infinity;
        const totalInchesB = rowsB * pieceWidth;

        // pick better (smaller total inches)
        const bestInches = Math.min(totalInchesA, totalInchesB);

        const totalMeters = bestInches / 39.37;
        mergedRawMaterials[sku].qty += totalMeters; // in meters
      }
    } else if (["plastic", "non woven", "ld cord"].includes(category)) {
      // grams -> kg
      mergedRawMaterials[sku].weight += grams / 1000;
      mergedRawMaterials[sku].qty += qty;
    } else if (
      [
        "slider",
        "bidding",
        "adjuster",
        "buckel",
        "dkadi",
        "accessories",
      ].includes(category)
    ) {
      // only qty
      mergedRawMaterials[sku].qty += qty;
    } else {
      // fallback
      mergedRawMaterials[sku].qty += qty;
    }
  });

  // Build table rows
  const rawMatTableBody = Object.values(mergedRawMaterials).map(
    (item, index) => {
      let weightDisplay = "N/A";
      let qtyDisplay = "N/A";

      if (["plastic", "non woven", "ld cord"].includes(item.category))
        weightDisplay = `${item.weight.toFixed(2)} kg`;

      if (["zipper", "fabric", "canvas", "cotton"].includes(item.category)) {
        qtyDisplay = `${Number(item.qty).toFixed(2)} m`;
      } else if (["plastic", "non woven", "ld cord"].includes(item.category)) {
        qtyDisplay = "N/A";
      } else if (
        [
          "slider",
          "bidding",
          "adjuster",
          "buckel",
          "dkadi",
          "accessories",
        ].includes(item.category)
      ) {
        qtyDisplay = item.qty;
      }
      return [
        index + 1,
        item.skuCode,
        item.itemName,
        capitalize(item.category),
        weightDisplay,
        qtyDisplay,
      ];
    }
  );

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    head: [["S. No.", "SKU Code", "Item Name", "Category", "Weight", "Qty"]],
    body: rawMatTableBody,
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

  // --- Always Last Page for Images ---
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

  // Utility to add images in "contain" style
  const addContainImage = (doc, img, x, y, boxSize) =>
    new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const ratio = Math.min(boxSize / image.width, boxSize / image.height);
        const displayWidth = image.width * ratio;
        const displayHeight = image.height * ratio;

        const offsetX = x + (boxSize - displayWidth) / 2;
        const offsetY = y + (boxSize - displayHeight) / 2;

        doc.addImage(img, "PNG", offsetX, offsetY, displayWidth, displayHeight);
        resolve();
      };
      image.src = img;
    });

  // --- STEP 1: Render BOM Files ---
  if (SampleData.file && SampleData.file.length > 0) {
    for (const f of SampleData.file) {
      try {
        const img = await fetch(f.fileUrl)
          .then((res) => res.blob())
          .then(
            (blob) =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              })
          );

        await addContainImage(doc, img, x, y, imageSize);

        doc.setFontSize(8);
        doc.setTextColor("#000000");
        doc.text(
          `${SampleData.sampleNo}`,
          x + imageSize / 2,
          y + imageSize + 5,
          {
            align: "center",
          }
        );

        // update cursor
        x += imageSize + padding;
        if (x + imageSize > pageWidth - margin) {
          x = startX;
          y += imageSize + 20;
        }

        if (y + imageSize > pageHeight - margin) {
          doc.addPage();
          addBackground("last");
          x = startX;
          y = startY;
        }
      } catch (err) {
        console.error("BOM file load error:", f.fileUrl, err);
      }
    }
  }

  // --- STEP 2: Then render productDetails attachments ---
  const attachmentMap = new Map();
  (SampleData.productDetails || []).forEach((pd) => {
    if (pd.skuCode && pd.attachments && pd.attachments.length > 0) {
      attachmentMap.set(pd.skuCode, pd.attachments);
    }
  });

  // ensure unique items
  const uniqueItems = [];
  const seen = new Set();
  (SampleData.consumptionTable || []).forEach((item) => {
    if (!seen.has(item.skuCode)) {
      seen.add(item.skuCode);
      uniqueItems.push(item);
    }
  });

  for (const item of uniqueItems) {
    const attachments = attachmentMap.get(item.skuCode) || [];
    for (const att of attachments) {
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

        await addContainImage(doc, img, x, y, imageSize);

        doc.setFontSize(8);
        doc.setTextColor("#000000");
        doc.text(item.skuCode || "N/A", x + imageSize / 2, y + imageSize + 5, {
          align: "center",
        });

        x += imageSize + padding;
        if (x + imageSize > pageWidth - margin) {
          x = startX;
          y += imageSize + 20;
        }

        if (y + imageSize > pageHeight - margin) {
          doc.addPage();
          addBackground("last");
          x = startX;
          y = startY;
        }
      } catch (err) {
        console.error("Attachment load error:", att.fileUrl, err);
      }
    }
  }

  // Return blob url
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  return blobUrl;
};
