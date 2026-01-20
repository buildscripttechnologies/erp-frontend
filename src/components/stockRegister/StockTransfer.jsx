import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { BeatLoader } from "react-spinners";
import toast from "react-hot-toast";

const StockTransfer = ({ item, onTransfer, onClose }) => {
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [transferQty, setTransferQty] = useState("");
  const [toWarehouse, setToWarehouse] = useState("");
  const [fromWarehouse, setFromWarehouse] = useState(item.warehouse || "");
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const res = await axios.get("/settings/company-details");

        setWarehouses(res.data.warehouses || []);
      } catch {
        toast.error("Failed to fetch warehouse details");
      }
    };
    fetchCompanyDetails();
  }, []);
  const handleTransfer = async () => {
    if (!transferQty || !toWarehouse || !fromWarehouse) {
      toast.error("Please fill both quantity and warehouse");
      return;
    }

    try {
      setLoading(true);

      let res = await axios.post(`/stocks/transfer`, {
        sku: item.skuCode,
        qty: Number(transferQty),
        fromWarehouse: fromWarehouse,
        toWarehouse: toWarehouse,
      });

      console.log(res.data);

      if (res.data.error) {
        toast.error(res.data.error);
        return;
      }

      toast.success("Stock transferred successfully");
      onTransfer && onTransfer();

      setOpenTransferModal(false);
      setTransferQty("");
      setToWarehouse("");
      setFromWarehouse("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-5 rounded shadow w-[350px] border border-primary">
          <h2 className="text-lg font-semibold mb-4">
            Transfer Stock – {item.itemName}
          </h2>

          {/* Quantity Input */}
          <label className="text-sm font-medium">Transfer Quantity</label>
          <input
            placeholder="Enter quantity to transfer"
            type="number"
            className="w-full  p-2  mt-1 mb-3 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            value={transferQty}
            onChange={(e) => setTransferQty(e.target.value)}
          />

          {/* Warehouse Select */}
          {/* <label className="text-sm font-medium">From</label>
          <select
            className="w-full  p-2  mt-1 mb-4 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            value={fromWarehouse}
            onChange={(e) => setFromWarehouse(e.target.value)}
          >
            <option value="">Select Warehouse</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.name}>
                {wh.name}
              </option>
            ))}
          </select> */}
          {/* Warehouse Select */}
          <label className="text-sm font-medium">To Warehouse</label>
          <select
            className="w-full  p-2 rounded mt-1 mb-4 border border-primary  focus:outline-none focus:ring-2 focus:ring-primary"
            value={toWarehouse}
            onChange={(e) => setToWarehouse(e.target.value)}
          >
            <option value="">Select Warehouse</option>
            {warehouses
              .filter((e) => !(e.name == fromWarehouse))
              .map((wh) => (
                <option key={wh.id} value={wh.name}>
                  {wh.name}
                </option>
              ))}
          </select>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 bg-primary hover:bg-primary/80 text-secondary font-semibold rounded flex items-center justify-center gap-2 cursor-pointer"
              onClick={handleTransfer}
              disabled={loading}
            >
              {loading ? <BeatLoader size={8} /> : "Transfer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockTransfer;
