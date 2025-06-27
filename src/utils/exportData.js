import * as XLSX from "xlsx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "RawMaterials");
  XLSX.writeFile(workbook, "RawMaterials.xlsx");
};

export const exportToPDF = (data) => {
  const doc = new jsPDF();
  const columns = Object.keys(data[0] || {}).map((key) => ({
    header: key,
    dataKey: key,
  }));
  autoTable(doc, {
    columns,
    body: data,
    theme: "grid",
    styles: { fontSize: 8 },
  });
  doc.save("RawMaterials.pdf");
};
