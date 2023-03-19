class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            current_continent: "Asia",
            asia_total: 0,
            asia_remaining: [],
            asia_correct: [],
            
            africa_total: 0,
            africa_remaining: [],
            africa_correct: [],
            
            europe_total: 0,
            europe_remaining: [],
            europe_correct: [],

            north_america_total: 0,
            north_america_remaining: [],
            north_america_correct: [],

            oceania_total: 0,
            oceania_remaining: [],
            oceania_correct: [],

            south_america_total: 0,
            south_america_remaining: [],
            south_america_correct: [],

            response: "",
            score: 0,
            incorrect: false,
            game_over: false,
            seconds: 30,
            started: false,
            abbrev_list: [],
            verbose_list: []
        };
        this.timer = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = this.countDown.bind(this);
        this.startGame = this.startGame.bind(this);
        this.endGame = this.endGame.bind(this);
    }

    // following functions manage the timer when game is in session
    componentDidMount() {
        this.setState({ seconds: this.state.seconds });
    }

    startTimer() {
        this.timer = setInterval(this.countDown, 1000);
    }

    countDown() {
        let new_seconds = this.state.seconds - 1;
        this.setState({
            seconds: new_seconds,
        });
        
        // if the timer reaches 0, end the game
        if (new_seconds === 0) {
            this.endGame();
        }
    }

    // render to the screen, depending if the player has won the game, has yet to
    // start the game, or is currently playing the game
    render() {
        if (this.state.game_over === true){
            return this.renderGameOverScreen();
        } else if (this.state.started === false) {
            return this.renderStartScreen();
        } else {
            return this.renderProblem();
        }
    }

    // render the start game message
    renderStartScreen() {
        return ( 
            <div className="mt-5"> 
                <button type="button" className="btn btn-geo" id="start" onClick={this.startGame}>Start Game</button>
            </div>
        );
    }

    // handle button click to start/restart a game
    startGame(){
        
        this.resetGame();
        
        this.setState(state => ({
            game_over: false,
            started: true
        }));
    }

    // reset the game state for start of a new game, pulling continent/country data from the API
    resetGame(){
        const continents = ["Asia", "Africa", "Europe", "North America", "Oceania", "South America"];
        const continent_dict = {};
        let counter = 0;

        // get continent data from API
        continents.forEach(continent => {
            fetch(`/countries/${continent}`)
            .then(response => response.json())
            .then(result => {
                continent_dict[continent]=result
                counter++;
                
                // if we've gotten all the continent data, refresh the game state
                if (counter === 6){
                    this.refreshGameState(continent_dict)
                }
            });
        })
    }

    // update the game state
    refreshGameState(continent_dict) {
        const randomContinent = this.changeContinent();
        
        this.setState(state => ({
            current_continent: randomContinent,            
            asia_remaining: continent_dict["Asia"],
            asia_correct: [],
            asia_total: continent_dict["Asia"].length,
            
            africa_remaining: continent_dict["Africa"],
            africa_correct: [],
            africa_total: continent_dict["Africa"].length,
            
            europe_remaining: continent_dict["Europe"],
            europe_correct: [],
            europe_total: continent_dict["Europe"].length,

            north_america_remaining: continent_dict["North America"],
            north_america_correct: [],
            north_america_total: continent_dict["North America"].length,

            oceania_remaining: continent_dict["Oceania"],
            oceania_correct: [],
            oceania_total: continent_dict["Oceania"].length,

            south_america_remaining: continent_dict["South America"],
            south_america_correct: [],
            south_america_total: continent_dict["South America"].length,

            response: "",
            score: 0,
            incorrect: false,
            seconds: 30,
            game_over: false,
        }));

        // use API to pull list of common country abbreviations
        fetch('/abbreviations')
        .then(response => response.json())
        .then(result => {
            
            this.setState(state => ({
                abbrev_list: Object.keys(result),
                verbose_list: Object.values(result)
            }));     
        });

        // start the timer when the game begins
        this.startTimer();
    }

    // when the game is over, save the player's score and render the game over page
    renderGameOverScreen() {
        fetch('/save_score', {
            method: 'POST',
            body: JSON.stringify({
                value: this.state.score
            })
        });
        
        return (<div>
                <div id="game_over">Your score: {this.state.score}</div>
                <button type="button" className="btn btn-geo" id="start" onClick={this.startGame}>Try again</button>
            </div>
        );
    }

    // handle game over conditions
    endGame(){
        
        // clear the timer interval to prevent the game from repeatedly saving the player's score
        clearInterval(this.timer);
        this.setState(state => ({
            game_over: true,
            started: false,
            score: state.score + state.seconds
        }))
    }

    // render geography questions for the player to answer
    renderProblem() {
        const formatted_continent = this.handleContinent(this.state.current_continent);
        
        return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-8">
                    <h5>Name a country in:</h5>
                    <div className={formatted_continent} id="continent">{this.state.current_continent}</div>
                    <input className="d-block m-0 m-auto" onKeyPress={this.inputKeyPress} onChange={this.updateResponse} autoFocus={true} value={this.state.response} />

                    <button type="button" className="btn btn-danger m-3" id="start" onClick={this.endGame}>I give up</button>

                    <div>Countries answered correctly: {this.state[formatted_continent + 
                    "_correct"].length} / {this.state[formatted_continent+ "_total"]}
                    </div>

                    {this.state[formatted_continent+ "_correct"].map(country => {
                        return <div className="d-inline mr-2">{this.capitalize(country)} </div>
                    })}
                </div>
                
                <div className="col-4">
                    <i className="bi bi-alarm timer"></i>
                    <h5 className="d-inline-block">Time remaining: {this.state.seconds}</h5>
                    <div className={this.state.incorrect ? "incorrect" : ""}>Score: {this.state.score}</div>
                </div>
            </div>
        </div>);
    }

    // take an all lowercase country name and capitalizes it appropriately
    // (first letter of each word)
    capitalize(country){
        return country.replace(/\w\S*/g, function(old_name){
            return old_name.charAt(0).toUpperCase() + old_name.substr(1);
        });
    }

    // change the form of a continent from standard English to all lowercase and w/ underscores instead of spaces.
    // Used for accessing most of the states pertaining to specific continents
    handleContinent(continent){
    return continent.split(' ').join('_').toLowerCase();
    }

    // respond to player input (entering a country during the game)
    inputKeyPress = (event) => {
        if (event.key === "Enter") {
            
            // convert the player's answer to lowercase. Check to see if they used an
            // abbreviation, and convert appropriately. Then check the answer
            let answer = this.state.response.toLowerCase();
            answer = this.checkAbbreviations(answer);
            this.checkAnswer(answer);
        }
    }

    // check the answer against the data saved in state
    checkAnswer(answer){

        const formatted_continent = this.handleContinent(this.state.current_continent);

        // if the player has already guessed that country, just clear the input field (no points deducted)
        if (this.state[formatted_continent + "_correct"].includes(answer) ||
            answer === "") {
            this.setState(state => ({
                response: "",
                incorrect: false
            }));

        // if the player got the question right, change the continent, mark the country as correct, and
        // increase the player's score by 10
        } else if (this.state[formatted_continent + "_remaining"].includes(answer)) {

            // add 4 seconds to the timer
            this.setState(state => ({
                seconds: state.seconds + 4
            }));
            
            // set up variables to alter our state
            const continent_name = formatted_continent;
            const continent_correct = continent_name + "_correct";
            const continent_remaining = continent_name + "_remaining";

            // remove the country from the continent's list of remaining countries to guess
            this.removeCountry(answer, continent_remaining);

            // if there are no countries left to guess in the continent, add 50
            // to the player score and 15 seconds to the timer
            if (this.state[continent_remaining].length === 0){
                this.setState(state => ({
                    score: state.score + 50,
                    seconds: state.seconds + 12
                }));
            }

            // if all continents are complete, the player has won
            if (this.state.asia_remaining.length === 0 && 
                this.state.africa_remaining.length === 0 &&
                this.state.europe_remaining.length === 0 &&
                this.state.north_america_remaining.length === 0 &&
                this.state.oceania_remaining.length === 0 &&
                this.state.south_america_remaining.length === 0){
                    this.endGame();
            
            // otherwise, pick a new continent
            } else {
                let new_continent;
                let new_continent_remaining;
                
                // change the continent, but skip continents with no countries remaining
                do {
                    new_continent = this.changeContinent();
                    new_continent_remaining = this.handleContinent(new_continent) + "_remaining";
                } while (this.state[new_continent_remaining].length === 0);

                // add the above changes to the game state
                this.setState(state => ({
                    [continent_correct]: this.state[continent_correct].concat(answer), 
                    current_continent: new_continent,
                    score: state.score + 10,
                    response: "",
                    incorrect: false
                }));
            }
        
        // lastly, if the player answered incorrectly, subtract 3 from their score, turn on the incorrect 
        // tag, and reset the input field to blank
        } else {
            this.setState(state => ({
                score: state.score - 3,
                incorrect: true,
                response: ""
            }));
        }
    }


    // check if the player entered a common country abbreviation.
    // If so, convert it to its verbose form
    checkAbbreviations(answer){
        if (this.state.abbrev_list.includes(answer)){
            const abbrev_index = this.state.abbrev_list.indexOf(answer);
            return this.state.verbose_list[abbrev_index]
        } else {
            return answer
        }
    }

    // remove a country from a continent's list of remaining country. Used when a player
    // has correctly guessed a country to prevent them from reguessing it
    removeCountry(country, continent_remaining){
        let country_list = this.state[continent_remaining];
        
        for (let i = 0; i < country_list.length; i++){
            if (country === country_list[i]){
                country_list.splice(i, 1);
                this.setState({[this.state[continent_remaining]]: country_list});
                break;
            }
        }
    }

    // randomly select a new continent
    changeContinent(){
        const new_continent_index = this.randomInt(6);
        const continents = ["Asia", "Africa", "Europe", "North America", "Oceania", "South America"];
        return continents[new_continent_index];
    }

    // randomly select an int between 0 and max
    randomInt(max){
        return Math.floor(Math.random() * max);
    }

    // check for state change after event
    updateResponse = (event) => {
        this.setState({
            response: event.target.value
        });
    }
}

ReactDOM.render(<App />, document.querySelector("#app"));