import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import { getBase64ImageFromPDF } from "../../utils/convertPDFPageToImage";
import { BeatLoader } from "react-spinners";
import toast from "react-hot-toast";

const LetterpadSetting = () => {
  const [file, setFile] = useState(null);
  const [currentLetterpad, setCurrentLetterpad] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchLetterpad = async () => {
    try {
      const res = await axios.get("/settings/letterpad");
      if (res.data?.path) {
        setCurrentLetterpad(res.data.path);
        const img = await getBase64ImageFromPDF(res.data.path, 0);
        setPreviewImg(img);
      } else {
        setCurrentLetterpad(null);
      }
    } catch (err) {
      console.error("Failed to fetch letterpad:", err);
      setCurrentLetterpad(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetterpad();
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF!");
    setUploading(true);

    const formData = new FormData();
    formData.append("letterpad", file);

    try {
      const res = await axios.post("/settings/letterpad", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.path) {
        setCurrentLetterpad(res.data.path);
        setFile(null);
        toast.success("Letterpad updated successfully ✅");
        await fetchLetterpad();
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (!currentLetterpad) return;
    setDownloading(true);

    setTimeout(() => {
      window.open(currentLetterpad, "_blank");
      setDownloading(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <BeatLoader color="#3B82F6" size={12} />
        <span className="ml-3 text-gray-600">Loading letterpad...</span>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Letterpad</h3>
        {currentLetterpad && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-secondary shadow hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? (
              <BeatLoader size={8} color="#292926" />
            ) : (
              "Download PDF"
            )}
          </button>
        )}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upload Section */}
        <div className="col-span-2 space-y-4">
          <label
            htmlFor="letterpadFile"
            className="block text-sm font-medium text-gray-700"
          >
            Upload New Letterpad
          </label>
          <input
            id="letterpadFile"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-primary/90 focus:ring-2 focus:ring-primary/50"
          />
          {file && (
            <p className="text-sm text-gray-600">
              Selected: <span className="font-semibold">{file.name}</span>
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-secondary shadow hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50 min-h-[38px]"
          >
            {uploading ? (
              <BeatLoader size={8} color="#292926" />
            ) : (
              "Update Letterpad"
            )}
          </button>
        </div>

        {/* Preview Section */}
        {previewImg && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600">Preview:</p>
            <div className="w-full max-w-[250px] rounded-lg bg-gray-50 p-3 shadow">
              <img
                src={previewImg}
                alt="Letterpad Preview"
                className="w-full rounded border border-gray-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LetterpadSetting;
