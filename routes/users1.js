const express = require('express');
const router = express.Router();
const fetch = require('node-fetch')

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;

// const drinkData = () => {
//     const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=a`;

//     fetch(url)
//         .then((res) => res.json())
//         .then((data) => {
//             data.drinks.forEach(item => {
//                 console.log(item.strDrink)
//                 console.log(item.strDrinkThumb)       
//             });
//         })
//         .catch((err) => console.log('Error in fetch', err));
// };

// console.log(drinkData())
    
    