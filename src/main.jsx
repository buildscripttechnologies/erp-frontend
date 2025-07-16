import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "react-toggle/style.css";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { registerSW } from "virtual:pwa-register";
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available. Refresh now?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline.");
  },
});

createRoot(document.getElementById("root")).render(
  <>
    <AuthProvider>
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
    </AuthProvider>
  </>
);
