require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const commentsRouter = require('./routes/comment.route');
const eventsRouter = require('./routes/event.route');
const supportersRouter = require('./routes/supporter.route');
const usersRouter = require('./routes/user.route');
const voteRouter = require('./routes/vote.route');

// environment: development, staging, testing, production
const environment = process.env.NODE_ENV;

const app = express();

if (environment === 'development') {
  // Allow all CORS during development
  app.use(cors())
}

// Temp workaround for production
app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/comments', commentsRouter);
app.use('/events', eventsRouter);
app.use('/supporters', supportersRouter);
app.use('/users', usersRouter);
app.use('/votes', voteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
