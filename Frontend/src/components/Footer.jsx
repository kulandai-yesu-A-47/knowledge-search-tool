import React from "react";

export default function Footer(){
  return (
    <footer className="bg-white border-t">
      <div className="max-w-6xl mx-auto p-4 text-sm text-gray-600 flex items-center justify-between">
        <div>© {new Date().getFullYear()} — Your Company / Project</div>
        <div className="text-xs text-gray-500">Built for RapidQuest hackathon — internal prototype</div>
      </div>
    </footer>
  );
}
