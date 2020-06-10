const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const chalk = require('chalk')
const cors = require('cors')

const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
const usersRouter = require('./routes/users/users');
const restaurantRouter = require('./routes/restaurant/restaurant');

require('dotenv').config()

mongoose
    .connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => console.log(chalk.red('Mongo DB Connected!!')))
    .catch((error) => console.log('Error in MongoDB', error));


const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
    cors({
        origin: ['http://localhost:3000'],
        credentials: true,
    })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/restaurants", restaurantRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
