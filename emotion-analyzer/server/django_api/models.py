from django.db import models

class UserProfile(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

class EmotionScan(models.Model):
    IMAGE_TYPES = [("upload", "Upload"), ("webcam", "Webcam")]
    user_email = models.EmailField()
    dominant_emotion = models.CharField(max_length=50)
    emotion_scores = models.JSONField()
    image_type = models.CharField(max_length=10, choices=IMAGE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_email} — {self.dominant_emotion}"