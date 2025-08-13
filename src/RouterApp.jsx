import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
//import App from "./App"; Não usar
import ShowModels from "./ShowModels";

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShowModels />} />
        <Route path="/show" element={<ShowModels />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
