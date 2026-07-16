/* eslint-disable react/prop-types */
import { useState } from "react";

const BomPdfTableModal = ({ onClose, onConfirm }) => {
  const [includeProductDetails, setIncludeProductDetails] = useState(true);
  const [includeRawMaterialConsumption, setIncludeRawMaterialConsumption] =
    useState(true);

  const hasSelection =
    includeProductDetails || includeRawMaterialConsumption;

  const handleConfirm = () => {
    if (!hasSelection) return;

    onConfirm({
      includeProductDetails,
      includeRawMaterialConsumption,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs">
      <div className="w-[calc(100%-2rem)] max-w-md rounded-lg border border-primary bg-white p-6 text-black shadow-lg">
        <h3 className="mb-1 text-lg font-semibold text-primary">
          Choose PDF Tables
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Select the tables you want to include in the BOM PDF.
        </p>

        <div className="mb-5 flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 hover:border-primary">
            <input
              type="checkbox"
              className="accent-primary"
              checked={includeProductDetails}
              onChange={(event) =>
                setIncludeProductDetails(event.target.checked)
              }
            />
            <span>Product Details</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 hover:border-primary">
            <input
              type="checkbox"
              className="accent-primary"
              checked={includeRawMaterialConsumption}
              onChange={(event) =>
                setIncludeRawMaterialConsumption(event.target.checked)
              }
            />
            <span>Raw Material Consumption</span>
          </label>
        </div>

        {!hasSelection && (
          <p className="mb-4 text-sm text-red-600">
            Select at least one table to continue.
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasSelection}
            className="rounded bg-primary px-4 py-2 text-secondary hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default BomPdfTableModal;
