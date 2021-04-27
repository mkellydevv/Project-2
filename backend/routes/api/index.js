const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const sketchesRouter = require('./sketches.js');
const sketchBooksRouter = require('./sketchBooks.js');

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/sketches', sketchesRouter);
router.use('/sketchBooks', sketchBooksRouter);

module.exports = router;
