// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { getBase64ImageFromPDF } from "../../utils/convertPDFPageToImage";

// // Terms & Conditions (multi-line string)
// const TERMS = `TERMS and CONDITIONS 
// 1. IKhodal submission of the purchase Order is conditioned on Supplier’s agreement that any terms different from or in addition to the terms of the Purchase Order, whether communicated orally or contained in any purchase order confirmation, invoice, acknowledgement, acceptance or other written correspondence, irrespective of the timing, shall not form a part of the Purchase Order, even if Supplier purports to condition its acceptance of the Purchase Order on IKhodal agreement to such different or additional terms. 
// 2. Supplier will immediately notify IKhodal if Supplier’s timely performance under the Purchase Order is delayed or is likely to be delayed. IKhodal's acceptance of Supplier’s notice will not constitute IKhodal's waiver of any of Supplier’s obligations. 
// 3. If Supplier delivers Work after the Delivery Date, IKhodal may reject such Work. 
// 4. Supplier will preserve, pack, package and handle the Deliverables and Products so as to protect the Deliverables and Products from loss or damage and in accordance with best commercial practices in the absence of any specifications IKhodal may provide. 
// 5. Supplier may not subcontract any of its rights or obligations under the Purchase Order without IKhodal's prior written consent. 
// 6. IKhodal may terminate this Purchase Order for no reason or for any reason, upon 15 days written notice to Supplier. Upon receipt of notice of such termination, Supplier will inform IKhodal of the extent to which it has completed performance as of the date of the notice, and Supplier will collect and deliver to IKhodal whatever Work then exists, IKhodal will pay Supplier for all Work performed and accepted through the effective date of the termination, provided that IKhodal will not be obligated to pay any more than the payment that would have become due had Supplier completed and IKhodal had accepted the Work. IKhodal will have no further payment obligation in connection with any termination. 
// 7. Payment credit period is stipulated as within 30 days from the receipt of goods `;

// export const generateLPPO = async (po) => {
//   const doc = new jsPDF("portrait", "mm", "a4");
//   const margin = 6;
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();

//   // Content should always start at this Y on table pages
//   const CONTENT_TOP = 54; // <- as requested

//   // Colors
//   const colors = {
//     gold: [216, 183, 106],
//     text: [41, 41, 38],
//     white: [255, 255, 255],
//   };

//   // Letterpad image
//   const lpFirstPage = await getBase64ImageFromPDF("/lp2.pdf", 0);
//   const lpLastPage = await getBase64ImageFromPDF("/lp2.pdf", 1);

//   const addLetterPad = (isLast = false) => {
//     const img = isLast ? lpLastPage : lpFirstPage;
//     doc.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);
//   };

//   // ---------- 1) PRE-MEASURE VENDOR/PO BLOCK (no drawing yet) ----------
//   // We’ll reserve vertical space on page 1 so the table never overlaps it.
//   const details = [
//     ["Vendor Name : ", po.vendor.vendorName || ""],
//     ["Vendor Code : ", po.vendor.venderCode || ""],
//     [
//       "Address : ",
//       `${po.vendor.address || ""}, ${po.vendor.city || ""}, ${
//         po.vendor.state || ""
//       } - ${po.vendor.postalCode || ""}`,
//     ],
//     ["PAN : ", po.vendor.pan || ""],
//     ["GST : ", po.vendor.gst || ""],
//     ["PO No. : ", po.poNo || ""],
//     [
//       "Date : ",
//       new Date(po.date || Date.now()).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       }),
//     ],
//     [
//       "Delivery Date : ",
//       new Date(po.deliveryDate || Date.now()).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       }),
//     ],
//     [
//       "Expiry Date : ",
//       new Date(po.expiryDate || Date.now()).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       }),
//     ],
//     ["Price Terms : ", po.vendor.priceTerms || ""],
//     ["Payment Terms : ", po.vendor.paymentTerms || ""],
//     ["Address : ", po.vendor.paymentTerms || ""],
//   ];
//   const half = Math.ceil(details.length / 2);
//   const leftDetails = details.slice(0, half);
//   const rightDetails = details.slice(half);

//   const lineH = 6;
//   const vendorStartY = CONTENT_TOP + 2; // a tiny gap below the top content line

//   // measure: how far down vendor block will go
//   const measureBlock = () => {
//     let leftY = vendorStartY;
//     let rightY = vendorStartY;

//     const measureOne = (label, value, maxWidth) => {
//       const labelText = `${label} `;
//       const labelWidth = doc.getTextWidth(labelText);
//       const usable = Math.max(10, maxWidth - labelWidth - 2);
//       const wrapped = doc.splitTextToSize(value || "", usable);
//       return wrapped.length;
//     };

//     const colWidth = pageWidth / 2 - margin * 2;

//     leftDetails.forEach(([label, value]) => {
//       const lines = measureOne(label, value, colWidth);
//       leftY += lines * lineH;
//     });
//     rightDetails.forEach(([label, value]) => {
//       const lines = measureOne(label, value, colWidth);
//       rightY += lines * lineH;
//     });

//     return Math.max(leftY, rightY);
//   };

//   const vendorEndY = measureBlock();
//   const tableStartYFirstPage = vendorEndY + 10; // space between vendor block and table
//   const productHeadingY = vendorEndY + 5; // "Product Details" label position (above table)

//   // ---------- 2) DRAW THE TABLE (with letterpad under it on each page) ----------
//   // Uppercase table head + body
//   const head = [
//     [
//       "No",
//       "SKU CODE",
//       "NAME",
//       "DESCRIPTION",
//       "CATEGORY",

//       "HSN",

//       "QTY",
//       "UOM",
//       "RATE",
//       "AMOUNT",
//     ],
//   ];

//   const body = (po.items || []).map((item, idx) => [
//     String(idx + 1).toUpperCase(),
//     (item.item?.skuCode || "").toUpperCase(),
//     (item.item?.itemName || "").toUpperCase(),
//     (item.item?.description || "").toUpperCase(),
//     (item.item?.itemCategory || "").toUpperCase(),

//     (item.item?.hsnOrSac || "").toUpperCase(),

//     String(item.orderQty || 0).toUpperCase(),
//     (item.item?.purchaseUOM?.unitName || "").toUpperCase(),
//     String(item.rate || 0).toUpperCase(),
//     String(item.amount || 0).toUpperCase(),
//   ]);

//   autoTable(doc, {
//     startY: tableStartYFirstPage, // reserve vendor area on page 1
//     margin: { top: CONTENT_TOP, left: margin, right: margin }, // subsequent pages start at y=54
//     head,
//     body,
//     theme: "grid",
//     styles: {
//       fontSize: 7,
//       textColor: colors.text,
//       halign: "left",
//       fillColor: false,
//       valign: "top",
//     },
//     bodyStyles: { fillColor: false },
//     headStyles: {
//       fillColor: colors.gold,
//       textColor: colors.text,
//       halign: "left",
//       fontStyle: "bold",
//       lineColor: colors.gold,
//       lineWidth: 0.1,
//     },
//     willDrawPage: (data) => {
//       if (data.pageNumber === 1) {
//         addLetterPad(false); // first page
//       } else {
//         addLetterPad(false); // middle pages also use first page template
//       }
//     },
//   });

//   // Where table ended on the LAST page
//   const finalY =
//     (doc.lastAutoTable && doc.lastAutoTable.finalY) || CONTENT_TOP + 35;

//   // ---------- 3) DRAW TOTALS + AMOUNT IN WORDS (on the last page) ----------
//   const totalAmount = (po.items || []).reduce(
//     (sum, item) => sum + (item.amount || 0),
//     0
//   );
//   const totalTax = (po.items || []).reduce(
//     (sum, item) => sum + ((item.amount || 0) * (item.item?.gst || 0)) / 100,
//     0
//   );
//   const totalAfterTax = totalAmount + totalTax;

//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.setTextColor(...colors.text);

//   let cursorY = finalY + 7;
//   const rightX = pageWidth - margin - 60;

//   doc.text(`Gross Total: ${totalAmount.toFixed(2)}`, rightX, cursorY);
//   cursorY += 5;
//   doc.text(`Total Tax: ${totalTax.toFixed(2)}`, rightX, cursorY);
//   cursorY += 5;
//   doc.text(
//     `Total Amount (After Tax): ${totalAfterTax.toFixed(2)}`,
//     rightX,
//     cursorY
//   );

//   // Amount in Words (left side)
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(9);
//   const amountWords = `[Rs: ${toIndianWords(
//     totalAfterTax
//   ).toUpperCase()} Only]`;
//   doc.text(amountWords, margin, finalY + 23);

//   // ---------- 4) TERMS & CONDITIONS (continue on last page, or add a new page) ----------
//   doc.addPage();
//   addLetterPad(true); // second page design
//   let termsY = 15;
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(12);
//   doc.setTextColor(...colors.gold);
//   doc.text("TERMS & CONDITIONS", margin, termsY);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
//   doc.setTextColor(...colors.text);
//   doc.text(TERMS, margin, termsY + 6, {
//     maxWidth: pageWidth - margin * 2,
//     align: "left",
//   });

//   // ---------- 5) GO BACK TO PAGE 1 AND DRAW TITLE + VENDOR/PO DETAILS ----------
//   doc.setPage(1);

//   // Title (white on the letterpad’s banner)
//   doc.setTextColor(...colors.white);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(14);
//   doc.text(`${po.poNo} Details`, pageWidth / 2, CONTENT_TOP - 7, {
//     align: "center",
//   }); // around y≈47 if CONTENT_TOP=54

//   // Vendor label/value helper (now actually draws)
//   const printDetail = (label, value, x, y, maxWidth) => {
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(...colors.text);
//     doc.setFontSize(10);

//     // Draw label
//     doc.text(label, x, y);

//     // Measure label width
//     const labelWidth = doc.getTextWidth(label);

//     // Draw value immediately after
//     doc.setFont("helvetica", "normal");
//     const wrappedText = doc.splitTextToSize(
//       value || "",
//       maxWidth - labelWidth - 2
//     );
//     doc.text(wrappedText, x + labelWidth, y);

//     return wrappedText.length;
//   };

//   // Draw the two-column vendor block exactly into the reserved area
//   const colWidth = pageWidth / 2 - margin * 2;
//   let leftY = vendorStartY;
//   let rightY = vendorStartY;

//   console.log("leftY", leftY);

//   leftDetails.forEach(([label, value]) => {
//     const lines = printDetail(label, value, margin, leftY, colWidth);
//     leftY += lines * lineH;
//   });
//   rightDetails.forEach(([label, value]) => {
//     const lines = printDetail(
//       label,
//       value,
//       pageWidth / 2 + margin,
//       rightY,
//       colWidth
//     );
//     rightY += lines * lineH;
//   });

//   // Optional heading above the table on page 1 (drawn after table but placed above it)
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(12);
//   doc.setTextColor(...colors.gold);
//   doc.text("Product Details", margin, productHeadingY);

//   // ---------- 6) OUTPUT ----------
//   const pdfBlob = doc.output("blob");
//   const pdfUrl = URL.createObjectURL(pdfBlob);
//   // window.open(pdfUrl, "_blank");
//   return { blob: pdfBlob, url: pdfUrl };
// };

// // ✅ Indian Numbering System
// const toIndianWords = (num) => {
//   if (!Number.isFinite(num)) return "Zero";
//   num = Math.round(num);

//   if (num === 0) return "Zero";

//   const ones = [
//     "",
//     "One",
//     "Two",
//     "Three",
//     "Four",
//     "Five",
//     "Six",
//     "Seven",
//     "Eight",
//     "Nine",
//     "Ten",
//     "Eleven",
//     "Twelve",
//     "Thirteen",
//     "Fourteen",
//     "Fifteen",
//     "Sixteen",
//     "Seventeen",
//     "Eighteen",
//     "Nineteen",
//   ];
//   const tens = [
//     "",
//     "",
//     "Twenty",
//     "Thirty",
//     "Forty",
//     "Fifty",
//     "Sixty",
//     "Seventy",
//     "Eighty",
//     "Ninety",
//   ];

//   const numToWords = (n) => {
//     if (n < 20) return ones[n];
//     if (n < 100)
//       return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
//     if (n < 1000)
//       return (
//         ones[Math.floor(n / 100)] +
//         " Hundred" +
//         (n % 100 ? " " + numToWords(n % 100) : "")
//       );
//     return "";
//   };

//   let result = "";
//   const parts = [
//     { value: 10000000, label: "Crore" },
//     { value: 100000, label: "Lakh" },
//     { value: 1000, label: "Thousand" },
//     { value: 100, label: "Hundred" },
//   ];

//   for (const p of parts) {
//     const q = Math.floor(num / p.value);
//     if (q) {
//       result += numToWords(q) + " " + p.label + " ";
//       num %= p.value;
//     }
//   }
//   if (num > 0) result += numToWords(num) + " ";
//   return result.trim();
// };
