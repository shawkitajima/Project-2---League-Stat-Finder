const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    champion: String,
    gameId: String,
    championId: Number,
    mapId: String,
    gameType: String,
    win: Boolean,
    queueId: String,
    spell1Id: String,
    spell2Id: String,
    item0: Number,
    item1: Number,
    item2: Number,
    item3: Number,
    item4: Number,
    item5: Number,
    item6: Number,
    kills: Number,
    deaths: Number,
    assists: Number,
    totalMinionsKilled: Number,
    goldSpent: Number,
    goldEarned: Number,
    totalDamageDealtToChampions: Number,
    totalDamageDealt: Number,
    totalDamageTaken: Number,
    gameDuration: String,
    gameSeconds: Number,
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
    matchHistory: [matchSchema],
    users: Array
    }, {
    timestamps: true
    });



module.exports = mongoose.model('Summoner', summonerSchema);
