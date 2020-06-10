const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const User = require('../model/User');
const config = require('./jwtConfig');
// compare user password
// if user password matches return a JWT token

//create user functions
//1 compare password functions
//2 create JWT token function
//3 these 2 functions gets called in login controller

async function comparePassword(incomingPassword, userPassword) {
    try {
        // User.findOne({ email: req.body.email });
        //use bcrypt to compare password
        let comparedPassword = await bcrypt.compare(
            incomingPassword,
            userPassword
        );
        //if you compare the password there's only true or false
        if (comparedPassword) {
            //if password is good return the value
            return comparePassword;
        } else {
            //? throw an error
            // throw Error('Passwords do not match');
            throw 409;
        }
    } catch (err) {
        return err;
    }
}

function createJwtToken(user) {
    let payload;

    payload = {
        email: user.email,
        _id: user._id,
        username: user.username,
    };

    let jwtToken = jwt.sign(payload, process.env.JWT_USER_SECRET, {
        expiresIn: '10h',
    });

    let jwtRefreshToken = jwt.sign(
        { _id: user._id },
        process.env.JWT_USER_REFRESH_SECRET,
        {
            expiresIn: '7d',
        }
    );

    return {
        jwtToken,
        jwtRefreshToken,
    };
}

const checkAuthMiddleware = expressJwt({
    secret: process.env.JWT_USER_SECRET || config['JWT_USER_SECRET'],
    userProperty: 'auth',
});

const findUserIfUserExist = async (req, res, next) => {
    const { _id } = req.auth;

    try {
        //if user exists
        const foundUser = await User.findById({ _id: _id }).select(
            '-__v -password'
        );

        // set user to req.profile
        req.profile = foundUser;
        next();
    } catch (e) {
        return res.status(404).json({
            error: 'User does not exist',
        });
    }
};

const hasAuthorization = (req, res, next) => {
    //check req.profile with req.auth, if they match
    // console.log('profile', req.profile);
    // console.log('auth', req.auth);
    const authorized =
        req.profile && req.auth && req.profile._id == req.auth._id;

    if (!authorized) {
        return res.status(403).json({
            error: 'User is not authorized',
        });
    } else {
        next();
    }
};

const checkRefreshTokenMiddleware = expressJwt({
    secret:
        process.env.JWT_USER_REFRESH_SECRET ||
        config['JWT_USER_REFRESH_SECRET'],
    userProperty: 'auth',
});

const customJWTVerify = (req, res, next) => {
    let token = req.headers.cookie.split('=');
    jwt.verify(
        token[1],
        process.env.JWT_USER_SECRET || config['JWT_USER_SECRET'],
        function (err, decoded) {
            if (err) {
                res.status(401).json({ message: 'unauthorized' });
            } else {
                req.auth = decoded;
                next();
            }
        }
    );
};

module.exports = {
    comparePassword,
    createJwtToken,
    checkAuthMiddleware,
    findUserIfUserExist,
    hasAuthorization,
    checkRefreshTokenMiddleware,
    customJWTVerify,
};
