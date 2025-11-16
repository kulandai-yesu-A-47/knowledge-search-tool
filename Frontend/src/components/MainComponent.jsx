import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useRef } from "react";

export default function MainComponent() {
  const navigate = useNavigate();
  const searchInputRef = useRef();

  const handleSearch = () => {
    const q = searchInputRef.current.value.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };
  // small top row layout percentages:
  // columns = 15% empty | 45% search | 25% buttons | 15% empty
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header className="fixed top-0 left-0 right-0" />

      {/* small header section (search + upload/all files buttons) */}
      <div className="bg-white h-20 shadow flex-none">
        <div className="max-w-6xl mx-auto">
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: "12% 60% 27% 10%",
              gap: "0.8rem",
              padding: "0.30rem",
            }}
          >
            <div /> {/* empty left 10% */}
            {/* center search (10%->60%) */}
            <div>
              <div className="flex gap-1 mt-5">
                <input
                  ref={searchInputRef}
                  id="global-search-input"
                  placeholder="Search documents..."
                  className="flex-1 border p-1.5 rounded w-ful focus:outline-blue-600 "
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <button
                  className="text-white bg-blue-600 rounded active:bg-blue-500  px-4 py-1.5"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Press Enter to search
              </div>
            </div>
            {/* buttons area (upload + all files) */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate("/upload")}
                className="bg-green-700 active:bg-green-500 text-white px-4 py-1.5 rounded"
              >
                Upload
              </button>

              <button
                onClick={() => navigate("/files")}
                className="bg-gray-200 active:bg-white border px-4 py-1.5 rounded"
              >
                All Files
              </button>
            </div>
            <div /> {/* empty right 10% */}
          </div>
        </div>
      </div>

      {/* main content area — fills remaining space */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>

      <Footer className="fixed bottom-0 left-0 right-0" />
    </div>
  );
}
