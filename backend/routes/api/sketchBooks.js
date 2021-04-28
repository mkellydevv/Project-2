const express = require('express');
const asyncHandler = require('express-async-handler');

const { SketchBook } = require('../../db/models');

const router = express.Router();

// GET sketch book ids and the first sketch of each
router.get('/', asyncHandler(async (_req, res) => {
    const sketchBooks = await SketchBook.getSketchBookCovers();
    return res.json(sketchBooks);
}));

module.exports = router;
