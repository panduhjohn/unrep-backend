const bcrypt = require('bcryptjs');
const User = require('../model/User');
const dbErrorHelper = require('../authHelpers/dbErrorHelper');
const jwtHelper = require('../authHelpers/jwtHelper');

module.exports = {
    createUser: async (req, res) => {
        try {
            let createdUser = await new User({
                email: req.body.email,
                password: req.body.password,
                username: req.body.username,
            });

            let genSalt = await bcrypt.genSalt(12);
            let hashedPassword = await bcrypt.hash(
                createdUser.password,
                genSalt
            );
            createdUser.password = hashedPassword;

            await createdUser.save();

            res.status(200).json({ message: 'User Created' });
        } catch (error) {
            res.status(500).json({ message: dbErrorHelper(error) });
        }
    },

    login: async (req, res) => {
        try {
            console.log(req.body);
            let foundUser = await User.findOne({
                email: req.body.email,
            }).select('-__v -password'); //? if you put a - in the select it removes them

            if (foundUser === null) {
                throw Error('User not found, please sign up'); //? throw goes to an error block
            }

            let comparedPassword = await jwtHelper.comparePassword(
                req.body.password,
                foundUser.password
            );

            if (comparedPassword === 409) {
                throw Error('Check email and password');
            }

            let jwtTokenObj = jwtHelper.createJwtToken(foundUser);

            res.cookie('jwt-cookie-expense', jwtTokenObj.jwtToken, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production' ? true : false,
            });
            res.cookie(
                'jwt-cookie-refresh-expense',
                jwtTokenObj.jwtRefreshToken,
                {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    httpOnly: false,
                    secure:
                        process.env.NODE_ENV === 'production' ? true : false,
                }
            );

            foundUser = foundUser.toObject();
            delete foundUser.password;

            res.json({ user: foundUser });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: dbErrorHelper(error) });
        }
    },

    logout: (req, res) => {
        res.clearCookie('jwt-cookie-expense');
        res.clearCookie('jwt-cookie-refresh-expense');
        res.end();
    },

    createNewJWTAndRefreshToken: (req, res) => {
        try {
            let jwtTokenObj = jwtHelper.createJwtToken(req.profile);

            res.cookie('jwt-cookie-expense', jwtTokenObj.jwtToken, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production' ? true : false,
            });

            res.cookie(
                'jwt-cookie-refresh-expense',
                jwtTokenObj.jwtRefreshToken,
                {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    httpOnly: false,
                    secure:
                        process.env.NODE_ENV === 'production' ? true : false,
                }
            );

            res.status(200).json({
                message: 'Successfully renewed token and refresh token',
            });
        } catch (e) {
            res.status(500).json({ message: dbErrorHelper(e) });
        }
    },
};

