import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./css/login.css"; // ← Importante que esté esta línea

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
