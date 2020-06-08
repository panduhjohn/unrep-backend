const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const config = require("./jwtConfig");
const User = require("../model/User");

async function comparePassword(incomingPassword, userPassword) {
  try {
    let comparedPassword = await bcrypt.compare(incomingPassword, userPassword);

    if (comparedPassword) {
      return comparedPassword;
    } else {
      throw 409;
    }
  } catch (e) {
    return e;
  }
}

function createJwtToken(user) {
  let payload;

  payload = {
    email: user.email,
    _id: user._id,
    username: user.username,
  };

  let jwtToken = jwt.sign(payload, process.env.JWT_USER_SECRET_KEY, {
    expiresIn: "1h",
  });

  let jwtRefreshToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_USER_REFRESH_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );

  return {
    jwtToken,
    jwtRefreshToken,
  };
}

const checkAuthMiddleware = expressJwt({
  secret: process.env.JWT_USER_SECRET_KEY || config["JWT_USER_SECRET_KEY"],
  userProperty: "auth",
});

const findUserIfUserExist = async (req, res, next) => {
  const { _id } = req.auth;

  try {
    const foundUser = await User.findById({ _id: _id }).select(
      "-__v -password -userCreated"
    );

    req.profile = foundUser;
    next();
  } catch (e) {
    return res.status(404).json({
      error: "User does not exist",
    });
  }

  //if user exist
  //set user to req.profile
};

const hasAuthorization = (req, res, next) => {
  //check req.profile with req.auth if they match
  //....

  const authorized = req.profile && req.auth && req.profile._id == req.auth._id;

  if (!authorized) {
    return res.status("403").json({
      error: "User is not authorized",
    });
  } else {
    next();
  }
};

const checkRefreshTokenMiddleware = expressJwt({
  secret:
    process.env.JWT_USER_REFRESH_SECRET_KEY ||
    config["JWT_USER_REFRESH_SECRET_KEY"],
  userProperty: "auth",
});

const customJWTVerify = (req, res, next) => {
  let token = req.headers.authorization.replace("Bearer ", " ").trim();

  jwt.verify(token, process.env.JWT_USER_SECRET_KEY, function (err, decoded) {
    if (err) {
      res.status(401).json({ message: "unauthorized" });
    } else {
      req.auth = decoded;

      next();
    }
  });
};

let customJWTRefreshVerify = (req, res, next) => {
  let token = req.headers.cookie.split("=");
  jwt.verify(token[1], process.env.JWT_USER_REFRESH_SECRET_KEY, function (
    err,
    decoded
  ) {
    if (err) {
      res.status(401).json({ message: "unauthorize" });
    } else {
      req.auth = decoded;
      next();
    }
  });
};

module.exports = {
  comparePassword,
  createJwtToken,
  checkAuthMiddleware,
  findUserIfUserExist,
  hasAuthorization,
  checkRefreshTokenMiddleware,
  customJWTVerify,
  customJWTRefreshVerify,
};

//Compare user password
//if user password matches
//return a jwt Token
//else

//create user functions
//1 compare password
//2. create jwt token function
//3 these two function gets called in the login controller
