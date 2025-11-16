// src/pages/UploadPage.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { uploadDocument, listDocuments, deleteDocument } from "../api";
import { fileIcon } from "../utils/fileHelpers";

export default function UploadPage(){
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await listDocuments();
        setDocs(d);
      } catch (e) {
        console.error(e);
        window.alert("Failed to load documents");
      }
    })();
  }, []);

  async function handleUpload(e){
    e.preventDefault();
    if(!title || !file) return toast.error("Title & file required");
    setLoading(true);
    toast.promise(
      uploadDocument(title, file),
      {
        loading: "Uploading...",
        success: (res) => {
          setDocs(prev => [res, ...prev]);
          setTitle(""); setFile(null);
          setLoading(false);
          return "Uploaded";
        },
        error: (err) => {
          setLoading(false);
          console.error("Upload error:", err);
          return "Upload failed";
        }
      }
    );
  }

  async function handleDelete(id){
    if(!confirm("Delete this file?")) return;
    try {
      await deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  }

  function resolveFilename(d){
    if(d.filename) return d.filename;
    if(d.file_url) return d.file_url.split("/").pop();
    if(d.file) return d.file.split("/").pop();
    return "";
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Upload Document</h2>

      <form onSubmit={handleUpload} className="space-y-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title"
          className="w-full border p-2 rounded" />
        <input type="file" onChange={e=>setFile(e.target.files[0])} className="w-full" />
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Uploaded Documents</h3>
        <div className="space-y-2">
          {docs.length === 0 && <div className="text-sm text-gray-500">No documents yet</div>}
          {docs.map(d => {
            const filename = resolveFilename(d);
            return (
              <div key={d.id} className="p-3 border rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{fileIcon(d.file_type, filename)}</div>
                  <div>
                    <div className="font-medium">{d.title}</div>
                    <div className="text-sm text-gray-600">{filename}</div>
                    {d.tags && <div className="text-xs text-indigo-600 mt-1">Tags: {d.tags}</div>}
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  {d.file_url ? (
                    <>
                      <a href={d.file_url} target="_blank" rel="noreferrer noopener" className="text-blue-600 underline text-sm">Open</a>
                      <a href={d.file_url} download className="text-sm">Download</a>
                    </>
                  ) : <span className="text-sm text-gray-500">No file</span>}

                  <button onClick={()=>handleDelete(d.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
