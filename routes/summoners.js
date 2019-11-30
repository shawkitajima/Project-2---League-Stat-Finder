var express = require('express');
var router = express.Router();
const summonerCtrl = require('../controllers/summoners.js')

/* GET users listing. */
router.post('/summoners/create/:name/:accountId', summonerCtrl.create);

module.exports = router;