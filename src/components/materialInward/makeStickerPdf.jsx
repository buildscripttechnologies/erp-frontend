// LabelPdf.js
import jsPDF from "jspdf";
import QRCode from "qrcode"; // npm install qrcode

/**
 * Generate a 100 x 65 mm PDF where each page is one label
 * and open the print dialog instead of downloading.
 * @param {Object} stock
 * @param {Array} stock.barcodes - Array of { barcode, qty }
 */
export async function makeLabelPdf(stock) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [100, 65],
  });

  let logoDataUrl = "/images/logo.png";

  for (let index = 0; index < stock.barcodes.length; index++) {
    const barcodeObj = stock.barcodes[index];
    if (index > 0) doc.addPage([100, 65], "landscape");

    const margin = 2;
    const tableWidth = 100 - margin * 2;
    const cellPadding = 1;
    const startX = margin;
    let currentY = margin;

    const drawCell = (x, y, w, h) => {
      doc.rect(x, y, w, h);
    };

    const textInCell = (txt, x, y, bold = false, size = 8) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.text(String(txt ?? ""), x + cellPadding, y + 4);
    };

    const rowH = 5.5;
    const bigRowH = 5.5;
    const bottomRowH = 28;

    drawCell(startX, currentY, 30, rowH);
    textInCell("Party Name", startX, currentY, true);
    drawCell(startX + 30, currentY, tableWidth - 30, rowH);
    textInCell(stock.partyName || "", startX + 30, currentY);
    currentY += rowH;

    drawCell(startX, currentY, 30, bigRowH);
    textInCell("Item Name", startX, currentY, true);
    drawCell(startX + 30, currentY, tableWidth - 30, bigRowH);
    textInCell(stock.itemName || "", startX + 30, currentY);
    currentY += bigRowH;

    drawCell(startX, currentY, 30, bigRowH);
    textInCell("Item Code", startX, currentY, true);
    drawCell(startX + 30, currentY, tableWidth - 30, bigRowH);
    textInCell(stock.skuCode || "", startX + 30, currentY);
    currentY += bigRowH;

    drawCell(startX, currentY, 30, bigRowH);
    textInCell("Item Category", startX, currentY, true);
    drawCell(startX + 30, currentY, tableWidth - 30, bigRowH);
    textInCell(stock.itemCategory || "", startX + 30, currentY);
    currentY += bigRowH;

    drawCell(startX, currentY, 30, bigRowH);
    textInCell("Item Color", startX, currentY, true);
    drawCell(startX + 30, currentY, tableWidth - 30, bigRowH);
    textInCell(stock.itemColor || "", startX + 30, currentY);
    currentY += bigRowH;

    drawCell(startX, currentY, 30, bigRowH);
    textInCell("Item Qty.", startX, currentY, true);
    drawCell(startX + 30, currentY, tableWidth - 30, bigRowH);
    textInCell(barcodeObj.qty || "", startX + 30, currentY);
    currentY += bigRowH;

    // Bottom row: logo + QR code
    drawCell(startX, currentY, 30, bottomRowH);
    drawCell(startX + 30, currentY, tableWidth - 30, bottomRowH);

    // Logo (contain mode)
    if (logoDataUrl) {
      const logoImg = new Image();
      logoImg.src = logoDataUrl;
      await new Promise((res) => (logoImg.onload = res));

      // Convert to grayscale
      const canvas = document.createElement("canvas");
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(logoImg, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // R
        data[i + 1] = avg; // G
        data[i + 2] = avg; // B
      }
      ctx.putImageData(imgData, 0, 0);

      const grayLogoDataUrl = canvas.toDataURL("image/png");

      const logoMaxW = 26;
      const logoMaxH = bottomRowH - 4;
      const logoRatio = Math.min(
        logoMaxW / logoImg.width,
        logoMaxH / logoImg.height
      );
      const logoW = logoImg.width * logoRatio;
      const logoH = logoImg.height * logoRatio;

      doc.addImage(
        grayLogoDataUrl,
        "PNG",
        startX + 2 + (logoMaxW - logoW) / 2,
        currentY + 2 + (logoMaxH - logoH) / 2,
        logoW,
        logoH
      );
    }

    // QR Code (contain mode)
    const qrDataUrl = await QRCode.toDataURL(barcodeObj.barcode, {
      width: 500,
      margin: 1,
    });

    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((res) => (qrImg.onload = res));

    const qrMaxW = tableWidth - 40;
    const qrMaxH = bottomRowH - 8;
    const qrRatio = Math.min(qrMaxW / qrImg.width, qrMaxH / qrImg.height);
    const qrW = qrImg.width * qrRatio;
    const qrH = qrImg.height * qrRatio;

    doc.addImage(
      qrImg,
      "PNG",
      startX + 33 + 2 + (qrMaxW - qrW) / 2,
      currentY + 1 + (qrMaxH - qrH) / 2,
      qrW,
      qrH
    );
    doc.setFontSize(8);
    // Example long text
    // const text = barcodeObj.barcode;
    // Example long text
    const text = barcodeObj.barcode;

    // Max width allowed for wrapping
    const maxWidth = 60;

    // Split into multiple lines
    const splitText = doc.splitTextToSize(text, maxWidth);

    // Page width (for centering)
    const pageWidth = doc.internal.pageSize.getWidth();

    // Starting Y position (just below your QR code)
    let startY = 58.5;

    // Print each line centered
    splitText.forEach((line, i) => {
      const textWidth = doc.getTextWidth(line);
      const x = 35 + (maxWidth - textWidth) / 2; // center within 60 width box
      doc.text(line, x, startY + i * 3); // 8 = line height
    });

    // Now print it — jsPDF will place each line automatically
    // doc.text(splitText, 35, 58.5);
  }

  // Instead of saving, open print dialog
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } else {
    alert("Please allow pop-ups to print labels.");
  }
}
