import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Color palette
const GOLD = [216, 183, 106]; // #d8b76a
const DARK = [41, 41, 38]; // #292926

export const generateBOM = (sfgData) => {
  const doc = new jsPDF("p", "mm", "a4");

  const title = `BILL OF MATERIALS - ${sfgData.skuCode}`;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.setFontSize(14);
  doc.text(title, 10, 15);

  // --- Blank fields section ---
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const blankFields = [
    { label: "Party Name", x: 110, y: 25 },
    { label: "Sample No ", x: 110, y: 31 },
    { label: "Order Qty   ", x: 110, y: 37 },
    { label: "BOM No.    ", x: 110, y: 43 },
    { label: "Date           ", x: 110, y: 49 },
  ];

  blankFields.forEach(({ label, x, y }) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}: _______________________________`, x, y);
  });

  // Item Info Block
  const details = [
    { label: "Item Name", value: sfgData.itemName },
    { label: "Description", value: sfgData.description || "-" },
    { label: "HSN/SAC", value: sfgData.hsnOrSac || "-" },
    { label: "Type", value: sfgData.type },
    { label: "UOM", value: sfgData.uom },
    // {
    //   label: "Quality Inspection",
    //   value: sfgData.qualityInspectionNeeded ? "Required" : "Not-required",
    // },
    // { label: "Location", value: sfgData.location },
    // { label: "Status", value: sfgData.status },
  ];

  doc.setFontSize(10);
  let y = 25;
  details.forEach((d) => {
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(`${d.label}:`, 10, y);
    doc.setFont("helvetica", "normal");
    doc.text(d.value.toString(), 35, y);
    y += 6;
  });

  //   // SFG Hierarchy Table (L0)
  //   autoTable(doc, {
  //     startY: y + 5,
  //     head: [["Level", "SKU Code", "Item Name"]],
  //     body: [["L0", sfgData.skuCode, sfgData.itemName]],
  //     theme: "grid",
  //     headStyles: {
  //       fillColor: GOLD,
  //       textColor: [255, 255, 255],
  //       halign: "center",
  //       fontStyle: "bold",
  //     },
  //     styles: {
  //       fontSize: 9,
  //       textColor: DARK,
  //     },
  //   });

  // Flatten Components (RM and nested SFGs)
  
  const components = [
    ...(sfgData.rm || []).map((item) => ({
      ...item,
    })),
    ...(sfgData.sfg || []).map((item) => ({
      ...item,
    })),
  ];

  console.log("comp", components);

  if (components.length > 0) {
    const componentTable = components.map((comp, i) => [
      i + 1,
      comp.skuCode || "-",
      comp.itemName || "-",
      comp.description || "-",
      comp.type || "-",
      comp.height || "-",
      comp.width || "-",
      comp.depth || "-",
      comp.qty || "-",
    ]);

    autoTable(doc, {
      startY: y + 8,
      head: [
        [
          "#",
          "SKU Code",
          "Item Name",
          "Description",
          "Type",
          "Height(cm)",
          "Width(cm)",
          "Depth(cm)",
          "Qty",
        ],
      ],
      body: componentTable,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellWidth: "wrap",
        overflow: "linebreak",
        textColor: DARK,
      },
      headStyles: {
        fillColor: GOLD,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
    });
  }

  doc.save(`BOM-${sfgData.skuCode}.pdf`);
};
