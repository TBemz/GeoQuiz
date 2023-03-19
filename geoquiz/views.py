import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Score, Country


def index(request):
    return render(request, "geoquiz/index.html")


def play(request):
    return render(request, "geoquiz/play.html")


def profile(request, id):
    scores = Score.objects.filter(
        player__id=id).order_by('-value')

    if (len(scores) == 0):
        return render(request, "geoquiz/profile.html", {
            'score': 0,
            'date': 0,
            'avg': 0,
            'count': 0
        })

    else:
        top_score = scores[0]
        total_score = 0

        for score in scores:
            total_score += score.value

        avg_score = round(total_score/len(scores), 2)

        return render(request, "geoquiz/profile.html", {
            'score': top_score.value,
            'date': top_score.date,
            'avg': avg_score,
            'count': len(scores)
        })


def scoreboard(request):
    scores = Score.objects.order_by('-value')
    top_ten = scores[0:10]
    return render(request, "geoquiz/scoreboard.html", {
        'scores': top_ten
    })


# API to save a player's score
@csrf_exempt
@login_required
def save_score(request):

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    player_score = data.get("value", 0)

    new_score = Score(
        player=request.user,
        value=player_score
    )
    new_score.save()
    return JsonResponse(status=201)


# API to load country data
def countries(request, continent):

    # continent_obj = Continent.objects.filter(name=continent)
    if request.method == "GET":
        countries = Country.objects.filter(continent__name=continent)
        print(countries)
        return JsonResponse([country.serialize() for country in countries],
                            safe=False)


# API to load abbrevation dictionary
def abbreviations(request):
    if request.method == "GET":
        countries = Country.objects.all()
        abbrev_dict = {}

        for country in countries:
            if country.abbreviation != "":
                abbrev_dict[country.abbreviation] = country.name

        return JsonResponse(abbrev_dict, status=200)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "geoquiz/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "geoquiz/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "geoquiz/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "geoquiz/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "geoquiz/register.html")
