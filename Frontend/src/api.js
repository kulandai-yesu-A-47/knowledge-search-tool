import axios from "axios";
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  timeout: 20000,
});
export async function uploadDocument(title, file){
  const fd = new FormData();
  fd.append("title", title);
  fd.append("file", file);
  const res = await API.post("/upload/", fd, { headers: { "Content-Type": "multipart/form-data" }});
  return res.data; // now contains file_url, filename, file_type, tags
}

export async function listDocuments(){
  const res = await API.get("/documents/");
  return res.data;
}

export async function searchQuery(q){
  const res = await API.get("/search/", { params:{ q } });
  return res.data;
}

export async function deleteDocument(id){
  const res = await API.delete(`/delete/${id}/`);
  return res.data;
}

export async function stats(){
  const res = await API.get("/stats/");
  return res.data;
}


export default API;
