const express = require('express');
const asyncHandler = require('express-async-handler');

const { SketchBook } = require('../../db/models');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
    const sketchBooks = await SketchBook.getAllSketchBooks();
    return res.json(sketches);
}));

module.exports = router;
