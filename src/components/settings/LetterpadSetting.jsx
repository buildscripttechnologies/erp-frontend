import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";

const LetterpadSetting = () => {
  const [file, setFile] = useState(null);
  const [currentLetterpad, setCurrentLetterpad] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLetterpad = async () => {
    try {
      const res = await axios.get("/settings/letterpad"); // GET returns path of current letterpad

      if (res.data?.path) {
        setCurrentLetterpad(res.data.path);
      } else {
        // fallback to static path
        setCurrentLetterpad("/letterpad/lp2.pdf");
      }
    } catch (err) {
      console.error("Failed to fetch letterpad:", err);
      setCurrentLetterpad("/letterpad/lp2.pdf");
    } finally {
      setLoading(false);
    }
  };

  // Fetch current letterpad from backend on mount
  useEffect(() => {
    fetchLetterpad();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF!");

    const formData = new FormData();
    formData.append("letterpad", file);

    try {
      const res = await axios.post("/settings/letterpad", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.path) {
        setCurrentLetterpad(res.data.path);
        setFile(null);
        alert("Letterpad updated successfully ✅");
        await fetchLetterpad();
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    }
  };

  if (loading) {
    return <div className="p-4">Loading letterpad...</div>;
  }

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap">
        <h3 className="text-xl font-semibold text-gray-800">Letterpad</h3>
        {currentLetterpad && (
          <a
            href={currentLetterpad}
            download="lp2.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-secondary shadow hover:bg-primary/90 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            Download
          </a>
        )}
      </div>

      {/* Current Letterpad */}
      {currentLetterpad && (
        <div className="mb-6 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <p className="truncate">
            <span className="font-semibold">Current File:</span>{" "}
            {currentLetterpad.split("/").pop()}
          </p>
        </div>
      )}

      {/* Upload Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col w-full sm:w-2/3">
          <label
            htmlFor="letterpadFile"
            className="mb-2 text-sm font-medium text-gray-600"
          >
            Upload New Letterpad
          </label>
          <input
            id="letterpadFile"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-primary/90"
          />
          {file && (
            <p className="mt-2 text-xs text-gray-500">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-secondary shadow hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Update Letterpad
        </button>
      </div>
    </div>
  );
};

export default LetterpadSetting;
