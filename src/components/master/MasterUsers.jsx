// imports ...
import {
  FiSearch,
  FiUserPlus,
  FiEdit,
  FiTrash2,
  FiUnlock,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";

import Dashboard from "../../pages/Dashboard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import TableSkeleton from "../TableSkeleton";
import RoleSkeleton from "../RoleSkeleton";
import AccessDeniedNotice from "../AccessDeniedNotice";
import Toggle from "react-toggle";

export default function MasterUsers() {
  const navigate = useNavigate();
  const [filterRole, setFilterRole] = useState("All");
  const [userTypes, setUserTypes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [access, setAccess] = useState(true);

  const [userTypesLoaded, setUserTypesLoaded] = useState(false);

  const [pagination, setPagination] = useState({
    totalResults: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    userType: "",
    userGroup: "UserGrp",
  });

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showForm]);

  const handleFormClose = () => {
    setFormData({
      fullName: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
      userType: "",
      userGroup: "UserGrp",
    });
    setEditMode(false);

    setShowForm(false);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pagination.limit,
      };
      if (filterRole !== "All") {
        params.userType = filterRole;
      }

      const res = await axios.get("/users/all-users", { params });
      if (res.data.status === 200) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
        // setAccess(true);
        setLoading(false);
      } else {
        toast.error("Failed to fetch users.");
        setUsers([]);
        setPagination({
          totalResults: 0,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
        });
      }
    } catch (err) {
      if (err.status == 403) {
        toast.error("Only Admin Access");
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserTypes = async () => {
      await FetchUserTypes();
      setUserTypesLoaded(true);
    };
    loadUserTypes();
  }, []);

  useEffect(() => {
    if (userTypesLoaded) {
      fetchUsers();
    }
  }, [userTypesLoaded, filterRole, currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowForm(false);
    try {
      if (editMode) {
        await axios.patch(`/users/update-user/${editUserId}`, formData);
        toast.success("User updated successfully.");
      } else {
        await axios.post("/auth/register", formData);
        toast.success("New User Added.");
      }
      setFormData({
        fullName: "",
        username: "",
        email: "",
        mobile: "",
        password: "",
        userType: "",
        userGroup: "UserGrp",
      });
      setEditMode(false);
      setEditUserId(null);
      fetchUsers(); // reload data
    } catch (err) {
      toast.error(err.response?.data?.message || "Error. Please try again.");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      password: "", // leave blank for update
      userType: user.userType,
      userGroup: user.userGroup || "UserGrp",
    });
    setEditMode(true);
    setEditUserId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/users/delete-user/${id}`);
        toast.success("User deleted successfully.");
        fetchUsers();
      } catch (err) {
        toast.error("Failed to delete user.");
      }
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";

    try {
      const res = await axios.patch(`/users/update-user/${user.id}`, {
        status: newStatus,
      });

      if (res.status === 200) {
        toast.success(
          `User ${newStatus === "Active" ? "activated" : "deactivated"}.`
        );

        // ✅ Optimistically update user list locally
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
        );
      } else {
        toast.error("Status update failed.");
      }
    } catch (err) {
      toast.error("Status update failed.");
    }
  };

  const toggleVerification = async (user) => {
    const newVerification = user.isVerified ? false : true;
    try {
      const res = await axios.patch(`/users/update-user/${user.id}`, {
        isVerified: newVerification,
      });

      if (res.status === 200) {
        toast.success(
          `User ${newVerification === true ? "Verified" : "Not Verified"}.`
        );

        // ✅ Optimistically update user list locally
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isVerified: newVerification } : u
          )
        );
      } else {
        toast.error("Verification Update Failed.");
      }
    } catch (err) {
      toast.error("Verification Update Failed.");
    }
  };

  const FetchUserTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/roles/all-roles");
      setUserTypes(res.data.roles);
      setLoading(false);
      // console.log("User Types:", res.data.roles);
    } catch (error) {
      // console.error("Error fetching user types:", error);
      toast.error("Failed to fetch user types.");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const roles = ["All", userTypes.map((r) => r.name)].flat();
  const goToPage = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  // Client-side search
  const filteredUsers = users.filter((user) => {
    const q = searchText.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.mobile?.toLowerCase().includes(q) ||
      user.username?.toLowerCase().includes(q)
    );
  });

  const userTableHeaders = [
    { label: "#", className: "" },
    { label: "Name", className: "" },
    { label: "Mobile", className: "hidden md:table-cell" },
    { label: "Email", className: "hidden lg:table-cell" },
    { label: "IsVerified", className: "hidden lg:table-cell" },
    { label: "Role", className: "" },
    { label: "Username", className: "hidden xl:table-cell" },
    { label: "Status", className: "" },
    { label: "Actions", className: "" },
  ];

  return (
    <Dashboard>
      {/* {access ? ( */}
      <>
        {/* Add User Modal */}
        {showForm && (
          <div className="fixed inset-0  backdrop-blur-md  flex items-center justify-center z-50 ">
            <div className="bg-white border border-[#d8b76a] rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
              <button
                className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-[#d8b76a] font-bold cursor-pointer"
                onClick={() => handleFormClose()}
              >
                ×
              </button>
              <h3 className="text-lg font-bold text-[#d8b76a] mb-4">
                Add New User
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {["fullName", "username", "email", "password", "mobile"].map(
                  (field) => (
                    <input
                      key={field}
                      type={
                        field === "email"
                          ? "email"
                          : field === "password"
                          ? "password"
                          : "text"
                      }
                      placeholder={
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      className="w-full px-4 py-2 font-semibold border border-[#d8b76a] rounded focus:border-[#b38a37] focus:outline-none"
                      required={!editMode || field !== "password"}
                    />
                  )
                )}
                <select
                  value={formData.userType}
                  onChange={(e) =>
                    setFormData({ ...formData, userType: e.target.value })
                  }
                  className="w-full px-4 py-2 font-semibold border border-[#d8b76a] rounded focus:border-[#b38a37] focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">Select User Type</option>
                  {roles
                    .filter((r) => r !== "All")
                    .map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                </select>
                <button
                  type="submit"
                  className="w-full bg-[#d8b76a] hover:bg-[#c3a14f] text-white font-semibold py-2 rounded"
                >
                  {editMode ? "Update User" : "Register User"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Header and Actions */}
        <div
          className={`relative p-4 md:px-4 max-w-[99vw] mx-auto overflow-x-hidden mt-4
          ${editMode || showForm ? "scroll-events-none" : ""} `}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#292926]">
              All Users{" "}
              <span className="text-sm text-black">
                ({pagination.totalResults})
              </span>
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#d8b76a] text-[#292926] font-semibold px-3 py-1 rounded  items-center gap-2 hover:bg-[#d8b76a]/80  transition cursor-pointer hidden sm:flex"
            >
              <FiUserPlus /> Add User
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative w-full sm:max-w-80">
              <input
                type="text"
                placeholder="Search users..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-1 text-[#292926]  border border-[#d8b76a] rounded focus:border-2 focus:border-[#d8b76a] focus:outline-none transition duration-200"
              />
              <FiSearch className="absolute left-2 top-2 text-[#d8b76a]" />
            </div>
            {!userTypesLoaded ? (
              <RoleSkeleton />
            ) : (
              <>
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setFilterRole(role);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded text-sm ${
                      role === filterRole
                        ? "bg-[#d8b76a] text-white font-semibold"
                        : "bg-[#d8b76a]/20 text-[#292926]"
                    } hover:bg-[#d8b76a] transition cursor-pointer hidden sm:inline-block`}
                  >
                    {role}
                  </button>
                ))}
              </>
            )}

            <div className="flex overflow-scroll sm:overflow-hidden sm:flex-wrap gap-2 sm:hidden">
              {!userTypesLoaded ? (
                <RoleSkeleton />
              ) : (
                <>
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setFilterRole(role);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                        role === filterRole
                          ? "bg-[#d8b76a] text-white font-semibold"
                          : "bg-[#d8b76a]/20 text-[#292926]"
                      } hover:bg-[#d8b76a] transition cursor-pointer`}
                    >
                      {role}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#d8b76a] text-[#292926] w-full text-center justify-center font-semibold px-3 py-1 rounded flex items-center gap-2 hover:bg-[#d8b76a]/80  transition cursor-pointer mb-4 sm:hidden"
          >
            <FiUserPlus /> Add User
          </button>

          {/* Table */}
          <div className="bg-white rounded border border-[#d8b76a]  overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-[#d8b76a] text-[#292927] text-left">
                <tr>
                  <th className="py-1.5 px-2">#</th>
                  <th className="py-1.5 px-2">Name</th>
                  <th className="py-1.5 px-2 hidden md:table-cell">Mobile</th>
                  <th className="py-1.5 px-2 hidden lg:table-cell">Email</th>
                  <th className="py-1.5 px-2 hidden lg:table-cell">
                    IsVerified
                  </th>
                  <th className="py-1.5 px-2">Role</th>
                  <th className="py-1.5 px-2 hidden xl:table-cell">Username</th>
                  <th className="py-1.5 px-2">Status</th>
                  <th className="py-1.5 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton rows={5} columns={userTableHeaders} />
                ) : (
                  <>
                    {filteredUsers.map((u, i) => (
                      <tr
                        key={u.id}
                        className="border-b border-[#d8b76a] hover:bg-gray-50"
                      >
                        <td className="py-1 px-2">{i + 1}</td>
                        <td className="py-1 px-2">{u.fullName}</td>
                        <td className="py-1 px-2 hidden md:table-cell">
                          {u.mobile}
                        </td>
                        <td className="py-1 px-2 hidden lg:table-cell">
                          {u.email}
                        </td>
                        <td
                          // data-tooltip-id="statusTip"
                          // data-tooltip-content={
                          //   u.isVerified ? "Set Verified" : "Set Not Verified"
                          // }
                          className="pt-1 px-2 hidden lg:table-cell "
                        >
                          <Toggle
                            checked={u.isVerified}
                            onChange={() => toggleVerification(u)}
                          />
                        </td>

                        <td className="py-1 px-2">{u.userType}</td>
                        <td className="py-1 px-2 hidden xl:table-cell">
                          {u.username}
                        </td>
                        <td
                          // data-tooltip-id="statusTip"
                          // data-tooltip-content={
                          //   u.status == "Active"
                          //     ? "Deactivate User"
                          //     : "Activate User"
                          // }
                          className="pt-1 px-2"
                        >
                          <Toggle
                            checked={u.status == "Active"}
                            onClick={() => handleToggleStatus(u)}
                          />
                        </td>
                        <td className="pt-1.5 px-2 flex gap-2 text-lg items-center  text-[#d39c25]">
                          <FiEdit
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Edit User"
                            onClick={() => handleEdit(u)}
                            className="hover:text-blue-500 cursor-pointer"
                          />
                          <FiTrash2
                            data-tooltip-id="statusTip"
                            data-tooltip-content="Delete User"
                            onClick={() => handleDelete(u.id)}
                            className="hover:text-red-500 cursor-pointer"
                          />

                          {/* {u.status === "Active" ? (
                              <FiUserCheck
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Deactivate User"
                                onClick={() => handleToggleStatus(u)}
                                className="text-[#d39c25] hover:text-green-700 cursor-pointer"
                              />
                            ) : (
                              <FiUserX
                                data-tooltip-id="statusTip"
                                data-tooltip-content="Activate User"
                                onClick={() => handleToggleStatus(u)}
                                className="text-[#d39c25] hover:text-red-700 cursor-pointer"
                              />
                            )} */}
                          <Tooltip
                            id="statusTip"
                            place="top"
                            style={{
                              backgroundColor: "#292926",
                              color: "#d8b76a",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-wrap justify-center sm:justify-end items-center gap-2 text-sm">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(pagination.totalPages).keys()].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => goToPage(i + 1)}
                className={`px-5 py-2 rounded text-base ${
                  pagination.currentPage === i + 1
                    ? "bg-[#d8b76a] text-white font-semibold"
                    : "bg-[#d8b76a]/20"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              className="px-4 py-2 rounded text-base bg-[#d8b76a]/20 hover:bg-[#d8b76a] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </>
      {/* ) : (
        <AccessDeniedNotice userType="Admin" />
      )} */}
    </Dashboard>
  );
}
