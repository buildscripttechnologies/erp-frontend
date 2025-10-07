import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/settings/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const addCategory = async () => {
    if (!newCategory.trim()) return toast.error("Category name is required");
    try {
      const res = await axios.post("/settings/categories", {
        name: newCategory,
      });
      setCategories(res.data.categories);
      setNewCategory("");
      toast.success("Category added ✅");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  // Edit category
  const startEdit = (name) => {
    setEditingCategory(name);
    setEditValue(name);
  };

  const saveEdit = async () => {
    if (!editValue.trim()) return toast.error("Category name is required");
    try {
      const res = await axios.put("/settings/categories", {
        oldName: editingCategory,
        newName: editValue,
      });
      setCategories(res.data.categories);
      setEditingCategory(null);
      setEditValue("");
      toast.success("Category updated ✅");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditValue("");
  };

  // Delete category
  const deleteCategory = async (name) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      const res = await axios.delete(`/settings/categories/${name}`);
      setCategories(res.data.categories);
      toast.success("Category deleted ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="text-xl font-semibold text-primary mb-4">Categories</h2>

      {/* Add Category */}
      <div className="flex gap-2 mb-4">
        <input
          className="border border-gray-300 rounded px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          onClick={addCategory}
          className="bg-primary text-secondary font-medium px-5 py-1 rounded hover:bg-primary/80 transition"
        >
          Add
        </button>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto rounded border border-primary shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-primary text-secondary ">
            <tr>
              <th className="px-2 py-1 text-left">#</th>
              <th className="px-2 py-1 text-left">Category Name</th>
              <th className="px-2 py-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="px-2 py-2 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-2 py-2 text-center text-gray-500 italic "
                >
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat, i) => (
                <tr key={cat} className="hover:bg-gray-50 transition border-t border-primary">
                  <td className="px-2 py-1 border-r border-primary">{i + 1}</td>
                  <td className="px-2 py-1 border-r border-primary">
                    {editingCategory === cat ? (
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border border-primary rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      cat
                    )}
                  </td>
                  <td className="px-2 py-1 flex gap-2">
                    {editingCategory === cat ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
