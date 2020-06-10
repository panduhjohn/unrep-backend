const express = require("express");
const router = express.Router();
const zomato = require("zomato-api");
var client = zomato({
  userKey: "fb9d5a554cb6d6c311ba78c5a408496c",
});

/* GET home page. */
router.get("/", function (req, res, next) {
  client
    .search({ q: "bar", entity_id: "280", entity_type: "city" })
    .then((res) => {
      return res.restaurants;
    })
    .then((result) => {
      let list = [];
      result.forEach((place) => {
        console.log(place.restaurant.name);
        list.push(place.restaurant);
      });
      res.send(list.slice(0, 1));
      // console.log(result[0].restaurant.name);

      // res.send(result[0]);
    })
    .catch((err) => console.log("catch for getting restaurants", err));
  // res.render("index", { title: "Express" });
});

//developers.zomato.com/api/v2.1/search?entity_id=280&entity_type=city

https: module.exports = router;
