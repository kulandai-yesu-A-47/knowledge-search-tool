import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainComponent from "./components/MainComponent";
import UploadPage from "./pages/UploadPage";
import AllFilesPage from "./pages/AllFilesPage";
import SearchResultsPage from "./pages/SearchResultsPage";

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainComponent />}>
          <Route index element={<Navigate to="/search" replace />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="files" element={<AllFilesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
