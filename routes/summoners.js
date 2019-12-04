var express = require('express');
var router = express.Router();
const summonerCtrl = require('../controllers/summoners.js')

/* GET users listing. */
router.post('/summoners/create/:name/:accountId', summonerCtrl.create);
router.get('/summoners/:id/matches', summonerCtrl.show);
router.get('/summoners/:id/stats', summonerCtrl.stats);
router.delete('/summoners/:id', summonerCtrl.delete);
module.exports = router;