import React from "react";
import { Link } from "react-router-dom";

export default function Header(){
  return (
    <header className="bg-blue-700 text-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold"><Link to={"/"}> Knowledge Search </Link></div>
          <div className="text-sm opacity-90">— Internal Docs</div>
        </div>

        <nav className="flex items-center gap-3">
          <Link to="/search" className="text-sm hover:underline">Search</Link>
          <Link to="/upload" className="text-sm hover:underline">Upload</Link>
          <Link to="/files" className="text-sm hover:underline">All Files</Link>
        </nav>
      </div>
    </header>
  );
}
