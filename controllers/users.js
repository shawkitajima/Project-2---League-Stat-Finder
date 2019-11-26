const request = require('request');
const User = require('../models/user');
const Summoner = require('../models/summoner');

module.exports = {
    index,
    new: newSummoner
}

function index(req, res, next) {
    res.render('users/index', { user: req.user });
  }

function newSummoner(req, res, next) {
    request(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${req.body.summoner}?api_key=${process.env.API_KEY}`, function(err, response) {
        let data = JSON.parse(response.body);
        request(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${data.id}?api_key=${process.env.API_KEY}`, function(err, response) {
            let mastery = JSON.parse(response.body);
            res.render('users/new', {
                data,
                mastery: mastery[0]
        })
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