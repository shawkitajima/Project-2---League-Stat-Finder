const request = require('request');
const fetch = require('node-fetch');
const moment = require('moment');
const User = require('../models/user');
const Summoner = require('../models/summoner');


module.exports = {
    create,
    show,
    stats
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


function show(req, res) {
    Summoner.findById(req.params.id, function(err, summoner) {
        res.render('summoners/show', {summoner});
    })
}

function stats(req, res) {
    Summoner.findById(req.params.id, function(err, summoner) {
        let summObj = {};
        summoner.matchHistory.forEach(summ => {
            summObj[summ.championId] = {}
            summObj[summ.championId].wins = 0;
            summObj[summ.championId].losses = 0;
            summObj[summ.championId].kills = 0;
            summObj[summ.championId].deaths = 0;
            summObj[summ.championId].assists = 0;
            summObj[summ.championId].gameSeconds = 0;
            summObj[summ.championId].minionsKilled = 0;
            summObj[summ.championId].goldSpent = 0;
            summObj[summ.championId].goldEarned = 0;
            summObj[summ.championId].wardsPlaced = 0;
            summObj[summ.championId].firstBloods = 0;
            summObj[summ.championId].pentaKills = 0;
            summObj[summ.championId].totalDamageDealtToChampions = 0;
            summObj[summ.championId].totalDamageDealt = 0;
            summObj[summ.championId].totalDamageTaken = 0;
            summObj[summ.championId].turretKills = 0;
        });
        
        summoner.matchHistory.forEach(summ => {
            if (summ.win) {
                summObj[summ.championId].wins += 1;
            }
            else {
                summObj[summ.championId].losses += 1;
            }
            summObj[summ.championId].champion = summ.champion
            summObj[summ.championId].kills += summ.kills;
            summObj[summ.championId].deaths += summ.deaths;
            summObj[summ.championId].assists += summ.assists;
            summObj[summ.championId].gameSeconds += summ.gameSeconds;
            summObj[summ.championId].minionsKilled += summ.totalMinionsKilled;
            summObj[summ.championId].goldSpent += summ.goldSpent;
            summObj[summ.championId].goldEarned += summ.goldEarned;
            summObj[summ.championId].wardsPlaced += summ.wardsPlaced;
            summObj[summ.championId].totalDamageDealtToChampions += summ.totalDamageDealtToChampions;
            summObj[summ.championId].totalDamageDealt += summ.totalDamageDealt;
            summObj[summ.championId].totalDamageTaken += summ.totalDamageTaken;
            summObj[summ.championId].turretKills += summ.turretKills;
            if (summ.firstBloodKill) {
                summObj[summ.championId].firstBloods += 1;
            }
            summObj[summ.championId].pentaKills += summ.pentaKills;
        });
        res.render('summoners/stats', {summObj});
    });
}


// We need to put each of our requests into an array
// We can use Promise.all() to send off each request, maybe use fetch. It will return the responses in an array.
// We can iterate through the array, passing each object through "let data = JSON.parse(response.body)", then using the createMatchModel
// createMatchModel will return an object that we can then push to a plain array
// Then we will push the array to the actual summoner history using the spread operator
// Then we can save and redirect
function addSummonerMatches(account, summoner, res) {
    request(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${account}?api_key=${process.env.API_KEY}`, function(err, response) {
        let data = JSON.parse(response.body);
        request('http://ddragon.leagueoflegends.com/cdn/9.23.1/data/en_US/champion.json', function(err, response) {
            let champions = JSON.parse(response.body);
            request('http://ddragon.leagueoflegends.com/cdn/9.23.1/data/en_US/summoner.json', function(err, response) {
                let summoners = JSON.parse(response.body);
                request('http://static.developer.riotgames.com/docs/lol/queues.json', function(err, response) {
                    let queue = JSON.parse(response.body);
                    Summoner.findById(summoner._id, function(err, summ) {
                        fetchGames(data.matches, summ).then(arr => {
                            let pusher = [];
                            arr.forEach(match => {
                                // let matchObj = JSON.parse(match);
                                let test = createMatchModel(match, summoner.summonerName, champions, summoners, queue)
                                console.log(test);
                                pusher.push(test);
                            });
                            summ.matchHistory.push(...pusher);
                            summ.save(function(err) {
                                console.log(err);
                                res.redirect('/users');
                            });
                        }).catch(err => console.log(err));
                    });
                });
            });
        });
    });
}
    
function createMatchModel(obj, summoner, champions, summoners, queue) { 
        let id = obj.participantIdentities.find(player => player.player.summonerName === summoner);
        let playerId = id.participantId;
        let playerStats = obj.participants.find(part => part.participantId === playerId);
        let values = {};
        let val = Object.values(champions.data).find(champ => champ.key == playerStats.championId);
        let summ1 = Object.values(summoners.data).find(summ => summ.key == playerStats.spell1Id);
        let summ2 = Object.values(summoners.data).find(summ => summ.key == playerStats.spell2Id);
        let gameQueue = queue.find(queue => queue.queueId == obj.queueId);
        values.champion = val.image.full;
        values.gameId = obj.gameId;
        values.championId = playerStats.championId;
        values.mapId = gameQueue.map;
        values.gameType = obj.gameType;
        values.win = playerStats.stats.win;
        values.queueId = gameQueue.description;
        values.spell1Id = summ1.image.full;
        values.spell2Id = summ2.image.full;
        values.item0 = playerStats.stats.item0;
        values.item1 = playerStats.stats.item1;
        values.item2 = playerStats.stats.item2;
        values.item3 = playerStats.stats.item3;
        values.item4 = playerStats.stats.item4;
        values.item5 = playerStats.stats.item5;
        values.item6 = playerStats.stats.item6;
        values.kills = playerStats.stats.kills;
        values.deaths = playerStats.stats.deaths;
        values.assists = playerStats.stats.assists;
        values.totalMinionsKilled = playerStats.stats.totalMinionsKilled;
        values.goldSpent = playerStats.stats.goldSpent;
        values.goldEarned = playerStats.stats.goldEarned;
        values.totalDamageDealtToChampions = playerStats.stats.totalDamageDealtToChampions;
        values.totalDamageDealt = playerStats.stats.totalDamageDealt;
        values.totalDamageTaken = playerStats.stats.totalDamageTaken;
        values.gameSeconds = obj.gameDuration;
        values.gameDuration = moment().startOf('day').second(obj.gameDuration).format('H:mm:ss');
        values.gameCreation = obj.gameCreation;
        values.wardsPlaced = playerStats.stats.wardsPlaced;
        values.pentaKills = playerStats.stats.pentaKills;
        values.firstBloodKill = playerStats.stats.firstBloodKill;
        values.turretKills = playerStats.stats.turretKills;
        values.totalPlayerScore = playerStats.stats.totalPlayerScore;
        return values
}

function fetchGames(data, summ) {
    let urls = [];
    data.forEach((match, idx) => {
        if (idx >= 18) return;
        if (!summ.matchHistory.includes(match.gameId)) {
            urls.push(`https://na1.api.riotgames.com/lol/match/v4/matches/${match.gameId}?api_key=${process.env.API_KEY}`);
    }
    });
    const allRequests = urls.map(url => 
        fetch(url).then(response => response.json()).catch(err => console.log(err))
      )
      return Promise.all(allRequests);
}