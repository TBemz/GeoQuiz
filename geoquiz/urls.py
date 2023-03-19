from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("play", views.play, name="play"),
    path("profile/<int:id>", views.profile, name="profile"),
    path("scoreboard", views.scoreboard, name="scoreboard"),

    # API Routes
    path("save_score", views.save_score, name="save_score"),
    path("countries/<str:continent>", views.countries, name="countries"),
    path("abbreviations", views.abbreviations, name="abbreviations")
]
