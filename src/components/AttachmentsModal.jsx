import { FiDownload, FiExternalLink } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const AttachmentsModal = ({ attachments = [], onClose }) => {
  const isImage = (filename) =>
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename);

  const getMimeType = (filename) => {
    if (filename.endsWith(".pdf")) return "application/pdf";
    if (filename.endsWith(".png")) return "image/png";
    if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
      return "image/jpeg";
    return "application/octet-stream"; // fallback
  };

  const handlePreview = async (att) => {
    try {
      const response = await axios.get(att.fileUrl, {
        responseType: "blob",
      });

      console.log("fileurl", att.fileUrl);
      const mimeType = getMimeType(att.fileName); // ✅ use filename
      const blob = new Blob([response.data], { type: mimeType });
      const url = URL.createObjectURL(blob);

      if (mimeType === "application/pdf" || mimeType.startsWith("image/")) {
        window.open(url, "_blank");
      } else {
        toast.error("Preview not supported for this file type");
      }
    } catch (err) {
      console.error("Preview error", err);
      toast.error("Failed to preview file");
    }
  };

  const handleDownload = async (att) => {
    try {
      const response = await axios.get(att.fileUrl, {
        responseType: "blob",
      });

      // Create a link element
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", att.fileName); // file name for download
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="fixed inset-0  z-50 flex backdrop-blur-xs items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-sm p-6 overflow-y-auto max-h-[90vh] relative border border-[#d8b76a]">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#292926]">
            Attachment Preview
          </h3>
          <button
            onClick={onClose}
            className="text-[#292926] hover:text-red-500 text-xl font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Attachment List */}
        {attachments.length > 0 ? (
          <ul className="space-y-3">
            {attachments.map((att, index) => (
              <li
                key={index}
                className="flex items-center gap-3 p-3 border border-[#d8b76a] rounded bg-[#fffaf0] justify-between"
              >
                {/* Preview */}
                <div className="flex items-center gap-2">
                  {isImage(att.fileName) ? (
                    <img
                      src={att.fileUrl}
                      alt={att.fileName}
                      className="w-12 h-12 object-cover rounded border border-gray-300 "
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 border border-gray-300 rounded text-xl">
                      📄
                    </div>
                  )}

                  {/* Filename */}
                  <a
                    onClick={() => handlePreview(att)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate  cursor-pointer duration-100 "
                    title={att.fileName}
                  >
                    {att.fileName}
                  </a>
                </div>
                {/* Actions */}
                <div className="flex gap-4 ">
                  {/* Open in new tab */}
                  <a
                    onClick={() => handlePreview(att)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#292926] hover:text-[#d8b76a] transition cursor-pointer duration-100"
                    title="Open"
                  >
                    <FiExternalLink size={18} />
                  </a>

                  {/* Download */}
                  <a
                    title="Download"
                    onClick={() => handleDownload(att)}
                    className="text-[#292926] hover:text-[#d8b76a] transition cursor-pointer"
                  >
                    <FiDownload size={18} />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No attachments available.</p>
        )}
      </div>
    </div>
  );
};

export default AttachmentsModal;
