import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import NfcWebScanner from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NfcWebScanner />
  </StrictMode>,
);
