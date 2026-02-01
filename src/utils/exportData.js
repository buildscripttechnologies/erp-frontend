import * as XLSX from "xlsx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBase64ImageWithSize } from "./convertImageToBase64";

import ExcelJS from "exceljs";

export const exportToExcel = (data, name) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").replace(/\//g, "-");

    XLSX.utils.book_append_sheet(workbook, worksheet, name);
    XLSX.writeFile(workbook, `${name}_${formattedDate}.xlsx`);
};

export const exportToPDF = (rawMaterials) => {

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a3",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    const headers = [
        "SKU Code",
        "Item Name",
        "Description",
        "Category",
        "Color",
        "HSN/SAC",
        "Type",
        "Location",
        "MOQ",
        "Panno",
        "SI Rate",
        "Rate",
        "GST",
        "S Qty",
        "B Qty",
        "P Qty",
        "P UOM",
        "S UOM",
        "Q. Insp.",
        "T Rate",
    ];

    const data = rawMaterials.map((e) => [
        e.skuCode || "-",
        e.itemName || "-",
        e.description || "-",
        e.itemCategory || "-",
        e.itemColor || "-",
        e.hsnOrSac || "-",
        e.type || "-",
        e.location || "-",
        e.moq || 0,
        e.panno || 0,
        e.sqInchRate || 0,
        e.rate || 0,
        e.gst || 0,
        e.stockQty || 0,
        e.baseQty || 0,
        e.pkgQty || 0,
        e.purchaseUOM || "-",
        e.stockUOM || "-",
        e.qualityInspectionNeeded === "Required" ? "Yes" : "No",
        e.totalRate || 0,
    ]);

    autoTable(doc, {
        head: [headers],
        body: data,
        styles: {
            fontSize: 7,
            cellPadding: 2,
            overflow: "linebreak",
            halign: "left",
        },
        headStyles: {
            fillColor: [216, 183, 106], // RGB for #d8b76a
            textColor: [41, 41, 38],
            fontStyle: "bold",
            fontSize: 7,
            halign: "center",
        },
        columnStyles: {
            0: { cellWidth: 28 }, // SKU Code
            1: { cellWidth: 30 }, // Item Name
            2: { cellWidth: 35 }, // Description
            3: { cellWidth: 20 }, // Category
            4: { cellWidth: 18 }, // Color
            5: { cellWidth: 20 }, // HSN/SAC
            6: { cellWidth: 15 }, // Type
            7: { cellWidth: 18 }, // Location
            8: { cellWidth: 12, halign: "center" }, // MOQ
            9: { cellWidth: 12, halign: "center" }, // Panno
            10: { cellWidth: 18, halign: "right" }, // SI Rate
            11: { cellWidth: 18, halign: "right" }, // Rate
            12: { cellWidth: 12, halign: "center" }, // GST
            13: { cellWidth: 14, halign: "right" }, // S Qty
            14: { cellWidth: 14, halign: "right" }, // B Qty
            15: { cellWidth: 14, halign: "right" }, // P Qty
            16: { cellWidth: 16, halign: "center" }, // P UOM
            17: { cellWidth: 16, halign: "center" }, // S UOM
            18: { cellWidth: 16, halign: "center" }, // Q. Insp.
            19: { cellWidth: 20, halign: "right" }, // T Rate
        },
        margin: { top: 10, left: 5, right: 5, bottom: 10 },
        startY: 10,
        theme: "grid",
        tableWidth: "auto",
        didDrawPage: function(data) {
            // Add page numbers
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(
                `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
                pageWidth - 30,
                doc.internal.pageSize.getHeight() - 5
            );
        },
    });

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").replace(/\//g, "-");
    doc.save(`RawMaterials_${formattedDate}.pdf`);
};

export const exportFGToPDF = async(fg) => {
    // Use 'l' for landscape
    const doc = new jsPDF("l");

    // Define image settings for consistency
    const IMAGE_MAX_DIMENSION = 30; // Max size for image in mm
    const CELL_PADDING = 4; // Extra padding for the cell height

    const headers = [
        "SKU Code",
        "Item Name",
        "Description",
        "HSN/SAC",
        "Location",
        "GST",
        "Size (In)",
        "Rate",
        "Product Image",
    ];

    // 1. Preload images and prepare table data (Your logic here is mostly fine)
    const tableData = await Promise.all(
        fg.map(async(e) => {
            let imageCell = null;

            if (e.files && e.files.length > 0) {
                // ASSUMPTION: getBase64ImageWithSize correctly fetches, scales, and returns data
                // For jspdf-autotable, it's often best to return the raw base64 data and dimensions
                const { base64, width, height } = await getBase64ImageWithSize(
                    e.files[0].fileUrl,
                    IMAGE_MAX_DIMENSION,
                    IMAGE_MAX_DIMENSION
                );

                imageCell = {
                    base64: base64.split(",")[1] || base64, // Ensure clean base64 data (without prefix)
                    width,
                    height,
                    // Determine format from the original base64 prefix
                    format: base64.includes("image/png") ? "PNG" : "JPEG",
                };
            }

            return [
                e.skuCode,
                e.itemName,
                e.description,
                e.hsnOrSac,
                e.location,
                e.gst,
                `${e.height}x${e.width}x${e.depth}`,
                e.rate,
                imageCell, // Cell data is the object for the image
            ];
        })
    );

    // 2. Configure and draw the table
    autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 5,
        theme: "grid",
        styles: {
            fontSize: 6,
            cellWidth: "wrap",
            overflow: "linebreak",
            valign: "middle",
        },
        headStyles: {
            fillColor: "#d8b76a",
            textColor: "#292926",
            fontStyle: "bold",
            minCellHeight: 8,
            valign: "middle",
        },

        // 🔥 FIX 1: Set the ROW height, not the CELL height
        didParseCell: (data) => {
            // Check for the 'Product Image' column (index 8) AND if it has the image data
            if (data.column.index === 8 && data.cell.raw ? .base64) {
                const { width, height } = data.cell.raw;

                // Calculate the scale factor to fit within max dimension
                const scale = Math.min(
                    IMAGE_MAX_DIMENSION / width,
                    IMAGE_MAX_DIMENSION / height,
                    1
                );

                // Calculate the final displayed height in the document's units (mm)
                const finalHeight = height * scale;

                // Set the ROW height to be the max of its current height or the image's height + padding
                data.row.height = Math.max(data.row.height, finalHeight + CELL_PADDING);

                // Clear the text content to prevent "[object Object]"
                data.cell.text = "";
            }
        },

        // 🔥 FIX 2: Use final calculated dimensions for consistent centering
        didDrawCell: (data) => {
            if (data.column.index === 8 && data.cell.raw ? .base64) {
                const { base64, width, height, format } = data.cell.raw;

                // Recalculate the scale and final dimensions (must be the same as didParseCell)
                const scale = Math.min(
                    IMAGE_MAX_DIMENSION / width,
                    IMAGE_MAX_DIMENSION / height,
                    1
                );
                const finalWidth = width * scale;
                const finalHeight = height * scale;

                // Center the image horizontally and vertically within the cell
                const x = data.cell.x + (data.cell.width - finalWidth) / 2;
                const y = data.cell.y + (data.cell.height - finalHeight) / 2;

                // Add the image
                doc.addImage(base64, format, x, y, finalWidth, finalHeight);
            }
        },
    });

    // 3. Save the document
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").replace(/\//g, "-");
    doc.save(`FG_${formattedDate}.pdf`);
};

// Utility to load image and get original dimensions (kept for 'contain' logic)
const getOriginalImageDimensions = (url, blob) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            window.URL.revokeObjectURL(img.src);
            resolve({
                originalWidth: img.width,
                originalHeight: img.height,
            });
        };
        img.onerror = reject;
        img.src = window.URL.createObjectURL(blob);
    });
};

export const exportFGToExcel = async(fg) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("FG");

    // --- Configuration (Using the larger values for image size) ---
    const IMAGE_COLUMN_INDEX = 9;
    const ROW_HEIGHT_IN_POINTS = 80; // Increased value
    const DEFAULT_ROW_HEIGHT = 15;
    const IMAGE_PADDING = 5;
    const MAX_IMAGE_SIZE = ROW_HEIGHT_IN_POINTS - IMAGE_PADDING;

    const headers = [
        "SKU Code",
        "Item Name",
        "Description",
        "HSN/SAC",
        "Location",
        "GST",
        "Size (In)",
        "Rate",
        "Product Image",
    ];

    // 1. Setup Columns and Apply Vertical Alignment
    sheet.columns = headers.map((h, index) => {
        const isImageColumn = index === IMAGE_COLUMN_INDEX - 1;

        return {
            header: h,
            key: h,
            width: isImageColumn ? 24 : 18, // Increased value
            // ⭐ FIX 1: Apply style to center text vertically for all columns
            style: {
                alignment: {
                    vertical: "middle",
                    wrapText: true, // Optional: Helps multi-line text stay centered
                },
            },
        };
    });

    // 2. Add Data Rows and Images
    for (const e of fg) {
        const hasImage = e.files && e.files.length > 0;

        // ... (rowData setup remains the same)
        const rowData = {
            "SKU Code": e.skuCode || "",
            "Item Name": e.itemName || "",
            Description: e.description || "",
            "HSN/SAC": e.hsnOrSac || "",
            Location: e.location || "",
            GST: e.gst || "",
            "Size (In)": `${e.height}x${e.width}x${e.depth}`,
            Rate: e.rate || "",
            "Product Image": "",
        };

        const row = sheet.addRow(rowData);
        row.height = hasImage ? ROW_HEIGHT_IN_POINTS : DEFAULT_ROW_HEIGHT;

        // 3. Conditional Image Insertion
        if (hasImage) {
            try {
                const imgUrl = e.files[0].fileUrl;

                const response = await fetch(imgUrl);
                const blob = await response.blob();
                const imageArrayBuffer = await blob.arrayBuffer();
                const extension = imgUrl
                    .substring(imgUrl.lastIndexOf(".") + 1)
                    .toLowerCase();

                const { originalWidth, originalHeight } =
                await getOriginalImageDimensions(imgUrl, blob);

                // Aspect Ratio Scaling (CONTAIN)
                const widthRatio = MAX_IMAGE_SIZE / originalWidth;
                const heightRatio = MAX_IMAGE_SIZE / originalHeight;
                const scale = Math.min(widthRatio, heightRatio);

                const finalWidth = originalWidth * scale;
                const finalHeight = originalHeight * scale;

                // ⭐ FIX 2: Calculate offsets to center the image horizontally and vertically
                const offsetX =
                    (sheet.getColumn(IMAGE_COLUMN_INDEX).width * 7.5 - finalWidth) / 2;
                const offsetY = (ROW_HEIGHT_IN_POINTS - finalHeight) / 2;

                const imageId = workbook.addImage({
                    buffer: imageArrayBuffer,
                    extension: extension,
                });

                // Anchor using tl and ext, and apply the calculated offset for centering
                sheet.addImage(imageId, {
                    // Anchor point (col index is 8, row index is row.number - 1)
                    tl: {
                        col: IMAGE_COLUMN_INDEX - 1,
                        row: row.number - 1,
                        // Add the offset to shift the image right/down from the top-left corner
                        colOff: offsetX,
                        rowOff: offsetY,
                    },
                    // Crucial: Use the calculated proportional dimensions
                    ext: { width: finalWidth, height: finalHeight },
                });
            } catch (err) {
                console.error("Failed to add image for FG:", e.skuCode, err);
                row.getCell(IMAGE_COLUMN_INDEX).value = "Image failed to load";
            }
        }
    }

    // 4. Save Excel file (Client-side download logic)
    const today = new Date();
    // ... (Download logic remains the same)
    const formattedDate = today.toLocaleDateString("en-GB").replace(/\//g, "-");
    const fileName = `FG_${formattedDate}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};

export const exportStockToPDF = (stock) => {
    const doc = new jsPDF("l"); // landscape mode

    // console.log("raw materials", rawMaterials);

    const headers = [
        "SKU Code",
        "Item Name",
        "Description",
        "Stock UOM",
        "Stock Qty",
        "Available Qty",
        "Damaged Qty",
        "MOQ",
        "Amount",
    ];

    const data = stock.map((e) => [
        e.skuCode,
        e.itemName,
        e.description,
        e.stockUOM,
        e.stockQty,
        e.availableQty,
        e.damagedQty,
        e.moq,
        e.amount,
    ]);

    autoTable(doc, {
        head: [headers],
        body: data,
        styles: {
            fontSize: 6,
            cellWidth: "wrap",
            overflow: "linebreak",
        },
        headStyles: {
            fillColor: "#d8b76a",
            textColor: "#fff",
            fontStyle: "bold",
        },
        columnStyles: {
            //   0: { cellWidth: 17 }, // SKU
            // 1: { cellWidth: 30 }, // Item Name
            // 2: { cellWidth: 30 }, // Description
            //   5: { cellWidth: 15 }, // Location
            //   12: { cellWidth: 14 }, // Qual. Insp.
            //   13: { cellWidth: 14 }, // Qual. Insp.
            //   14: { cellWidth: 18 }, // Qual. Insp.
            //   // 15: { cellWidth: 80 }, // Attachments
        },
        margin: { top: 5, left: 5, right: 5, bottom: 5 }, // 🔑 super small margins
        startY: 5,
        theme: "grid",
        // tableWidth: "auto",
        // ensures table isn't forced to page width
    });
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").replace(/\//g, "-");
    doc.save(`Stock_${formattedDate}.pdf`);
};