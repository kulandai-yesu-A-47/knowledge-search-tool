# views.py
import os
import logging

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.conf import settings

from .models import Document
from .serializers import DocumentSerializer
from . import utils

logger = logging.getLogger(__name__)

class DocumentUploadView(generics.CreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        # Save first (so file + db row exist)
        doc = serializer.save()

        # Resolve file path carefully
        file_path = None
        try:
            if hasattr(doc.file, "path"):
                file_path = doc.file.path
            else:
                candidate = os.path.join(settings.MEDIA_ROOT or "", doc.file.name or "")
                if os.path.exists(candidate):
                    file_path = candidate
        except Exception as e:
            logger.warning("Could not determine file path: %s", e)

        # Safe extraction: never raise to caller
        try:
            if file_path and os.path.exists(file_path):
                doc.content = utils.extract_text_from_file(file_path) or ""
            else:
                doc.content = ""
        except Exception as e:
            logger.exception("Text extraction failed for doc %s: %s", getattr(doc, "id", "<no id>"), e)
            doc.content = ""

        # File type detection (safe)
        try:
            ext = os.path.splitext(doc.file.name)[1].lower() if doc.file else ""
            if ext in [".pdf", ".docx", ".doc", ".txt", ".pptx", ".ppt", ".xlsx", ".xls"]:
                doc.file_type = "document"
            elif ext in [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp", ".svg"]:
                doc.file_type = "image"
            elif ext in [".mp4", ".mov", ".mkv", ".avi", ".webm"]:
                doc.file_type = "video"
            else:
                doc.file_type = doc.file_type or "other"
        except Exception as e:
            logger.warning("File type detection error: %s", e)
            doc.file_type = doc.file_type or "other"

        # Auto-tag if empty
        try:
            if not (doc.tags and doc.tags.strip()):
                doc.tags = utils.auto_tag(doc.content)
        except Exception as e:
            logger.exception("Auto-tagging failed: %s", e)

        # Save updated fields (content/tags/file_type)
        try:
            doc.save()
        except Exception as e:
            logger.exception("Saving doc after extraction failed: %s", e)

        # Index document but don't let index failure break the upload response
        try:
            utils.index_document(doc)
        except Exception as e:
            logger.exception("Indexing failed for doc %s: %s", getattr(doc, "id", "<no id>"), e)


class DocumentListView(generics.ListAPIView):
    queryset = Document.objects.all().order_by("-created_at")
    serializer_class = DocumentSerializer

    def get_serializer_context(self):
        return {"request": self.request}


class SearchView(APIView):
    """
    /api/search/?q=...
    Tries Whoosh first; if Whoosh returns no results, falls back to DB icontains search.
    Returns list of results with id, title, snippet, file_url, filename, tags.
    """
    def get(self, request):
        q = request.GET.get("q", "")
        if not q:
            return Response([], status=status.HTTP_200_OK)

        # Try whoosh first
        results = utils.search_query(q)
        out = []

        if results:
            for item in results:
                try:
                    doc = get_object_or_404(Document, pk=int(item["id"]))
                    file_url = request.build_absolute_uri(doc.file.url) if doc.file else ""
                    out.append({
                        "id": doc.id,
                        "title": doc.title,
                        "snippet": item.get("snippet", ""),
                        "file_url": file_url,
                        "filename": os.path.basename(doc.file.name) if doc.file else "",
                        "tags": doc.tags or item.get("tags", "")
                    })
                except Exception:
                    continue
            return Response(out)

        # DB fallback
        try:
            logger.debug("Whoosh returned 0 results; using DB fallback search for query: %s", q)
            qs = Document.objects.filter(
                Q(title__icontains=q) | Q(content__icontains=q) | Q(tags__icontains=q)
            ).order_by("-created_at")[:50]

            for doc in qs:
                file_url = request.build_absolute_uri(doc.file.url) if doc.file else ""
                snippet = (doc.content or "")[:400].replace("\n", " ")
                out.append({
                    "id": doc.id,
                    "title": doc.title,
                    "snippet": snippet,
                    "file_url": file_url,
                    "filename": os.path.basename(doc.file.name) if doc.file else "",
                    "tags": doc.tags or ""
                })
            return Response(out)
        except Exception as e:
            logger.exception("DB fallback search failed for query %s: %s", q, e)
            return Response([], status=status.HTTP_200_OK)


class StatsView(APIView):
    def get(self, request):
        total = Document.objects.count()
        last = Document.objects.order_by("-created_at").first()
        last_info = None
        if last:
            last_info = {
                "id": last.id,
                "title": last.title,
                "created_at": last.created_at,
                "filename": last.file.name.split("/")[-1] if last.file else ""
            }
        return Response({"total_documents": total, "last_uploaded": last_info})


class DocumentDeleteView(APIView):
    def delete(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
            # delete actual file (storage backend will handle)
            try:
                doc.file.delete(save=False)
            except Exception as e:
                logger.warning("Error deleting file for doc %s: %s", pk, e)

            # delete DB row
            doc.delete()

            # remove from index too
            try:
                utils.delete_document_index(pk)
            except Exception as e:
                logger.warning("Failed to remove document from search index: %s", e)

            return Response({"message": "Deleted"}, status=200)
        except Document.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
