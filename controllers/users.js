const request = require('request');
const Summoner = require('../models/summoner');
const User = require('../models/user');

module.exports = {
    index,
    new: newSummoner,
}

function index(req, res, next) {
    User.findById(req.user.id).populate('summoners').exec(function(err, summoners) {
        if (err) console.log(err);
        res.render('users/index', { user: req.user, summoners});
    })
  }

function newSummoner(req, res, next) {
    request(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${req.body.summoner}?api_key=${process.env.API_KEY}`, function(err, response) {
        let data = JSON.parse(response.body);
        request(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${data.id}?api_key=${process.env.API_KEY}`, function(err, response) {
            let mastery = JSON.parse(response.body);
            request('http://ddragon.leagueoflegends.com/cdn/9.23.1/data/en_US/champion.json', function(err, response) {
                let champions = JSON.parse(response.body);
                request(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${data.accountId}?api_key=${process.env.API_KEY}`, function(err, response) {
                    let matches = JSON.parse(response.body);
                    let champion = matches.matches[0].champion;
                    let val = Object.values(champions.data).find(champ => champ.key == champion)
                    res.render('users/new', {
                        data,
                        mastery: mastery[0],
                        champion: val.id
                    });
                });
            });
        });
    });
}



