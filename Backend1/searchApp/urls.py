from django.urls import path
from .views import DocumentUploadView, DocumentListView, SearchView, StatsView, DocumentDeleteView

urlpatterns = [
    path("upload/", DocumentUploadView.as_view(), name="upload"),
    path("documents/", DocumentListView.as_view(), name="documents"),
    path("search/", SearchView.as_view(), name="search"),
    path("stats/", StatsView.as_view(), name="stats"),
    path("delete/<int:pk>/", DocumentDeleteView.as_view(), name="delete"),
]
