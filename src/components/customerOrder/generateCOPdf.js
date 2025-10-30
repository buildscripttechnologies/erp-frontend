import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBase64ImageFromPDF } from "../../utils/convertPDFPageToImage";
import QRCode from "qrcode";
import { getCompressedImageFromPDF } from "../../utils/imageCompress";

// Terms & Conditions (multi-line string)
const TERMS = `1. I Khodal Bag Pvt. Ltd. submission of the purchase Order is conditioned on Supplier’s agreement that any terms different from or in addition to the terms of the Purchase Order, whether communicated orally or contained in any purchase order confirmation, invoice, acknowledgement, acceptance or other written correspondence, irrespective of the timing, shall not form a part of the Purchase Order, even if Supplier purports to condition its acceptance of the Purchase Order on I Khodal Bag Pvt. Ltd. agreement to such different or additional terms. 
2. Supplier will immediately notify I Khodal Bag Pvt. Ltd. if Supplier’s timely performance under the Purchase Order is delayed or is likely to be delayed. I Khodal Bag Pvt. Ltd.'s acceptance of Supplier’s notice will not constitute I Khodal Bag Pvt. Ltd.'s waiver of any of Supplier’s obligations. 
3. If Supplier delivers Work after the Delivery Date, I Khodal Bag Pvt. Ltd. may reject such Work. 
4. Supplier will preserve, pack, package and handle the Deliverables and Products so as to protect the Deliverables and Products from loss or damage and in accordance with best commercial practices in the absence of any specifications I Khodal Bag Pvt. Ltd. may provide. 
5. Supplier may not subcontract any of its rights or obligations under the Purchase Order without I Khodal Bag Pvt. Ltd.'s prior written consent. 
6. I Khodal Bag Pvt. Ltd. may terminate this Purchase Order for no reason or for any reason, upon 15 days written notice to Supplier. Upon receipt of notice of such termination, Supplier will inform I Khodal Bag Pvt. Ltd. of the extent to which it has completed performance as of the date of the notice, and Supplier will collect and deliver to I Khodal Bag Pvt. Ltd. whatever Work then exists, I Khodal Bag Pvt. Ltd. will pay Supplier for all Work performed and accepted through the effective date of the termination, provided that I Khodal Bag Pvt. Ltd. will not be obligated to pay any more than the payment that would have become due had Supplier completed and I Khodal Bag Pvt. Ltd. had accepted the Work. I Khodal Bag Pvt. Ltd. will have no further payment obligation in connection with any termination. 
7. Payment credit period is stipulated as within 30 days from the receipt of goods `;

// ✅ SAFE PDF Generator
export const generateCOPdf = async (co = {}, letterpadUrl, companyDetails) => {
  const doc = new jsPDF("portrait", "mm", "a4");
  const margin = 6;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const CONTENT_TOP = 54;

  const colors = {
    gold: [216, 183, 106],
    text: [41, 41, 38],
    white: [255, 255, 255],
  };

  // ---- Letterpad Background ----
  let lpFirstPage = null;
  let lpLastPage = null;

  try {
    lpFirstPage = await getCompressedImageFromPDF(letterpadUrl, 0);
    lpLastPage = await getCompressedImageFromPDF(letterpadUrl, 1);
  } catch (err) {
    console.error("Letterpad load failed:", err);
  }

  const addLetterPad = (isLast = false) => {
    const img = isLast ? lpLastPage : lpFirstPage;
    if (img) {
      doc.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);
    }
  };

  addLetterPad(false);

  // ---- Company & Ship To ----
  autoTable(doc, {
    startY: CONTENT_TOP,
    margin: { left: margin },
    tableWidth: pageWidth - margin * 2,
    theme: "grid",
    head: [
      [
        {
          content: "Company Details",
          colSpan: 2,
          styles: { fontStyle: "bold" },
        },
        { content: "Ship To", colSpan: 2, styles: { fontStyle: "bold" } },
      ],
    ],
    body: [
      [
        {
          content: companyDetails.companyName,
          colSpan: 2,
          styles: { fontStyle: "bold" },
        },
        {
          content: `${co?.party?.customerName || ""} (${
            co?.party?.customerCode || ""
          })`,
          colSpan: 2,
          styles: { fontStyle: "bold" },
        },
      ],
      [
        {
          content:
            companyDetails.warehouses?.[0].address ||
            "132,133,134, ALPINE INDUSTRIAL PARK, NR. CHORYASI TOLL PLAZA, SURAT-394150, GUJARAT, INDIA",
          colSpan: 2,
        },
        { content: co?.party?.address || "", colSpan: 2 },
      ],
      [
        { content: "PAN:", styles: { fontStyle: "bold" } },
        companyDetails.pan,
        { content: "PAN:", styles: { fontStyle: "bold" } },
        co?.party?.pan || "",
      ],
      [
        { content: "GST:", styles: { fontStyle: "bold" } },
        companyDetails.gst,
        { content: "Customer GST:", styles: { fontStyle: "bold" } },
        co?.party?.gst || "",
      ],
      [
        { content: "Payment Terms:", styles: { fontStyle: "bold" } },
        co?.party?.paymentTerms || "",
        { content: "Delivery Date:", styles: { fontStyle: "bold" } },
        new Date(co?.deliveryDate || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      ],
    ],
    styles: {
      fontSize: 9,
      textColor: colors.text,
      valign: "middle",
      fillColor: false,
    },
    headStyles: {
      fillColor: colors.gold,
      textColor: colors.text,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 71 },
      2: { cellWidth: 28 },
      3: { cellWidth: 71 },
    },
  });

  let tableStartY = doc.lastAutoTable.finalY + 10;

  // ---- Product Details ----
  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [["No", "ITEM NAME", "DESCRIPTION", "HSN", "QTY", "RATE", "AMOUNT"]],
    body: [
      [
        "1",
        co?.productName || "",
        co?.product?.description || "",
        co?.hsnOrSac || "",
        co?.orderQty || 0,
        co?.unitD2CRate?.toFixed?.(2) || "0.00",
        co?.totalD2CRate?.toFixed?.(2) || "0.00",
      ],
    ],
    theme: "grid",
    styles: { fontSize: 8, textColor: colors.text, fillColor: false },
    headStyles: {
      fillColor: colors.gold,
      textColor: colors.text,
      fontStyle: "bold",
    },
  });

  let finalY = doc.lastAutoTable.finalY + 5;

  // ---- GST Summary ----
  const gstSummary = getGstSummary(co, co?.party?.state, "GJ");
  const gstRate = co?.product?.gst || 0;
  const summary = gstSummary[gstRate] || {
    igst: 0,
    cgst: 0,
    sgst: 0,
    gstAmount: 0,
  };
  const halfWidth = (pageWidth - margin * 2) / 2;

  autoTable(doc, {
    startY: finalY,
    margin: { left: margin },
    tableWidth: halfWidth,
    head: [["GST Slab", "IGST", "CGST", "SGST"]],
    body: [
      [
        `${gstRate}%`,
        summary?.igst?.toFixed?.(2) || "0.00",
        summary?.cgst?.toFixed?.(2) || "0.00",
        summary?.sgst?.toFixed?.(2) || "0.00",
      ],
    ],
    theme: "grid",
    styles: { fontSize: 8, textColor: colors.text, fillColor: false },
    headStyles: {
      fillColor: colors.gold,
      fontStyle: "bold",
      textColor: colors.text,
    },
  });

  let leftTableY = doc.lastAutoTable.finalY;

  // ---- Amount in Words ----
  const grandTotal = (co?.totalD2CRate || 0) + (summary?.gstAmount || 0);
  autoTable(doc, {
    startY: leftTableY + 3,
    margin: { left: margin },
    tableWidth: halfWidth,
    body: [
      [
        {
          content: `[ Amount in Words: ${toIndianWords(grandTotal)} ]`,
          styles: { fontSize: 10, fontStyle: "bold", fillColor: false },
        },
      ],
    ],
    theme: "plain",
  });
  // ---- Bank Details Box ----
  const bankDetails = companyDetails.bankDetails[0] || {};
  const qrX = margin;
  const qrY = doc.lastAutoTable.finalY;
  const qrSize = 23;
  const boxWidth = (pageWidth - margin * 2) / 2;
  const boxHeight = 28;

  // Draw rectangle box
  doc.setDrawColor(0);
  doc.setLineWidth(0.25);
  doc.rect(qrX, qrY, boxWidth, boxHeight);

  // Left: QR code
  const upiId = bankDetails.upiId || "";
  const amount = grandTotal.toFixed(2);

  // Generate UPI QR content
  const upiQRText = `upi://pay?pa=${upiId}&pn=${companyDetails.companyName}&mc=&tid=&tr=&tn=Payment&am=${amount}&cu=INR`;

  // Generate QR code as Data URL
  const qrDataUrl = await QRCode.toDataURL(upiQRText, {
    margin: 0,
    width: qrSize,
  });

  // Add QR to left side
  doc.addImage(qrDataUrl, "PNG", qrX + 2, qrY + 2, qrSize, qrSize);

  // Right: Bank details text
  const textX = qrX + qrSize + 5;
  const textY = qrY + 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Bank Name: ${bankDetails.bankName || ""}`, textX, textY);
  doc.text(`Branch: ${bankDetails.branch || ""}`, textX, textY + 5);
  doc.text(`IFSC Code: ${bankDetails.ifsc || ""}`, textX, textY + 10);
  doc.text(`Account No: ${bankDetails.accountNo || ""}`, textX, textY + 15);
  doc.text(`UPI ID: ${bankDetails.upiId || ""}`, textX, textY + 20);

  // ---- Totals ----
  autoTable(doc, {
    startY: finalY,
    margin: { left: margin + halfWidth + 5 },
    tableWidth: halfWidth - 5,
    head: [["Description", "Amount"]],
    body: [
      ["Taxable Amount", (co?.totalD2CRate || 0).toFixed(2)],
      ["IGST", summary?.igst?.toFixed?.(2) || "0.00"],
      ["CGST", summary?.cgst?.toFixed?.(2) || "0.00"],
      ["SGST", summary?.sgst?.toFixed?.(2) || "0.00"],
      [
        { content: "Grand Total", styles: { fontStyle: "bold" } },
        { content: grandTotal.toFixed(2), styles: { fontStyle: "bold" } },
      ],
    ],
    theme: "grid",
    styles: { fontSize: 8, textColor: colors.text, fillColor: false },
    headStyles: {
      fillColor: colors.gold,
      fontStyle: "bold",
      textColor: colors.text,
    },
  });

  // // ---- Signature ----
  // let signatureY = Math.max(doc.lastAutoTable.finalY, leftTableY) + 15;
  // addSignatureBlock(doc, pageWidth, pageHeight, signatureY, margin);

  // ---- Terms ----
  doc.addPage();
  addLetterPad(true);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colors.gold);
  doc.text("TERMS & CONDITIONS", margin, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text(TERMS, margin, 21, {
    maxWidth: pageWidth - margin * 2,
    align: "left",
  });

  // addSignatureBlock(doc, pageWidth, pageHeight, 200, margin);

  // ---- Title ----
  doc.setPage(1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...colors.white);
  doc.text(`Invoice - ${co?.invoiceNo || ""}`, pageWidth / 2, CONTENT_TOP - 7, {
    align: "center",
  });

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  return { blob: pdfBlob, url: pdfUrl };
};

// The other helper functions (toIndianWords, getGstSummary, addSignatureBlock, formatAddressWithLines) remain unchanged.

// ✅ Indian Numbering System
const toIndianWords = (num) => {
  if (!Number.isFinite(num)) return "Zero";
  num = Math.round(num);

  if (num === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const numToWords = (n) => {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + numToWords(n % 100) : "")
      );
    return "";
  };

  let result = "";
  const parts = [
    { value: 10000000, label: "Crore" },
    { value: 100000, label: "Lakh" },
    { value: 1000, label: "Thousand" },
    { value: 100, label: "Hundred" },
  ];

  for (const p of parts) {
    const q = Math.floor(num / p.value);
    if (q) {
      result += numToWords(q) + " " + p.label + " ";
      num %= p.value;
    }
  }
  if (num > 0) result += numToWords(num) + " ";
  return result.trim();
};

function formatAddress(vendor) {
  const parts = [];

  if (vendor.address) parts.push(vendor.address);
  if (vendor.city) parts.push(vendor.city);
  if (vendor.state) {
    let stateLine = vendor.state;
    if (vendor.postalCode) stateLine += ` - ${vendor.postalCode}`;
    parts.push(stateLine);
  }
  if (vendor.country) parts.push(vendor.country);

  return parts.join(", ");
}

function formatAddressWithLines(obj = {}) {
  const parts = [];

  if (obj.address) parts.push(obj.address);
  if (obj.city) parts.push(obj.city);

  if (obj.state) {
    let stateLine = obj.state;
    if (obj.pincode || obj.postalCode) {
      stateLine += ` - ${obj.pincode || obj.postalCode}`;
    }
    parts.push(stateLine);
  }

  if (obj.country) parts.push(obj.country);

  // Break into lines
  let lines = parts;

  // Pad to exactly 3 lines
  while (lines.length < 1) {
    lines.push(" ");
  }

  return lines.slice(0, 3).join("\n");
}

function getGstSummary(co, customerState, companyState = "GJ") {
  const summary = {};

  // GST rate for this order
  const gstRate = co?.product?.gst || 0;

  // Calculate GST amount from total rate
  const gstAmount = (co.totalD2CRate * gstRate) / 100;

  // Initialize summary object for this GST slab
  summary[gstRate] = {
    gstRate: gstRate,
    taxable: co.totalD2CRate || 0,
    gstAmount: gstAmount,
    igst: 0,
    cgst: 0,
    sgst: 0,
  };

  // Split GST according to state (intra-state or inter-state)
  if (customerState === companyState) {
    // Intra-state → CGST + SGST
    summary[gstRate].cgst = gstAmount / 2;
    summary[gstRate].sgst = gstAmount / 2;
    summary[gstRate].igst = 0;
  } else {
    // Inter-state → IGST only
    summary[gstRate].igst = gstAmount;
    summary[gstRate].cgst = 0;
    summary[gstRate].sgst = 0;
  }

  return summary;
}

function addSignatureBlock(doc, pageWidth, pageHeight, y, margin = 6) {
  const names = ["", "", "", ""];
  const roles = [
    "Prepared By",
    "Purchase Manager",
    "Authorised Signature",
    "Supplier Signature",
  ];

  const colWidth = (pageWidth - margin * 2) / 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Names row
  names.forEach((n, i) => {
    const x = margin + colWidth * i + colWidth / 2;
    if (n) doc.text(n, x, y, { align: "center" });
  });

  // Lines row
  const lineY = y + 5;
  names.forEach((_, i) => {
    const x1 = margin + colWidth * i + 5;
    const x2 = margin + colWidth * (i + 1) - 5;
    doc.line(x1, lineY, x2, lineY);
  });

  // Roles row
  const roleY = lineY + 6;
  roles.forEach((r, i) => {
    const x = margin + colWidth * i + colWidth / 2;
    doc.text(r, x, roleY, { align: "center" });
  });

  return roleY + 10; // return where it ended
}
