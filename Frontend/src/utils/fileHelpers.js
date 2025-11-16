// src/utils/fileHelpers.js
export function fileIcon(file_type, filename=""){
  if(file_type === "image") return "🖼️";
  if(file_type === "video") return "🎬";
  if(filename && filename.toLowerCase().endsWith(".pdf")) return "📄";
  if(filename && filename.match(/\.(docx?|pptx?|xlsx?)$/i)) return "📝";
  return "📁";
}
