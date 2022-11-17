// Imports and shit
const bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');
var app = express();
var holdem = require('holdem-monte-carlo-evaluator');

// Server preparation
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Endpoints
app.post('/chances', function (req, res) {
    console.log(req.body);
    let ch = calculateOdds(req.body);
    console.log(ch);
    console.log(JSON.stringify(ch));
    res.end(JSON.stringify(ch));
});

// Start server
var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Running: http://%s:%s", host, port)
});

// Compute request
function calculateOdds(gameState) {
    console.log(gameState);
    let result = holdem.holdemMonteCarlo(gameState.myHand, gameState.commCards, gameState.opponentCount, [], 100000);
    let runs = result.results.runs;
    let chances = new Chances(
        (result.results.wins / runs * 100),
        (result.results.ties / runs * 100),
        (result.results.losses / runs * 100)
    );
    return chances;
}

class Chances {
    constructor(winChance, tieChance, loseChance) {
        this.winChance = winChance;
        this.tieChance = tieChance;
        this.loseChance = loseChance;
    }
    winChance;
    tieChance;
    loseChance;
}
