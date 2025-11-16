// src/pages/AllFilesPage.jsx
import React, { useEffect, useState } from "react";
import { listDocuments, deleteDocument } from "../api";
import { fileIcon } from "../utils/fileHelpers";
import toast from "react-hot-toast";

export default function AllFilesPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await listDocuments();
        setDocs(d);
      } catch (e) {
        console.error("Failed loading documents:", e);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this file?")) return;
    try {
      await deleteDocument(id);
      setDocs((prev) => prev.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  }
  
  function openModal(doc) {
    setSelected(doc);
    setShowModal(true);
  }

  function getExtension(filenameOrUrl = "") {
    try {
      const url = new URL(filenameOrUrl, window.location.origin);
      const path = url.pathname || filenameOrUrl;
      const parts = path.split(".");
      return parts.length > 1 ? parts.pop().toLowerCase() : "";
    } catch (e) {
      const parts = (filenameOrUrl || "").split(".");
      return parts.length > 1 ? parts.pop().toLowerCase() : "";
    }
  }

  function resolveFilename(d) {
    if (d.filename) return d.filename;
    if (d.file_url) return d.file_url.split("/").pop();
    if (d.file) return d.file.split("/").pop();
    return "";
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Documents</h2>

      {loading ? (
        <div>Loading…</div>
      ) : docs.length === 0 ? (
        <div className="text-sm text-gray-500">No documents uploaded yet.</div>
      ) : (
        <div className="grid gap-3">
          {docs.map((d) => {
            const filename = resolveFilename(d);
            return (
              <div
                key={d.id}
                className="p-3 border rounded flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {d.thumbnail_url ? (
                    <img
                      src={d.thumbnail_url}
                      alt={filename}
                      className="w-24 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="text-2xl">
                      {fileIcon(d.file_type, filename)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{d.title}</div>
                    <div className="text-sm text-gray-600">{filename}</div>
                    {d.tags && (
                      <div className="text-xs text-indigo-600 mt-1">
                        Tags: {d.tags}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => openModal(d)}
                    className="text-blue-600 underline text-sm"
                  >
                    Open
                  </button>

                  {d.file_url ? (
                    <a
                      href={d.file_url}
                      download
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">No file URL</span>
                  )}

                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[80%] h-[80%] rounded shadow-lg p-4 relative">
            <button
              aria-label="Close"
              className="absolute top-2 right-2 text-red-600 text-xl"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>
            <h3 className="font-semibold mb-2">{selected.title}</h3>

            <div className="h-[90%] flex items-center justify-center">
              {(() => {
                const url = selected.file_url || selected.file || "";
                if (!url) {
                  console.debug("Preview: no file_url available for", selected);
                  return (
                    <div className="text-gray-500">
                      No file URL (cannot preview)
                    </div>
                  );
                }

                const ext = getExtension(selected.filename || url);
                // image
                if (
                  ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg"].includes(
                    ext
                  )
                ) {
                  return (
                    <img
                      src={url}
                      alt={selected.filename || ""}
                      className="w-full h-full object-contain"
                    />
                  );
                }

                // video
                if (["mp4", "webm", "mov", "mkv", "avi"].includes(ext)) {
                  return (
                    <video controls className="w-full h-full bg-black">
                      <source src={url} />
                      Your browser does not support video preview.
                    </video>
                  );
                }

                // pdf
                if (ext === "pdf") {
                  // try iframe first
                  return (
                    <iframe
                      src={url}
                      className="w-full h-full border"
                      title={selected.filename || "document preview"}
                    />
                  );
                }

                // try generic object/embed for other web-friendly types (may or may not work)
                if (["txt", "html", "htm"].includes(ext)) {
                  return (
                    <iframe
                      src={url}
                      className="w-full h-full border"
                      title={selected.filename || "preview"}
                    />
                  );
                }

                // fallback: provide download + a helpful message
                console.debug(
                  "Preview not supported for extension:",
                  ext,
                  "url:",
                  url,
                  "selected:",
                  selected
                );
                return (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div>
                      No in-browser preview available for this file type.
                    </div>
                    <a
                      href={url}
                      download
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 text-blue-600 underline"
                    >
                      Download
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
