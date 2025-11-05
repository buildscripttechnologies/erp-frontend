import jsPDF from "jspdf";
import { getBase64ImageFromPDF } from "../../../utils/convertPDFPageToImage";

/**
 * Generate A4 envelope print with address positioned for tri-fold window alignment.
 * @param {Object} data - Envelope data (customerName, address, city, state, postalCode, country)
 * @param {String} designPdfPath - Optional background PDF design (default: /env.pdf)
 */
export const generateEnvelopePdf = async (data = {}, designPdfPath = "") => {
  const {
    customerName = "",
    address = "",
    city = "",
    state = "",
    postalCode = "",
    country = "",
  } = data;

  // --- Step 1: Setup jsPDF for Portrait A4 ---
  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm

  // --- Step 2: Add optional background (full A4) ---
  try {
    const bgImage = await getBase64ImageFromPDF(designPdfPath, 0);
    if (bgImage) {
      const img = new Image();
      img.src = bgImage;
      await new Promise((resolve) => {
        img.onload = () => {
          const ratio = Math.min(
            pageWidth / img.width,
            pageHeight / img.height
          );
          const drawW = img.width * ratio;
          const drawH = img.height * ratio;
          const offsetX = (pageWidth - drawW) / 2;
          const offsetY = 0; // no space at top
          doc.addImage(bgImage, "PNG", offsetX, offsetY, drawW, drawH);
          resolve();
        };
      });
    }
  } catch (err) {
    console.warn("⚠️ Envelope design background not loaded:", err);
  }

  // --- Step 3: Define fold and address area ---
  // A4 height = 297mm → each fold = ~99mm high
  // Typically, the address window is visible in the middle fold section
  const foldHeight = 27;
  const addressStartY = foldHeight; // adjust 25mm below first fold line

  // --- Step 4: Add customer details in window zone ---
  const textX = 107; // left margin (adjust as needed)
  const textY = addressStartY;
  const lineHeight = 4.2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(customerName.toUpperCase(), textX, textY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const fullAddress = [address, city, `${state} - ${postalCode}`, country]
    .filter(Boolean)
    .join(", ");
  const addressLines = doc.splitTextToSize(fullAddress, 90);
  addressLines.forEach((line, i) => {
    doc.text(line, textX, textY + (i + 1) * lineHeight);
  });

  // --- Step 5: Optional fold markers (for debugging / alignment) ---
  // Uncomment these lines while testing:
  // doc.setDrawColor(200, 0, 0);
  // doc.line(0, foldHeight, pageWidth, foldHeight); // 1st fold
  // doc.line(0, foldHeight * 2, pageWidth, foldHeight * 2); // 2nd fold

  // --- Step 6: Return blob & URL ---
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  return { blob, url };
};
export const generateEnvelopePdfWithoutBG = async (
  data = {},
  designPdfPath = ""
) => {
  const {
    customerName = "",
    address = "",
    city = "",
    state = "",
    postalCode = "",
    country = "",
  } = data;

  // --- Step 1: Setup jsPDF for Portrait A4 ---
  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm

  // --- Step 2: Add optional background (full A4) ---
  //   try {
  //     const bgImage = await getBase64ImageFromPDF(designPdfPath, 0);
  //     if (bgImage) {
  //       const img = new Image();
  //       img.src = bgImage;
  //       await new Promise((resolve) => {
  //         img.onload = () => {
  //           const ratio = Math.min(
  //             pageWidth / img.width,
  //             pageHeight / img.height
  //           );
  //           const drawW = img.width * ratio;
  //           const drawH = img.height * ratio;
  //           const offsetX = (pageWidth - drawW) / 2;
  //           const offsetY = 0; // no space at top
  //           doc.addImage(bgImage, "PNG", offsetX, offsetY, drawW, drawH);
  //           resolve();
  //         };
  //       });
  //     }
  //   } catch (err) {
  //     console.warn("⚠️ Envelope design background not loaded:", err);
  //   }

  // --- Step 3: Define fold and address area ---
  // A4 height = 297mm → each fold = ~99mm high
  // Typically, the address window is visible in the middle fold section
  const foldHeight = 27;
  const addressStartY = foldHeight; // adjust 25mm below first fold line

  // --- Step 4: Add customer details in window zone ---
  const textX = 107; // left margin (adjust as needed)
  const textY = addressStartY;
  const lineHeight = 4.2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(customerName.toUpperCase(), textX, textY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const fullAddress = [address, city, `${state} - ${postalCode}`, country]
    .filter(Boolean)
    .join(", ");
  const addressLines = doc.splitTextToSize(fullAddress, 90);
  addressLines.forEach((line, i) => {
    doc.text(line, textX, textY + (i + 1) * lineHeight);
  });

  // --- Step 5: Optional fold markers (for debugging / alignment) ---
  // Uncomment these lines while testing:
  // doc.setDrawColor(200, 0, 0);
  // doc.line(0, foldHeight, pageWidth, foldHeight); // 1st fold
  // doc.line(0, foldHeight * 2, pageWidth, foldHeight * 2); // 2nd fold

  // --- Step 6: Return blob & URL ---
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  return { blob, url };
};
