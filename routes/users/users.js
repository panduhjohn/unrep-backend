const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const jwtHelper = require('./authHelpers/jwtHelper');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/create-user', userController.createUser);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

//protected API - the jsobwebtoken is the help our server to identify who you are
router.get(
    '/refresh-token',
    jwtHelper.checkRefreshTokenMiddleware,
    jwtHelper.findUserIfUserExist,
    jwtHelper.hasAuthorization,
    userController.createNewJWTAndRefreshToken
);

module.exports = router;
