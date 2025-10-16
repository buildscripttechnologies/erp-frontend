// LabelPdf.js
import jsPDF from "jspdf";
import QRCode from "qrcode";

const LOGO_DATA_URL = "/images/logo.png"; // Source logo URL

// --- Helper Function for Grayscale Conversion ---

/** * Converts image data to grayscale on a canvas with a white background
 * and returns the data URL.
 */
async function getGrayscaleLogoDataUrl(logoUrl) {
  if (!logoUrl) return null;

  const logoImg = new Image();
  logoImg.src = logoUrl;
  await new Promise((res) => (logoImg.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = logoImg.width;
  canvas.height = logoImg.height;
  const ctx = canvas.getContext("2d");

  // 1. FIX: Fill canvas with white to prevent black background from transparency
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw the image
  ctx.drawImage(logoImg, 0, 0);

  // 3. Grayscale conversion
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  ctx.putImageData(imgData, 0, 0);

  // Return PNG. jsPDF will handle compression and color space when we add it.
  return canvas.toDataURL("image/png");
}

// --- Main Function ---

export async function makeLabelPdf(stock) {
  const { barcodes, partyName, itemName, skuCode, itemCategory, itemColor } =
    stock;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [100, 65],
    compress: true, // Keep the compression enabled for size reduction
  });

  // --- Constants for Label Layout ---
  const MARGIN = 2;
  const TABLE_WIDTH = 100 - MARGIN * 2;
  const CELL_PADDING = 1;
  const START_X = MARGIN;
  const ROW_H = 5.5;
  const BOTTOM_ROW_H = 28;
  const LOGO_MAX_W = 26;
  const LOGO_MAX_H = BOTTOM_ROW_H - 4;
  const QR_MAX_W = TABLE_WIDTH - 40;
  const QR_MAX_H = BOTTOM_ROW_H - 8;

  // Pre-load the grayscale logo data URL ONCE before the loop
  const grayLogoDataUrl = await getGrayscaleLogoDataUrl(LOGO_DATA_URL);

  // ... (drawDataRow helper function remains unchanged)
  const drawDataRow = (key, value, currentY) => {
    // ... (unchanged logic)
    doc.rect(START_X, currentY, 30, ROW_H);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(String(key || ""), START_X + CELL_PADDING, currentY + 4);

    doc.rect(START_X + 30, currentY, TABLE_WIDTH - 30, ROW_H);
    doc.setFont("helvetica", "normal");
    doc.text(String(value || ""), START_X + 30 + CELL_PADDING, currentY + 4);

    return currentY + ROW_H;
  };

  // --- Main Loop for Labels ---
  for (let index = 0; index < barcodes.length; index++) {
    const barcodeObj = barcodes[index];
    if (index > 0) doc.addPage([100, 65], "landscape");

    let currentY = MARGIN;

    // Use the helper for all standard rows
    currentY = drawDataRow("Party Name", partyName, currentY);
    currentY = drawDataRow("Item Name", itemName, currentY);
    currentY = drawDataRow("Item Code", skuCode, currentY);
    currentY = drawDataRow("Item Category", itemCategory, currentY);
    currentY = drawDataRow("Item Color", itemColor, currentY);
    currentY = drawDataRow("Item Qty.", barcodeObj.qty, currentY);

    // --- Bottom Row: Logo + QR Code ---
    doc.rect(START_X, currentY, 30, BOTTOM_ROW_H);
    doc.rect(START_X + 30, currentY, TABLE_WIDTH - 30, BOTTOM_ROW_H);

    // Logo
    if (grayLogoDataUrl) {
      const logoImg = new Image();
      logoImg.src = grayLogoDataUrl;
      await new Promise((res) => (logoImg.onload = res));

      const logoRatio = Math.min(
        LOGO_MAX_W / logoImg.width,
        LOGO_MAX_H / logoImg.height
      );
      const logoW = logoImg.width * logoRatio;
      const logoH = logoImg.height * logoRatio;

      // 💥 FIX: Add image using the pre-calculated grayscale data URL
      // We explicitly tell jsPDF the data is a PNG.
      // The canvas step handled the grayscale and white background.
      doc.addImage(
        grayLogoDataUrl,
        "PNG",
        START_X + 2 + (LOGO_MAX_W - logoW) / 2,
        currentY + 2 + (LOGO_MAX_H - logoH) / 2,
        logoW,
        logoH
      );
    }

    // QR Code (remains optimized for size and quality)
    const qrDataUrl = await QRCode.toDataURL(barcodeObj.barcode, {
      width: 300,
      margin: 1,
    });

    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((res) => (qrImg.onload = res));

    const qrRatio = Math.min(QR_MAX_W / qrImg.width, QR_MAX_H / qrImg.height);
    const qrW = qrImg.width * qrRatio;
    const qrH = qrImg.height * qrRatio;

    doc.addImage(
      qrDataUrl,
      "PNG",
      START_X + 33 + 2 + (QR_MAX_W - qrW) / 2,
      currentY + 1 + (QR_MAX_H - qrH) / 2,
      qrW,
      qrH
    );

    // Barcode Text Centered (unchanged)
    const text = barcodeObj.barcode;
    const MAX_WIDTH = 60;
    const startY = 58.5;

    doc.setFontSize(8);
    const splitText = doc.splitTextToSize(text, MAX_WIDTH);

    splitText.forEach((line, i) => {
      const textWidth = doc.getTextWidth(line);
      const x = START_X + 30 + (TABLE_WIDTH - 30 - textWidth) / 2;
      doc.text(line, x, startY + i * 3);
    });
  }

  // --- Print/Output Logic (unchanged) ---
  const fileName = `${stock.itemName || "labels"}-QR.pdf`;

  const blob = doc.output("blob");
  console.log(`✅ Final PDF size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

  const blobUrl = URL.createObjectURL(blob);
  // ... (rest of print logic)
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `${fileName || "QR.pdf"}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Optional: revoke the URL after a short delay to free memory
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
