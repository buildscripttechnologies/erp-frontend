import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const loadImage = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateMaterialSpecification = async (
  sample = {},
  companyDetails = {}
) => {
  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 3;
  const dark = [49, 47, 47];
  const companyName = companyDetails.companyName || "I KHODAL BAG PVT. LTD.";
  const address =
    companyDetails.warehouses?.[0]?.address ||
    "132,133,134, ALPINE INDUSTRIAL PARK, NR. CHORYASI TOLL PLAZA, AT. CHORYASI, KAMREJ, SURAT - 394150, GUJARAT, INDIA.";

  doc.setDrawColor(...dark);
  doc.setLineWidth(0.35);
  doc.rect(margin, margin, pageWidth - margin * 2, 291);

  try {
    const logo = await loadImage("/images/logo.png");
    doc.addImage(logo, "PNG", 10, 10, 27, 32, undefined, "FAST");
  } catch (error) {
    console.warn("Material specification logo could not be loaded", error);
  }

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(companyName.toUpperCase(), pageWidth / 2, 20, { align: "center" });
  doc.setLineWidth(0.45);
  doc.line(42, 22, 151, 22);
  doc.setFontSize(10);
  doc.text("MFG. OF ALL TYPE BAG", pageWidth / 2, 27, { align: "center" });
  doc.setFontSize(10);
  doc.text(`GSTIN : ${companyDetails.gst || ""}`, 204, 16, { align: "right" });
  doc.setFontSize(7.5);
  doc.text(address.toUpperCase(), pageWidth / 2, 37, {
    align: "center",
    maxWidth: 158,
  });

  doc.setFillColor(...dark);
  doc.rect(margin, 43, pageWidth - margin * 2, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("SAMPLE SPECIFICATION DETAIL", pageWidth / 2, 50, {
    align: "center",
  });

  const formattedDate = new Date(sample.date || Date.now()).toLocaleDateString(
    "en-GB"
  );
  autoTable(doc, {
    startY: 53,
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - margin * 2,
    theme: "grid",
    body: [[
      { content: `Date:     ${formattedDate}`, styles: { fontStyle: "bold" } },
      { content: `Sample No.     ${sample.sampleNo || ""}`, styles: { fontStyle: "bold" } },
      { content: `Party Name.     ${sample.partyName?.customerName || sample.partyName || ""}`, styles: { fontStyle: "bold" } },
    ]],
    styles: {
      fontSize: 9,
      textColor: dark,
      minCellHeight: 10,
      valign: "middle",
      lineColor: [90, 90, 90],
      lineWidth: 0.15,
    },
    columnStyles: { 0: { cellWidth: 49 }, 1: { cellWidth: 58 }, 2: { cellWidth: 97 } },
  });

  const materials = (sample.productDetails || []).map((item, index) => [
    index + 1,
    item.itemName || item.skuCode || "",
    item.partName || "",
    item.height || "",
    item.width || "",
    item.depth || "",
    item.qty || "",
  ]);
  while (materials.length < 28) materials.push([materials.length + 1, "", "", "", "", "", ""]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY,
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - margin * 2,
    theme: "grid",
    head: [["No.", "Material", "Part Name", "Height", "Width", "Depth", "PCS"]],
    body: materials,
    styles: {
      fontSize: 8,
      textColor: dark,
      minCellHeight: 7.35,
      valign: "middle",
      lineColor: [75, 75, 75],
      lineWidth: 0.12,
      cellPadding: 1.2,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: dark,
      fontStyle: "bold",
      halign: "center",
      minCellHeight: 10,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 40 },
      2: { cellWidth: 57 },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 25, halign: "center" },
      5: { cellWidth: 25, halign: "center" },
      6: { cellWidth: 22, halign: "center" },
    },
  });

  doc.setFillColor(...dark);
  doc.rect(margin, 291, pageWidth - margin * 2, 4, "F");
  return URL.createObjectURL(doc.output("blob"));
};
