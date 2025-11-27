import jsPDF from "jspdf";
import { getBase64ImageFromPDF } from "../../../utils/convertPDFPageToImage";

/**
 * Generate A4 envelope print with address positioned for tri-fold window alignment.
 * @param {Object} data - Envelope data (vendorName, address, city, state, postalCode, country)
 * @param {String} designPdfPath - Optional background PDF design (default: /env.pdf)
 */

export const generateEnvelopePdfWithoutBG = async (
  data = {},
  designPdfPath = ""
) => {
  const {
    vendorName = "",
    address = "",
    city = "",
    state = "",
    postalCode = "",
    country = "",
    // ✅ Added mobile
  } = data;
  let mobile = data.contactPersons[0].phone;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [107, 239], // width × height (portrait)
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Step 1: Add Background (Envelope Design) ---
  try {
    if (designPdfPath) {
      const bgImage = await getBase64ImageFromPDF(designPdfPath, 0);
      if (bgImage) {
        const img = new Image();
        img.src = bgImage;
        await new Promise((resolve) => {
          img.onload = () => {
            const ratio = Math.min(
              pageHeight / img.width,
              pageWidth / img.height
            );
            const drawW = img.width * ratio;
            const drawH = img.height * ratio;
            console.log(drawH, drawW);

            // Draw image rotated 90° clockwise
            doc.addImage(
              bgImage,
              "PNG",
              0, // move to right edge
              0 - pageWidth,
              drawW,
              drawH,
              undefined,
              "FAST",
              270 // rotation angle in degrees
            );
            resolve();
          };
        });
      }
    }
  } catch (err) {
    console.warn("⚠️ Envelope background not loaded:", err);
  }

  // --- Step 2: Define Address Zone ---
  // Each fold ≈ 99mm; window area roughly in the middle fold.
  const foldHeight = 123;
  const addressStartY = foldHeight;
  const textX = 82;
  const textY = addressStartY;
  const lineHeight = 4.1;

  // --- Step 3: Print Customer Name ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(vendorName.toUpperCase(), textX, textY, { angle: 270 });

  // --- Step 4: Print Address Lines ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const fullAddress = [
    address,
    city,
    `${state} - ${postalCode}`,
    country,
    // `Mo: ${mobile}`,
  ]
    .filter(Boolean)
    .join(", ");
  const addressLines = doc.splitTextToSize(fullAddress, 90);
  addressLines.forEach((line, i) => {
    doc.text(line, textX - (i + 1) * lineHeight, textY, { angle: 270 });
  });

  // // --- Step 5: Print Mobile Number ---
  if (mobile) {
    const mobileX = textX - (addressLines.length + 1.2) * lineHeight;
    doc.setFont("helvetica", "bold");
    doc.text(`Mo: ${mobile}`, mobileX, textY, { angle: 270 });
  }

  // --- Step 6: Optional Fold Lines (debug only) ---
  // doc.setDrawColor(255, 0, 0);
  // doc.line(0, foldHeight, pageWidth, foldHeight);
  // doc.line(0, foldHeight * 2, pageWidth, foldHeight * 2);

  // --- Step 7: Return PDF Blob + URL ---
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  return { blob, url };
};

export const generateEnvelopePdf = async (data = {}, designPdfPath = "") => {
  const {
    vendorName = "",
    address = "",
    city = "",
    state = "",
    postalCode = "",
    country = "",
    // ✅ Added mobile
  } = data;
  let mobile = data.contactPersons[0].phone || "-";
  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Step 1: Add Background (Envelope Design) ---
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
          const offsetY = 0;
          doc.addImage(bgImage, "PNG", offsetX, offsetY, drawW, drawH);
          resolve();
        };
      });
    }
  } catch (err) {
    console.warn("⚠️ Envelope design background not loaded:", err);
  }

  // --- Step 2: Define Address Zone ---
  // Each fold ≈ 99mm; window area roughly in the middle fold.
  const foldHeight = 22;
  const addressStartY = foldHeight;
  const textX = 109;
  const textY = addressStartY;
  const lineHeight = 4.1;

  // --- Step 3: Print Customer Name ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(vendorName.toUpperCase(), textX, textY);

  // --- Step 4: Print Address Lines ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const fullAddress = [
    address,
    city,
    `${state} - ${postalCode}`,
    country,
    // `Mo: ${mobile}`,
  ]
    .filter(Boolean)
    .join(", ");
  const addressLines = doc.splitTextToSize(fullAddress, 90);
  addressLines.forEach((line, i) => {
    doc.text(line, textX, textY + (i + 1) * lineHeight);
  });

  // // --- Step 5: Print Mobile Number ---
  if (mobile) {
    const mobileY = textY + (addressLines.length + 1) * lineHeight;
    doc.setFont("helvetica", "bold");
    doc.text(`Mo: ${mobile}`, textX, mobileY);
  }

  // --- Step 6: Optional Fold Lines (debug only) ---
  // doc.setDrawColor(255, 0, 0);
  // doc.line(0, foldHeight, pageWidth, foldHeight);
  // doc.line(0, foldHeight * 2, pageWidth, foldHeight * 2);

  // --- Step 7: Return PDF Blob + URL ---
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  return { blob, url };
};
