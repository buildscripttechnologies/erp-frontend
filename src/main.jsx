import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "react-toggle/style.css";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { registerSW } from "virtual:pwa-register";
import { CategoryProvider } from "./context/CategoryContext.jsx";
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
      <CategoryProvider>
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={12}
          containerStyle={{
            top: 20,
            right: 20,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              padding: "14px 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              minWidth: "280px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
            },
            success: {
              duration: 3000,
              style: {
                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                color: "#065f46",
                border: "1px solid #34d399",
              },
              iconTheme: {
                primary: "#059669",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              style: {
                background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                color: "#991b1b",
                border: "1px solid #f87171",
              },
              iconTheme: {
                primary: "#dc2626",
                secondary: "#fff",
              },
            },
            loading: {
              style: {
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                color: "#1e40af",
                border: "1px solid #60a5fa",
              },
              iconTheme: {
                primary: "#2563eb",
                secondary: "#fff",
              },
            },
          }}
        />
      </CategoryProvider>
    </AuthProvider>
  </>
);
