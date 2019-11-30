const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    gameId: String,
    championId: Number,
    mapId: Number,
    gameType: String,
    win: Boolean,
    queueId: Number,
    spell1Id: Number,
    spell2Id: Number,
    item0: Number,
    item1: Number,
    item2: Number,
    item3: Number,
    item4: Number,
    item5: Number,
    item6: Number,
    kill: Number,
    deaths: Number,
    assists: Number,
    totalMinionsKilled: Number,
    goldSpent: Number,
    goldEarned: Number,
    totalDamageDealtToChampions: Number,
    totalDamageDealt: Number,
    totalDamageTaken: Number,
    gameDuration: Number,
    gameCreation: Number,
    wardsPlaced: Number,
    pentaKills: Number,
    firstBloodKill: Boolean,
    turretKills: Number,
    totalPlayerScore: String
}, {
    timestamps: true
});

const summonerSchema = new mongoose.Schema({
    accountId: String,
    summonerName: String,
    matchHistory: Array
    }, {
    timestamps: true
    });



module.exports = mongoose.model('Summoner', summonerSchema);
