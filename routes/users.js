var express = require('express');
var router = express.Router();
const userCtrl = require('../controllers/users.js')

/* GET users listing. */
router.get('/users', userCtrl.index);
router.post('/users/new', userCtrl.new);

module.exports = router;
