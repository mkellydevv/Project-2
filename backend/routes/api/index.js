const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const sketchesRouter = require('./sketches.js');

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/sketches', sketchesRouter);

module.exports = router;
