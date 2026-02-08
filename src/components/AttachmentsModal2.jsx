import { FiDownload, FiExternalLink } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const AttachmentsModal2 = ({ attachments = [], onClose }) => {
  const isImage = (filename) =>
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename);

  const getMimeType = (filename) => {
    if (filename.endsWith(".pdf")) return "application/pdf";
    if (filename.endsWith(".png")) return "image/png";
    if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
      return "image/jpeg";
    return "application/octet-stream";
  };

  const handlePreview = async (att) => {
    try {
      const response = await axios.get(att.fileUrl, {
        responseType: "blob",
      });
      const mimeType = getMimeType(att.fileName);
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
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", att.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs  px-4">
      <div className="bg-white w-full max-w-md rounded-lg border border-[#d8b76a] p-4 shadow-md relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#292926] dark:text-white">Attachments</h3>
          <button
            onClick={onClose}
            className="text-[#292926] dark:text-white hover:text-red-500 text-xl font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Attachments */}
        {attachments.length > 0 ? (
          <div className="space-y-4">
            {attachments.map((att, index) => (
              <div
                key={index}
                className="flex flex-col items-center border border-[#d8b76a] rounded bg-[#fffaf0] p-3"
              >
                {isImage(att.fileName) ? (
                  <img
                    src={att.fileUrl}
                    alt="attachment"
                    className="w-full max-h-64 object-contain rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-4xl text-gray-500 bg-gray-100 rounded mb-2">
                    📄
                  </div>
                )}

                <div className="flex justify-center gap-6 w-full">
                  <button
                    onClick={() => handlePreview(att)}
                    className="flex items-center gap-1 text-[#292926] hover:underline  text-sm cursor-pointer  "
                  >
                    <FiExternalLink />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(att)}
                    className="flex items-center gap-1 text-[#292926] hover:underline  text-sm cursor-pointer"
                  >
                    <FiDownload />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No attachments available.</p>
        )}
      </div>
    </div>
  );
};

export default AttachmentsModal2;
