const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const jwtHelper = require("./authHelpers/jwtHelper");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/create-user", userController.createUser);
router.post("/login", userController.login);
router.get("/logout", userController.logout);

router.get("/profile", (req, res, next) => {
  return res.redirect("/");
  //   if (req.isAuthenticated()) {
  //     return res.render("auth/profile");
  //   } else {
  //     return res.send("Unauthorized");
  //   }
});
router.put("/update-profile", (req, res, next) => {
  userController
    .updateProfile(req.body, req.user._id)
    .then((user) => {
      return res.redirect("/api/users/profile");
    })
    .catch((err) => {
      console.log(
        err,
        " catch error for notconnecting to profile page properly"
      );
      return res.redirect("/api/users/update-profile");
    });
});

router.get("/update-profile", (req, res) => {
  if (req.isAuthenticated()) {
    return res.render("auth/update-profile");
  }
  return res.redirect("/");
});
//protected API - the jsobwebtoken is the help our server to identify who you are
router.get(
  "/refresh-token",
  jwtHelper.checkRefreshTokenMiddleware,
  jwtHelper.findUserIfUserExist,
  jwtHelper.hasAuthorization,
  userController.createNewJWTAndRefreshToken
);

module.exports = router;
