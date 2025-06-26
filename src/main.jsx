import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        success: {
          style: {
            background: "#f6efe7",
            color: "#292927",
            border: "1px solid #292927",
          },
        },
        error: {
          style: { background: "#f87171", color: "white" },
        },
      }}
    />
  </>
);
