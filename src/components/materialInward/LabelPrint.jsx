// // LabelPdf.js
// import jsPDF from "jspdf";
// import QRCode from "qrcode";

// // We no longer need the complex getGrayscaleLogoDataUrl helper
// // if the logo is provided as a pre-processed Base64 string.
// // If your logo is small, you can define it here directly.

// const LOGO_BASE64_URL = "/images/logo.png"; // Placeholder: Ideally, this is a Base64 string.

// /**
//  * Generate a 100 x 65 mm PDF where each page is one label
//  * and open the print dialog instead of downloading.
//  * @param {Object} stock
//  * @param {Array} stock.barcodes - Array of { barcode, qty }
//  */
// export async function makeLabelPdf(stock) {
//   const { barcodes, partyName, itemName, skuCode, itemCategory, itemColor } =
//     stock;

//   // Set the compression option (affects all images added via addImage)
//   const doc = new jsPDF({
//     orientation: "landscape",
//     unit: "mm",
//     format: [100, 65],
//     // 💡 OPTIMIZATION 1: Use 'FAST' or 'MEDIUM' compression if available (depends on jsPDF version)
//     // Note: 'compress: true' is the classic option.
//     compress: true,
//   });

//   // --- Constants for Label Layout ---
//   const MARGIN = 2;
//   const TABLE_WIDTH = 100 - MARGIN * 2;
//   const CELL_PADDING = 1;
//   const START_X = MARGIN;
//   const ROW_H = 5.5;
//   const BOTTOM_ROW_H = 28;
//   const LOGO_MAX_W = 26;
//   const LOGO_MAX_H = BOTTOM_ROW_H - 4;
//   const QR_MAX_W = TABLE_WIDTH - 40;
//   const QR_MAX_H = BOTTOM_ROW_H - 8;

//   // Note: For best speed, load the logo once outside the function and pass it as a Base64 string
//   const logoDataUrl = LOGO_BASE64_URL; // Using the provided URL as data source for simplicity

//   /** * Helper to draw a standard key-value row. (Unchanged for clarity) */
//   const drawDataRow = (key, value, currentY) => {
//     // ... (unchanged logic)
//     doc.rect(START_X, currentY, 30, ROW_H);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(8);
//     doc.text(String(key || ""), START_X + CELL_PADDING, currentY + 4);

//     doc.rect(START_X + 30, currentY, TABLE_WIDTH - 30, ROW_H);
//     doc.setFont("helvetica", "normal");
//     doc.text(String(value || ""), START_X + 30 + CELL_PADDING, currentY + 4);

//     return currentY + ROW_H;
//   };

//   // --- Main Loop for Labels ---
//   for (let index = 0; index < barcodes.length; index++) {
//     const barcodeObj = barcodes[index];
//     if (index > 0) doc.addPage([100, 65], "landscape");

//     let currentY = MARGIN;

//     // Use the helper for all standard rows
//     currentY = drawDataRow("Party Name", partyName, currentY);
//     currentY = drawDataRow("Item Name", itemName, currentY);
//     currentY = drawDataRow("Item Code", skuCode, currentY);
//     currentY = drawDataRow("Item Category", itemCategory, currentY);
//     currentY = drawDataRow("Item Color", itemColor, currentY);
//     currentY = drawDataRow("Item Qty.", barcodeObj.qty, currentY);

//     // --- Bottom Row: Logo + QR Code ---
//     doc.rect(START_X, currentY, 30, BOTTOM_ROW_H);
//     doc.rect(START_X + 30, currentY, TABLE_WIDTH - 30, BOTTOM_ROW_H);

//     // Logo
//     if (logoDataUrl) {
//       // For speed, let's load the image data once if possible
//       const logoImg = new Image();
//       logoImg.src = logoDataUrl;
//       await new Promise((res) => (logoImg.onload = res));

//       const logoRatio = Math.min(
//         LOGO_MAX_W / logoImg.width,
//         LOGO_MAX_H / logoImg.height
//       );
//       const logoW = logoImg.width * logoRatio;
//       const logoH = logoImg.height * logoRatio;

//       // 💡 OPTIMIZATION 2: Directly use the Base64/URL. jsPDF compression is now active.
//       // We rely on the *source* logo being black & white PNG for quality.
//       doc.addImage(
//         logoDataUrl,
//         "PNG",
//         START_X + 2 + (LOGO_MAX_W - logoW) / 2,
//         currentY + 2 + (LOGO_MAX_H - logoH) / 2,
//         logoW,
//         logoH
//       );
//     }

//     // QR Code
//     // 💡 OPTIMIZATION 3: Significantly reduced resolution for file size
//     const qrDataUrl = await QRCode.toDataURL(barcodeObj.barcode, {
//       width: 300, // Reduced from 500 for massive size saving
//       margin: 1,
//     });

//     const qrImg = new Image();
//     qrImg.src = qrDataUrl;
//     await new Promise((res) => (qrImg.onload = res));

//     const qrRatio = Math.min(QR_MAX_W / qrImg.width, QR_MAX_H / qrImg.height);
//     const qrW = qrImg.width * qrRatio;
//     const qrH = qrImg.height * qrRatio;

//     // QR codes are black and white, so PNG (with internal jsPDF compression) is best for quality.
//     doc.addImage(
//       qrDataUrl,
//       "PNG",
//       START_X + 33 + 2 + (QR_MAX_W - qrW) / 2,
//       currentY + 1 + (QR_MAX_H - qrH) / 2,
//       qrW,
//       qrH
//     );

//     // Barcode Text Centered (unchanged)
//     const text = barcodeObj.barcode;
//     const MAX_WIDTH = 60;
//     const startY = 58.5;

//     doc.setFontSize(8);
//     const splitText = doc.splitTextToSize(text, MAX_WIDTH);

//     splitText.forEach((line, i) => {
//       const textWidth = doc.getTextWidth(line);
//       const x = START_X + 30 + (TABLE_WIDTH - 30 - textWidth) / 2;
//       doc.text(line, x, startY + i * 3);
//     });
//   }

//   // --- Print/Output Logic ---
//   const fileName = `${stock.skuCode || "labels"}_${new Date()
//     .toISOString()
//     .slice(0, 10)}.pdf`;

//   const blob = doc.output("blob");
//   const blobUrl = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = blobUrl;
//   a.download = fileName;
//   console.log(`✅ Final PDF size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

//   const win = window.open(blobUrl);
//   if (win) {
//     win.onload = () => {
//       win.document.title = fileName;
//       win.print();
//     };
//   } else {
//     alert("Enable pop-ups to print labels.");
//   }
// }
