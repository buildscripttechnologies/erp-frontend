import React, { useState } from "react";
import { generateEnvelopePdf } from "../../pdf/generateEnvelopePdf";

const EnvelopePrint = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const data = {
    companyName: "ABC Textiles Pvt. Ltd.",
    address: "Plot 45, GIDC Sachin, Surat - 394230, Gujarat, India",
  };

  const handlePreview = async () => {
    setLoading(true);
    const { url } = await generateEnvelopePdf(
      data,
      "/assets/envelopeDesign.pdf"
    );
    setPdfUrl(url);
    setLoading(false);
  };

  const handlePrint = () => {
    if (!pdfUrl) return;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = pdfUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow.print();
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4">
      <button onClick={handlePreview} className="btn-primary">
        {loading ? "Generating..." : "Preview Envelope"}
      </button>

      {pdfUrl && (
        <>
          <iframe
            src={pdfUrl}
            title="Envelope Preview"
            width="100%"
            height="400px"
            className="mt-4 border rounded"
          />
          <button onClick={handlePrint} className="btn-secondary mt-2">
            Print
          </button>
        </>
      )}
    </div>
  );
};

export default EnvelopePrint;
