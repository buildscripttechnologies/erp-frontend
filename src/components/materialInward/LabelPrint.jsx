// import React, { useEffect } from "react";
// import Barcode from "react-barcode";
// import JsBarcode from "jsbarcode";

// const LabelPrint = ({ stock, onClose }) => {
//   useEffect(() => {
//     if (stock) {
//       handleDirectPrint();
//     }
//   }, [stock]);

//   const handleDirectPrint = () => {
//     // Create a new popup window
//     const printWindow = window.open("", "_blank", "width=800,height=600");

//     // Create HTML content for printing
//     const htmlContent = `
//       <html>
//         <head>
//           <title>Labels - ${stock.itemName}</title>
//           <style>
//             @page { size: auto; margin: 5mm; }
//             body { font-family: Arial, sans-serif; font-size: 6px; }
//             table { border-collapse: collapse; width: 100mm; height: 65mm; }
//             td { border: 1px solid black; padding: 2px; white-space: nowrap; }
//             .label-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 10px; }
//           </style>
//         </head>
//         <body>
//           ${stock.barcodes
//             .map(
//               (barcodeObj) => `
//               <div class="label-container">
//                 <table>
//                   <tbody>
//                     <tr><td>Party Name</td><td colspan="3">${
//                       stock.partyName || ""
//                     }</td></tr>
//                     <tr><td>Purchased Date</td><td colspan="3">${
//                       stock.purchasedDate || ""
//                     }</td></tr>
//                     <tr><td>Purchased Bill No.</td><td colspan="3">${
//                       stock.billNo || ""
//                     }</td></tr>
//                     <tr><td>Purc. Order No.</td><td colspan="3">${
//                       stock.orderNo || ""
//                     }</td></tr>
//                     <tr><td>Purc. Order Date</td><td colspan="3">${
//                       stock.orderDate || ""
//                     }</td></tr>
//                     <tr><td>Item Name</td><td colspan="3">${
//                       stock.itemName || ""
//                     }</td></tr>
//                     <tr>
//                       <td>Item Code</td><td>${stock.skuCode || ""}</td>
//                       <td>Item Category</td><td>${
//                         stock.itemCategory || "----------"
//                       }</td>
//                     </tr>
//                     <tr>
//                       <td>Item Qty.</td><td>${
//                         barcodeObj.qty || "----------"
//                       }</td>
//                       <td>Item Color</td><td>${
//                         stock.itemColor || "----------"
//                       }</td>
//                     </tr>
//                     <tr>
//                       <td style="text-align:center;">
//                         <img src="/images/logo.png" style="width: 40px;" />
//                       </td>
//                       <td colspan="3" style="text-align:center;">
//                         <img src="${getBarcodeDataURL(barcodeObj.barcode)}" />
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             `
//             )
//             .join("")}
//         </body>
//       </html>
//     `;

//     // Write and print
//     printWindow.document.write(htmlContent);
//     printWindow.document.close();

//     // Give time for images/barcodes to load before printing
//     printWindow.onload = () => {
//       printWindow.focus();
//       printWindow.print();
//       printWindow.close();
//     };
//   };

//   // Helper to generate barcode as image data URL
//   const getBarcodeDataURL = (barcodeValue) => {
//     const canvas = document.createElement("canvas");
//     // Set higher resolution for crispness
//     const scale = 5; // 3x scale for sharpness
//     canvas.width = 300 * scale; // width in pixels
//     canvas.height = 100 * scale; // height in pixels

//     const ctx = canvas.getContext("2d");
//     ctx.scale(scale, scale); // upscale drawing
//     JsBarcode(canvas, barcodeValue, {
//       width: 1,
//       height: 30,
//       fontSize: 10,
//       format: "CODE128",
//     });
//     return canvas.toDataURL("image/png");
//   };

//   return null; // No UI, just trigger print
// };

// export default LabelPrint;
