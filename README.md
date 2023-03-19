Tyler Bembenek
May 2021


Welcome to GeoQuiz, the online geography game!


** Launching the Game **

GeoQuiz is a React/Django-based game that doesn't use any other extensions, packages, or frameworks.
To launch the game, follow these steps:

1. Navigate to this directory
2. In Python, run: manage.py runserver
3. Open a web browser (ideally Chrome) and go to http://127.0.0.1:8000/
4. Enjoy!


** Navigating the Site **

Once you've registered and logged in, there will be 5 links on the top navigation panel. The "GeoQuiz" link on the upper left takes you to the homepage, which explains the game rules in depth. The next link will be your username. Clicking there will bring you to a page with your game statistics (your high score, average score, and how many games you've played). Next in the navigation tab is a link to "Play" the game. Second from the end is the "Scoreboard", where you can find a list of the highest scores from any and all players. Lastly, is an option to "Log Out".


** Files **

models.py -- contains 4 models: User, Score (to record player score), Continent (mainly for use as a foreign key for country data), and Country (holding all the important gameplay data)

urls.py -- various urls, including 3 API routes

views.py -- includes 3 different API endpoints: save_score, countries, and abbreviations. save_score is for saving a players score, countries is for loading in all the country data at the start of a game, and abbreviations similarly loads in country abbrevations. The save_score API is called once at the end of each game, while the countries and abbreviations APIs are both called once at the beginning of each match. This allows an admin to update the country date easily, but also limits the number of API calls to just 1 per API per game.

HTML files for various pages in templates/geoquiz/...
* index
* layout
* login
* play
* profile
* register
* scoreboard

static/geoquiz/script -- the main file for this web app, including all of the React code needed to run the game. I chose to use React because it seemed like a strong framework for creating a dynamic gameplay environment, particularly its use of a state machine. Major variables such as the countries in each continent, countries the player has guessed correctly, etc. are held in states, while a variety of helper functions examine/modifiy/test player input or modify gameplay variables such as the timer. Please see file comments for more details.

![alt text](https://github.com/TBemz/GeoQuiz/blob/main/Images/geoquiz-1.PNG "Main screen")

![alt text](https://github.com/TBemz/GeoQuiz/blob/main/Images/geoquiz-2.PNG "Login screen")

![alt text](https://github.com/TBemz/GeoQuiz/blob/main/Images/geoquiz-3.PNG "Play screen")
