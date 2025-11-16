from django.db import models

# Create your models here.

def upload_path(instance, filename):
    return f"docs/{filename}"

class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=upload_path)
    content = models.TextField(blank=True)   # extracted text
    tags = models.CharField(max_length=255, blank=True)  # comma separated tags
    file_type = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def filename(self):
        return self.file.name.split("/")[-1] if self.file else ""

    def __str__(self):
        return self.title