import React, { useState } from "react";

const PdfOptionsModal = ({ sampleData, onClose, onConfirm }) => {
  const [download, setDownload] = useState(true);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);

  const handleConfirm = () => {
    onConfirm({ download, sendWhatsapp });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50  backdrop-blur-xs">
      <div className="bg-white text-black rounded-lg p-6 w-96 shadow-sm border border-primary ">
        <h3 className="text-lg font-semibold mb-4 text-primary">Choose Action</h3>
        <div className="flex flex-col gap-3 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={download}
              className="accent-primary"
              onChange={(e) => setDownload(e.target.checked)}
            />
            Download PDF
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className=" accent-primary "
              checked={sendWhatsapp}
              onChange={(e) => setSendWhatsapp(e.target.checked)}
            />
            Send via WhatsApp
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-primary text-secondary rounded hover:bg-primary/80"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfOptionsModal;
