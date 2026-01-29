import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBase64ImageFromPDF } from "../../utils/convertPDFPageToImage";
import { getCompressedImageFromPDF } from "../../utils/imageCompress";

// Terms & Conditions (multi-line string)
const TERMS = `1. I Khodal Bag Pvt. Ltd. submission of the purchase Order is conditioned on Supplier’s agreement that any terms different from or in addition to the terms of the Purchase Order, whether communicated orally or contained in any purchase order confirmation, invoice, acknowledgement, acceptance or other written correspondence, irrespective of the timing, shall not form a part of the Purchase Order, even if Supplier purports to condition its acceptance of the Purchase Order on I Khodal Bag Pvt. Ltd. agreement to such different or additional terms. 
2. Supplier will immediately notify I Khodal Bag Pvt. Ltd. if Supplier’s timely performance under the Purchase Order is delayed or is likely to be delayed. I Khodal Bag Pvt. Ltd.'s acceptance of Supplier’s notice will not constitute I Khodal Bag Pvt. Ltd.'s waiver of any of Supplier’s obligations. 
3. If Supplier delivers Work after the Delivery Date, I Khodal Bag Pvt. Ltd. may reject such Work. 
4. Supplier will preserve, pack, package and handle the Deliverables and Products so as to protect the Deliverables and Products from loss or damage and in accordance with best commercial practices in the absence of any specifications I Khodal Bag Pvt. Ltd. may provide. 
5. Supplier may not subcontract any of its rights or obligations under the Purchase Order without I Khodal Bag Pvt. Ltd.'s prior written consent. 
6. I Khodal Bag Pvt. Ltd. may terminate this Purchase Order for no reason or for any reason, upon 15 days written notice to Supplier. Upon receipt of notice of such termination, Supplier will inform I Khodal Bag Pvt. Ltd. of the extent to which it has completed performance as of the date of the notice, and Supplier will collect and deliver to I Khodal Bag Pvt. Ltd. whatever Work then exists, I Khodal Bag Pvt. Ltd. will pay Supplier for all Work performed and accepted through the effective date of the termination, provided that I Khodal Bag Pvt. Ltd. will not be obligated to pay any more than the payment that would have become due had Supplier completed and I Khodal Bag Pvt. Ltd. had accepted the Work. I Khodal Bag Pvt. Ltd. will have no further payment obligation in connection with any termination. 
7. Payment credit period is stipulated as within 30 days from the receipt of goods `;

export const generateLPPO = async (po, letterpadUrl, companyDetails) => {
  const doc = new jsPDF("portrait", "mm", "a4");
  const margin = 6;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // console.log("po",po);

  // Content should always start at this Y on table pages
  const CONTENT_TOP = 54; // <- as requested

  // Colors
  const colors = {
    gold: [216, 183, 106],
    text: [41, 41, 38],
    white: [255, 255, 255],
  };

  // Letterpad image
  const lpFirstPage = await getCompressedImageFromPDF(letterpadUrl, 0);
  const lpLastPage = await getCompressedImageFromPDF(letterpadUrl, 1);

  const addLetterPad = (isLast = false) => {
    const img = isLast ? lpLastPage : lpFirstPage;
    doc.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);
  };

  // ---------- 1) PRE-MEASURE VENDOR/PO BLOCK (no drawing yet) ----------
  // We’ll reserve vertical space on page 1 so the table never overlaps it.
  const vendorDetails = [
    [
      "Vendor Name : ",
      `${po.vendor.vendorName} (${po.vendor.venderCode})` || "",
    ],
    // ["Vendor Code : ", po.vendor.venderCode || ""],
    ["Address : ", formatAddress(po.vendor)],
    ["PAN : ", po.vendor.pan || ""],
    ["GST : ", po.vendor.gst || ""],
    ["Price Terms : ", po.vendor.priceTerms || ""],
    ["Payment Terms : ", po.vendor.paymentTerms || ""],
  ];

  const poDetails = [
    ["PO No. : ", po.poNo || ""],
    [
      "Date : ",
      new Date(po.date || Date.now()).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ],
    [
      "Delivery Date : ",
      new Date(po.deliveryDate || Date.now()).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ],
    [
      "Expiry Date : ",
      new Date(po.expiryDate || Date.now()).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ],
    ["Address : ", po.address || ""],
  ];

  const lineH = 6;
  const vendorStartY = CONTENT_TOP + 2; // a tiny gap below the top content line

  // // measure: how far down vendor block will go
  // const measureBlock = () => {
  //   let leftY = vendorStartY;
  //   let rightY = vendorStartY;

  //   const measureOne = (label, value, maxWidth) => {
  //     const labelText = `${label} `;
  //     const labelWidth = doc.getTextWidth(labelText);
  //     const usable = Math.max(10, maxWidth - labelWidth - 2);
  //     const wrapped = doc.splitTextToSize(value || "", usable);
  //     return wrapped.length;
  //   };

  //   const colWidth = pageWidth / 2 - margin * 2;

  //   vendorDetails.forEach(([label, value]) => {
  //     const lines = measureOne(label, value, colWidth);
  //     leftY += lines * lineH;
  //   });
  //   poDetails.forEach(([label, value]) => {
  //     const lines = measureOne(label, value, colWidth);
  //     rightY += lines * lineH;
  //   });

  //   return Math.max(leftY, rightY);
  // };

  const vendorEndY = 117;
  const tableStartYFirstPage = vendorEndY; // space between vendor block and table
  const productHeadingY = vendorEndY + 5; // "Product Details" label position (above table)

  // ---------- 2) DRAW THE TABLE (with letterpad under it on each page) ----------
  // Uppercase table head + body
  const head = [
    [
      "No",
      "SKU CODE",
      "NAME",
      "DESCRIPTION",
      "CATEGORY",

      "HSN",

      "QTY",
      "UOM",
      "RATE",
      "AMOUNT",
    ],
  ];

  const pos = po.items.filter((i) => i.itemStatus == "approved");

  // console.log("pos", pos);

  const body = (pos || []).map((item, idx) => [
    String(idx + 1).toUpperCase(),
    (item.item?.skuCode || "").toUpperCase(),
    (item.item?.itemName || "").toUpperCase(),
    (item.item?.description || "").toUpperCase(),
    (item.item?.itemCategory || "").toUpperCase(),

    (item.item?.hsnOrSac || "").toUpperCase(),

    String(item.orderQty || 0).toUpperCase(),
    (item.item?.purchaseUOM?.unitName || "").toUpperCase(),
    String(item.rate || 0).toUpperCase(),
    String(item.amount || 0).toUpperCase(),
  ]);

  autoTable(doc, {
    startY: tableStartYFirstPage, // reserve vendor area on page 1
    margin: { top: CONTENT_TOP, left: margin, right: margin }, // subsequent pages start at y=54
    head,
    body,
    theme: "grid",
    styles: {
      fontSize: 7,
      textColor: colors.text,
      halign: "left",
      fillColor: false,
      valign: "top",
    },
    bodyStyles: { fillColor: false },
    headStyles: {
      fillColor: colors.gold,
      textColor: colors.text,
      halign: "left",
      fontStyle: "bold",
      lineColor: colors.gold,
      lineWidth: 0.1,
    },
    willDrawPage: (data) => {
      if (data.pageNumber === 1) {
        addLetterPad(false); // first page
      } else {
        addLetterPad(false); // middle pages also use first page template
      }
    },

    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      if (currentPage < pageCount) {
        doc.setTextColor(...colors.white);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`${po.poNo} Details`, pageWidth / 2, CONTENT_TOP - 7, {
          align: "center",
        });
      }
    },
  });

  // Where table ended on the LAST page
  let finalY =
    (doc.lastAutoTable && doc.lastAutoTable.finalY) || CONTENT_TOP + 35;

  // Estimate how much vertical space GST + Totals will take
  const neededHeight = 45; // rough estimate (GST table + totals + spacing)

  // ✅ Check if there is enough space left on this page
  if (finalY + neededHeight > pageHeight - 25) {
    doc.addPage();
    addLetterPad(false); // same design as inner pages
    finalY = CONTENT_TOP; // reset position for new page
  }

  // ---------- 3) DRAW TOTALS + AMOUNT IN WORDS (on the last page) ----------
  const gstSummary = getGstSummary(pos, po.vendor.state, "GJ");
  const halfWidth = (pageWidth - margin * 2) / 2;
  autoTable(doc, {
    startY: finalY + 3,
    margin: { left: margin },
    tableWidth: halfWidth - 2.5,
    theme: "grid",
    head: [["GST Slab", "IGST", "CGST", "SGST"]],
    body: Object.values(gstSummary).map((slab) => [
      `${slab.gstRate}%`,
      slab.igst.toFixed(2),
      slab.cgst.toFixed(2),
      slab.sgst.toFixed(2),
    ]),
    styles: {
      fontSize: 8,
      textColor: colors.text,
      halign: "left",
      fillColor: false,
      valign: "top",
    },
    bodyStyles: { fillColor: false },
    headStyles: {
      fillColor: colors.gold,
      textColor: colors.text,
      halign: "left",
      fontStyle: "bold",
      lineColor: colors.gold,
      lineWidth: 0.1,
    },
  });

  let leftTableY = doc.lastAutoTable.finalY;

  // add Amount in Words just below GST table

  // add Amount in Words just below GST table
  autoTable(doc, {
    startY: leftTableY,
    margin: { left: margin },
    tableWidth: halfWidth - 2, // restrict to 50%
    body: [
      [
        {
          content: `[ Amount in Words: ${toIndianWords(
            po.totalAmountWithGst
          )} ]`,
          styles: { fontSize: 10, fontStyle: "bold" },
        },
      ],
    ],
    theme: "plain", // no borders if you like
  });

  // right column → Total Amounts
  autoTable(doc, {
    startY: finalY + 3,
    margin: { left: margin + halfWidth + 2.5 },
    tableWidth: halfWidth - 2.5,
    theme: "grid",
    head: [["Description", "Amount"]],
    body: [
      ["Taxable Amount", po.totalAmount.toFixed(2)],
      [
        "IGST",
        Object.values(gstSummary)
          .reduce((s, r) => s + r.igst, 0)
          .toFixed(2),
      ],
      [
        "CGST",
        Object.values(gstSummary)
          .reduce((s, r) => s + r.cgst, 0)
          .toFixed(2),
      ],
      [
        "SGST",
        Object.values(gstSummary)
          .reduce((s, r) => s + r.sgst, 0)
          .toFixed(2),
      ],
      [
        { content: "Grand Total", styles: { fontStyle: "bold" } },
        {
          content: po.totalAmountWithGst.toFixed(2),
          styles: { fontStyle: "bold" },
        },
      ],
    ],
    styles: {
      fontSize: 8,
      textColor: colors.text,
      halign: "left",
      fillColor: false,
      valign: "top",
    },
    bodyStyles: { fillColor: false },
    headStyles: {
      fillColor: colors.gold,
      textColor: colors.text,
      halign: "left",
      fontStyle: "bold",
      lineColor: colors.gold,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 40 },
    },
  });

  // ---------- 3.5) SIGNATURE BLOCK (only on second-last page) ----------
  let signatureHeight = 35; // estimated block height
  let signatureStartY = Math.max(doc.lastAutoTable.finalY, leftTableY);

  // check if it fits before page bottom
  if (signatureStartY + signatureHeight > pageHeight - 25) {
    // not enough space → add a new page (second-last)
    doc.addPage();
    addLetterPad(false);
    signatureStartY = CONTENT_TOP;
  }

  // render signature
  addSignatureBlock(doc, pageWidth, pageHeight, signatureStartY, margin);

  // ---------- 4) TERMS & CONDITIONS (continue on last page, or add a new page) ----------
  doc.addPage();
  addLetterPad(true); // second page design
  let termsY = 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colors.gold);
  doc.text("TERMS & CONDITIONS", margin, termsY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text(TERMS, margin, termsY + 6, {
    maxWidth: pageWidth - margin * 2,
    align: "left",
  });

  addSignatureBlock(doc, pageWidth, pageHeight, termsY + 200, margin);

  // ---------- 5) GO BACK TO PAGE 1 AND DRAW TITLE + VENDOR/PO DETAILS ----------
  doc.setPage(1);

  // Combined Supplier + Ship To block
  autoTable(doc, {
    startY: CONTENT_TOP + 2,
    margin: { left: margin },
    tableWidth: pageWidth - margin * 2, // full width
    theme: "grid",
    head: [
      [
        {
          content: "Supplier Details",
          colSpan: 2,
          styles: { fontStyle: "bold" },
        },
        { content: "Ship To", colSpan: 2, styles: { fontStyle: "bold" } },
      ],
    ],
    body: [
      // Row 1: Supplier Name + Ship To Name
      [
        {
          content: `${po.vendor?.vendorName || ""} (${
            po.vendor?.venderCode || ""
          })`,
          colSpan: 2,
          styles: { fontStyle: "bold" },
        },
        {
          content: companyDetails?.companyName || "I Khodal Bag Pvt. Ltd.",
          colSpan: 2,
          styles: { fontStyle: "bold" },
        },
      ],
      // Row 2: Address block (force 3 lines)
      [
        { content: formatAddressWithLines(po.vendor), colSpan: 2 },
        {
          content: formatAddressWithLines({ address: po.address }),

          colSpan: 2,
        },
      ],
      // Row 3
      [
        { content: "PAN:", styles: { fontStyle: "bold" } },
        po.vendor?.pan || "",
        { content: "PO No:", styles: { fontStyle: "bold" } },
        po.poNo || "",
      ],
      // Row 4
      [
        { content: "GST:", styles: { fontStyle: "bold" } },
        po.vendor?.gst || "",
        { content: "Date:", styles: { fontStyle: "bold" } },
        new Date(po.date || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      ],
      // Row 5
      [
        { content: "Price Terms:", styles: { fontStyle: "bold" } },
        po.vendor?.priceTerms || "",
        { content: "Expiry Date:", styles: { fontStyle: "bold" } },
        new Date(po.expiryDate || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      ],
      // Row 6
      [
        { content: "Payment Terms:", styles: { fontStyle: "bold" } },
        po.vendor?.paymentTerms || "",
        { content: "Delivery Date:", styles: { fontStyle: "bold" } },
        new Date(po.deliveryDate || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      ],
    ],
    styles: {
      fontSize: 9,
      textColor: colors.text,
      halign: "left",
      valign: "middle",
      fillColor: false,
    },
    headStyles: {
      fillColor: colors.gold,
      textColor: colors.text,
      fontStyle: "bold",
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 28 }, // Supplier Label
      1: { cellWidth: 71 }, // Supplier Value
      2: { cellWidth: 28 }, // Ship To Label
      3: { cellWidth: 71 }, // Ship To Value
    },
  });

  const pageCount = doc.getNumberOfPages();

  // Loop through all pages except the last one
  for (let i = 1; i < pageCount; i++) {
    doc.setPage(i);

    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Purchase Order - ${po.poNo}`, pageWidth / 2, CONTENT_TOP - 7, {
      align: "center",
    });
  }

  // ---------- 6) OUTPUT ----------
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  // window.open(pdfUrl, "_blank");
  return { blob: pdfBlob, url: pdfUrl };
};

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
  // while (lines.length < 2) {
  //   lines.push(" ");
  // }

  return lines.slice(0, 3).join(",");
}

function getGstSummary(items, vendorState, companyState = "GJ") {
  const summary = {};

  items.forEach((item) => {
    const gstRate = item.gst;
    if (!summary[gstRate]) {
      summary[gstRate] = { gstRate, taxable: 0, gstAmount: 0 };
    }
    summary[gstRate].taxable += item.amount;
    summary[gstRate].gstAmount += item.gstAmount;
  });

  Object.values(summary).forEach((slab) => {
    if (vendorState === companyState) {
      slab.cgst = slab.gstAmount / 2;
      slab.sgst = slab.gstAmount / 2;
      slab.igst = 0;
    } else {
      slab.igst = slab.gstAmount;
      slab.cgst = 0;
      slab.sgst = 0;
    }
  });

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
