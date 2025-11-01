import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import axios from "../../utils/axios";
import { BeatLoader } from "react-spinners";

export const SelectPOModal = ({ onClose, onSelect }) => {
  const [pos, setPos] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPOs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/pos/get-all?search=approved");
        const filteredPOs = (
          res.data.data ||
          res.data.purchaseOrders ||
          []
        ).filter((po) => po.items?.some((item) => item.inwardStatus != true));
        setPos(filteredPOs);
      } catch (err) {
        toast.error("Failed to fetch POs");
      } finally {
        setLoading(false);
      }
    };
    fetchPOs();
  }, []);

  let filteredItems = selectedPO?.items.filter((i) => i.inwardStatus != true);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg p-6 w-[90vw] max-w-lg border border-primary">
        <h2 className="text-lg font-bold mb-4 text-primary">Inward by PO</h2>

        {loading ? (
          <div className="text-center">
            <BeatLoader color="#d8b76a" />
          </div>
        ) : (
          <>
            <label className="block mb-1 text-sm font-semibold">
              Select PO
            </label>
            <Select
              options={pos.map((po) => ({
                value: po._id,
                label: `${po.poNo} - ${po.vendor.vendorName}`,
              }))}
              onChange={(poOption) => {
                const po = pos.find((p) => p._id === poOption.value);
                setSelectedPO(po);
              }}
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: "#d8b76a",
                  boxShadow: state.isFocused ? "0 0 0 1px #d8b76a" : "none",
                  "&:hover": { borderColor: "#d8b76a" },
                }),
              }}
              placeholder="Select PO"
              className="mb-4"
            />

            {selectedPO && (
              <>
                <label className="block mb-1 text-sm font-semibold">
                  Select Item
                </label>
                <Select
                  options={filteredItems.map((it) => ({
                    value: it._id,
                    label: `${it.item.skuCode} - ${it.item.itemName} (Qty: ${it.orderQty})`,
                  }))}
                  onChange={(itemOption) => {
                    const item = selectedPO.items.find(
                      (i) => i._id === itemOption.value
                    );
                    console.log("item", item);

                    onSelect(selectedPO, item);
                  }}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: "#d8b76a",
                      boxShadow: state.isFocused ? "0 0 0 1px #d8b76a" : "none",
                      "&:hover": { borderColor: "#d8b76a" },
                    }),
                  }}
                  placeholder="Select Item from PO"
                />
              </>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
