const request = require('request');
const fetch = require('node-fetch');
const User = require('../models/user');
const Summoner = require('../models/summoner');

module.exports = {
    create
}

function create(req, res, next) {
    let summonerName = req.params.name;
    let accountId = req.params.accountId;
    Summoner.create({
        summonerName,
        accountId
    }, function(err, summoner) {
        req.user.summoners.push(summoner._id);
        req.user.save(function(err) {
            addSummonerMatches(accountId, summoner, res);
        });
    });
}


// function addSummonerMatches(account, summoner, res) {
//     request(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${account}?api_key=${process.env.API_KEY}`, function(err, response) {
//         let data = JSON.parse(response.body);
//         Summoner.findById(summoner._id, function(err, summ) {
//             let arr = [];
//             data.matches.forEach(match => {
//                 if (!summ.matchHistory.includes(match.gameId)) {
//                     arr.push(match.gameId);
//             }
//             });
//             summ.matchHistory.push(...arr);
//             summ.save(function(err) {
//                 res.redirect('/users');
//             });
//         });
//     });
// }


// We need to put each of our requests into an array
// We can use Promise.all() to send off each request, maybe use fetch. It will return the responses in an array.
// We can iterate through the array, passing each object through "let data = JSON.parse(response.body)", then using the createMatchModel
// createMatchModel will return an object that we can then push to a plain array
// Then we will push the array to the actual summoner history using the spread operator
// Then we can save and redirect
function addSummonerMatches(account, summoner, res) {
    request(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${account}?api_key=${process.env.API_KEY}`, function(err, response) {
        let data = JSON.parse(response.body);
        Summoner.findById(summoner._id, function(err, summ) {
            fetchGames(data.matches, summ).then(arr => {
                let pusher = [];
                arr.forEach(match => {
                    // let matchObj = JSON.parse(match);
                    let test = createMatchModel(match, summoner.summonerName)
                    console.log(test);
                    pusher.push(test);
                });
                summ.matchHistory.push(...pusher);
                summ.save(function(err) {
                    res.redirect('/users');
                });
            }).catch(err => console.log(err));
        });
    });
}

function createMatchModel(obj, summoner) { 
    let id = obj.participantIdentities.find(player => player.player.summonerName === summoner);
    let playerId = id.participantId;
    let playerStats = obj.participants.find(part => part.participantId === playerId);
    let values = {};
    values.gameId = obj.gameId;
    values.championId = playerStats.championId;
    values.mapId = obj.mapId;
    values.gameType = obj.gameType;
    values.win = playerStats.stats.win;
    values.queueId = obj.queueId;
    values.spell1Id = playerStats.spell1Id;
    values.spell2Id = playerStats.spell2Id;
    values.item0 = playerStats.stats.item0;
    values.item1 = playerStats.stats.item1;
    values.item2 = playerStats.stats.item2;
    values.item3 = playerStats.stats.item3;
    values.item4 = playerStats.stats.item4;
    values.item5 = playerStats.stats.item5;
    values.item6 = playerStats.stats.item5;
    values.kill = playerStats.stats.kills;
    values.deaths = playerStats.stats.deaths;
    values.assists = playerStats.stats.assists;
    values.totalMinionsKilled = playerStats.stats.totalMinionsKilled;
    values.goldSpent = playerStats.stats.goldSpent;
    values.goldEarned = playerStats.stats.goldEarned;
    values.totalDamageDealtToChampions = playerStats.stats.totalDamageDealtToChampions;
    values.totalDamageDealt = playerStats.stats.totalDamageDealt;
    values.totalDamageTaken = playerStats.stats.totalDamageTaken;
    values.gameDuration = obj.gameDuration;
    values.gameCreation = obj.gameCreation;
    values.wardsPlaced = playerStats.stats.wardsPlaced;
    values.pentaKills = playerStats.stats.pentaKills;
    values.firstBloodKill = playerStats.stats.firstBloodKill;
    values.turretKills = playerStats.stats.turretKills;
    values.totalPlayerScore = playerStats.stats.totalPlayerScore;
    return values;
}

function fetchGames(data, summ) {
    let urls = [];
    data.forEach(match => {
        if (!summ.matchHistory.includes(match.gameId)) {
            urls.push(`https://na1.api.riotgames.com/lol/match/v4/matches/${match.gameId}?api_key=${process.env.API_KEY}`);
    }
    });
    const allRequests = urls.map(url => 
        fetch(url).then(response => response.json()).catch(err => console.log(err))
      )
      return Promise.all(allRequests);
}