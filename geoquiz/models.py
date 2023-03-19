from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE


class User(AbstractUser):
    pass


class Score(models.Model):
    player = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="scores")
    value = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player}'s score of {self.value} on {self.date}"


class Continent(models.Model):
    name = models.TextField()

    def __str__(self):
        return f"{self.name}"


class Country(models.Model):
    name = models.TextField()
    continent = models.ForeignKey(Continent,
                                  on_delete=models.CASCADE,
                                  related_name="countries")
    abbreviation = models.TextField(blank=True)

    def serialize(self):
        return self.name

    def __str__(self):
        return f"{self.name}"
