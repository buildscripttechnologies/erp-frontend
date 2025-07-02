import { useState } from "react";
import { FiX } from "react-icons/fi";
import axios from "../../../utils/axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

const AddRoleModal = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return toast.error("Role name is required");

    try {
      setLoading(true);
      const res = await axios.post("/roles/add-role", { name });
      if (res.status == 201) {
        toast.success("Role added successfully");
        onAdded(); // Refresh list
        onClose();
      } else {
        toast.error("Failed to add role");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Add request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed  inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[92vw] max-w-md rounded-lg shadow-lg p-6 relative border-2 border-[#d8b76a]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-600 hover:text-black cursor-pointer"
        >
          <FiX />
        </button>
        <h2 className="text-lg font-semibold text-[#d8b76a] mb-4">Add Role</h2>

        <input
          type="text"
          placeholder="Enter role name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded border-[#d8b76a] focus:outline-none focus:ring-2 focus:ring-[#b38a37]"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-[#d8b76a] text-black px-4 py-2 items-center justify-center flex rounded hover:bg-[#d8b76a]/80 font-semibold cursor-pointer"
          >
            {loading ? (
              <>
                <span className="mr-2">Saving...</span>
                <ClipLoader size={20} color="#292926" />
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoleModal;
