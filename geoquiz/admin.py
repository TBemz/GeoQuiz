from django.contrib import admin
from .models import Score, User, Continent, Country

# Register your models here.
admin.site.register(User)
admin.site.register(Score)
admin.site.register(Continent)
admin.site.register(Country)
