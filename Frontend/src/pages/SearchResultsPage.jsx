// src/pages/SearchResultsPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchQuery, deleteDocument } from "../api";
import { fileIcon } from "../utils/fileHelpers";
import toast from "react-hot-toast";

function useQuery(){ return new URLSearchParams(useLocation().search); }

export default function SearchResultsPage(){
  const q = useQuery().get("q") || "";
  const [results, setResults] = useState([]);
  const [info, setInfo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(()=>{
    if(!q){ setResults([]); setInfo("Type something to search…"); return; }

    setInfo("Searching...");
    setSearching(true);

    searchQuery(q)
      .then(res => {
        setResults(res);
        setInfo(`${res.length} results`);
      })
      .catch(err => {
        console.error("Search failed", err);
        setInfo("Search failed");
        toast.error("Search failed");
      })
      .finally(()=> setSearching(false));
  },[q]);

  async function handleDelete(id){
    if(!confirm("Delete this file?")) return;
    try{
      await deleteDocument(id);
      setResults(prev=>prev.filter(x=>x.id!==id));
      toast.success("Deleted");
    }catch(e){
      console.error(e);
      toast.error("Delete failed");
    }
  }

  function openModal(r){
    setSelected(r);
    setShowModal(true);
  }

  function safeSnippet(snippet){
    if(!snippet) return " ";
    return snippet;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Search Results</h2>
      <p className="text-sm text-gray-600 mb-3">{searching ? "Searching..." : info}</p>

      <div className="space-y-3">
        {results.map(r => {
          const filename = r.filename || (r.file_url ? r.file_url.split("/").pop() : "");
          return (
            <div key={r.id} className="p-3 border rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{r.title}</div>
                  {r.tags && <div className="text-xs text-indigo-600">{r.tags}</div>}
                  <div className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{__html: safeSnippet(r.snippet)}} />
                </div>

                <div className="ml-4 flex flex-col gap-2 items-end">
                  <button onClick={()=>openModal(r)} className="text-blue-600 underline text-sm">Open</button>

                  {r.file_url ? (
                    <a href={r.file_url} download target="_blank" rel="noreferrer noopener" className="text-sm">Download</a>
                  ) : (
                    <span className="text-sm text-gray-400">No file URL</span>
                  )}

                  <button onClick={()=>handleDelete(r.id)} className="text-red-600 text-sm">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[80%] h-[80%] rounded shadow-lg p-4 relative">
            <button aria-label="Close" className="absolute top-2 right-2 text-red-600 text-xl" onClick={()=>setShowModal(false)}>✖</button>
            <h3 className="font-semibold mb-2">{selected.title}</h3>

            <div className="h-[90%]">
              {selected.file_type === "image" && selected.file_url && (
                <img src={selected.file_url} alt={selected.filename || ""} className="w-full h-full object-contain" />
              )}

              {selected.file_type === "video" && selected.file_url && (
                <video controls className="w-full h-full bg-black">
                  <source src={selected.file_url} />
                </video>
              )}

              {selected.file_type === "document" && selected.file_url && (selected.filename || "").toLowerCase().endsWith(".pdf") && (
                <iframe src={selected.file_url} className="w-full h-full border" title={selected.filename || "document preview"}></iframe>
              )}

              {selected.file_type === "document" && selected.file_url && !(selected.filename || "").toLowerCase().endsWith(".pdf") && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div>No preview for this file type.</div>
                  <a href={selected.file_url} download target="_blank" rel="noreferrer noopener" className="mt-2 text-blue-600 underline">Download</a>
                </div>
              )}

              {!["image","video","document"].includes(selected.file_type) && (
                <div className="flex items-center justify-center h-full text-gray-500">No preview available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
